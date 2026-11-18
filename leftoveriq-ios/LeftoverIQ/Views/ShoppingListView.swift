import SwiftUI
import SwiftData

struct ShoppingListView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \GroceryItem.addedOn) private var list: [GroceryItem]
    @Query private var kitchen: [FoodItem]
    @State private var newItem = ""
    @State private var stockedMessage: String?
    @FocusState private var addFocused: Bool

    private var kitchenKeys: Set<String> { Set(kitchen.map(\.key)) }
    private var toBuy: [GroceryItem] { list.filter { !$0.isDone } }
    private var inCart: [GroceryItem] { list.filter { $0.isDone } }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        TextField("Add to list", text: $newItem)
                            .focused($addFocused)
                            .submitLabel(.done)
                            .onSubmit(add)
                        Button(action: add) { Image(systemName: "plus.circle.fill").font(.title2) }
                            .disabled(newItem.trimmingCharacters(in: .whitespaces).isEmpty)
                            .accessibilityLabel("Add")
                    }
                }

                if list.isEmpty {
                    ContentUnavailableView("Your list is empty",
                                           systemImage: "cart",
                                           description: Text("Add items here, or add missing ingredients from any recipe."))
                }

                if !toBuy.isEmpty {
                    Section("To buy") {
                        ForEach(toBuy) { row($0) }
                            .onDelete { delete(at: $0, in: toBuy) }
                    }
                }

                if !inCart.isEmpty {
                    Section {
                        ForEach(inCart) { row($0) }
                            .onDelete { delete(at: $0, in: inCart) }
                        Button {
                            stockKitchen()
                        } label: {
                            Label("Put \(inCart.count) item\(inCart.count == 1 ? "" : "s") away in my kitchen", systemImage: "tray.and.arrow.down")
                        }
                    } header: {
                        Text("In the cart")
                    } footer: {
                        Text("Checked items move to your kitchen inventory with a suggested storage spot and expiration date.")
                    }
                }
            }
            .navigationTitle("Shopping List")
            .toolbar {
                if !list.isEmpty {
                    ToolbarItem(placement: .primaryAction) {
                        ShareLink(item: list.filter { !$0.isDone }.map { "• \($0.name)" }.joined(separator: "\n")) {
                            Label("Share list", systemImage: "square.and.arrow.up")
                        }
                    }
                }
            }
            .alert("Kitchen updated", isPresented: Binding(get: { stockedMessage != nil }, set: { if !$0 { stockedMessage = nil } })) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(stockedMessage ?? "")
            }
        }
    }

    private func row(_ item: GroceryItem) -> some View {
        Button {
            item.isDone.toggle()
        } label: {
            HStack(spacing: 12) {
                Image(systemName: item.isDone ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(item.isDone ? Color.accentColor : Color.secondary)
                Text(item.emoji)
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.name)
                        .strikethrough(item.isDone)
                        .foregroundStyle(item.isDone ? .secondary : .primary)
                    if !item.isDone && kitchenKeys.contains(FoodCatalog.key(for: item.name)) {
                        Text("You may already have this at home")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    }
                }
                Spacer()
            }
        }
        .buttonStyle(.plain)
    }

    private func add() {
        let trimmed = newItem.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }
        context.insert(GroceryItem(name: trimmed))
        newItem = ""
        addFocused = true
    }

    private func delete(at offsets: IndexSet, in source: [GroceryItem]) {
        offsets.map { source[$0] }.forEach { context.delete($0) }
    }

    private func stockKitchen() {
        let items = inCart
        for g in items {
            let loc = FoodCatalog.suggestedLocation(for: g.name)
            let food = FoodItem(name: g.name, location: loc, expiresOn: FoodCatalog.suggestedExpiry(for: g.name, location: loc))
            context.insert(food)
            ReminderScheduler.schedule(for: food)
            context.delete(g)
        }
        stockedMessage = "\(items.count) item\(items.count == 1 ? "" : "s") added. Tap any item in Kitchen to adjust its date."
    }
}
