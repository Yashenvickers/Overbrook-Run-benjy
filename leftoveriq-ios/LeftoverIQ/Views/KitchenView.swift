import SwiftUI
import SwiftData

struct KitchenView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \FoodItem.expiresOn) private var items: [FoodItem]
    @AppStorage(SettingsKeys.usedInTimeCount) private var usedCount = 0
    @AppStorage(SettingsKeys.tossedCount) private var tossedCount = 0

    @State private var filter: StorageLocation?
    @State private var search = ""
    @State private var showingAdd = false
    @State private var editing: FoodItem?

    private var filtered: [FoodItem] {
        items.filter { item in
            (filter == nil || item.location == filter) &&
            (search.isEmpty || item.name.localizedCaseInsensitiveContains(search))
        }
    }
    private var useSoon: [FoodItem] { filtered.filter { $0.daysLeft <= 3 } }
    private var later: [FoodItem] { filtered.filter { $0.daysLeft > 3 } }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Picker("Location", selection: $filter) {
                        Text("All (\(items.count))").tag(StorageLocation?.none)
                        ForEach(StorageLocation.allCases) { loc in
                            Text(loc.title).tag(StorageLocation?.some(loc))
                        }
                    }
                    .pickerStyle(.segmented)
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())

                if items.isEmpty {
                    Section {
                        ContentUnavailableView {
                            Label("Your kitchen is empty", systemImage: "refrigerator")
                        } description: {
                            Text("Add what's in your fridge, freezer and pantry, or check off a shopping trip to stock it automatically.")
                        } actions: {
                            Button("Add an item") { showingAdd = true }
                                .buttonStyle(.borderedProminent)
                            Button("Try with sample items") { SampleData.load(into: context) }
                        }
                    }
                }

                if !useSoon.isEmpty {
                    Section {
                        ForEach(useSoon) { row($0) }
                    } header: {
                        Label("Use soon", systemImage: "clock.badge.exclamationmark")
                    }
                }

                if !later.isEmpty {
                    Section("Everything else") {
                        ForEach(later) { row($0) }
                    }
                }

                if usedCount + tossedCount > 0 {
                    Section {
                        Label("\(usedCount) used in time · \(tossedCount) tossed", systemImage: "leaf")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .searchable(text: $search, prompt: "Search your kitchen")
            .navigationTitle("My Kitchen")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingAdd = true } label: { Label("Add item", systemImage: "plus") }
                }
            }
            .sheet(isPresented: $showingAdd) { FoodItemEditor(item: nil) }
            .sheet(item: $editing) { item in FoodItemEditor(item: item) }
        }
    }

    private func row(_ item: FoodItem) -> some View {
        Button { editing = item } label: { FoodRow(item: item) }
            .buttonStyle(.plain)
            .swipeActions(edge: .trailing) {
                Button(role: .destructive) { remove(item, used: false) } label: { Label("Tossed", systemImage: "trash") }
                Button { remove(item, used: true) } label: { Label("Used", systemImage: "checkmark") }
                    .tint(.green)
            }
    }

    private func remove(_ item: FoodItem, used: Bool) {
        if used { usedCount += 1 } else { tossedCount += 1 }
        ReminderScheduler.cancel(for: item)
        context.delete(item)
    }
}

struct FoodItemEditor: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    let item: FoodItem?

    @State private var name = ""
    @State private var quantity = ""
    @State private var location: StorageLocation = .fridge
    @State private var expiresOn = Calendar.current.date(byAdding: .day, value: 7, to: Date()) ?? Date()
    @State private var userEditedDetails = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Item name, e.g. Spinach", text: $name)
                        .textInputAutocapitalization(.words)
                    TextField("Quantity (optional)", text: $quantity)
                }
                Section {
                    Picker("Stored in", selection: $location) {
                        ForEach(StorageLocation.allCases) { Label($0.title, systemImage: $0.symbol).tag($0) }
                    }
                    DatePicker("Expected to expire", selection: $expiresOn, displayedComponents: .date)
                } footer: {
                    Text("LeftoverIQ suggests a typical date based on the item. Always check the package and use your judgment.")
                }
                if item != nil {
                    Section {
                        Button("Remove from kitchen", role: .destructive) {
                            if let item {
                                ReminderScheduler.cancel(for: item)
                                context.delete(item)
                            }
                            dismiss()
                        }
                    }
                }
            }
            .navigationTitle(item == nil ? "Add item" : "Edit item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save", action: save)
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear(perform: load)
            .onChange(of: name) { _, newValue in
                guard item == nil, !userEditedDetails else { return }
                location = FoodCatalog.suggestedLocation(for: newValue)
                expiresOn = FoodCatalog.suggestedExpiry(for: newValue, location: location)
            }
        }
    }

    private func load() {
        guard let item else { return }
        name = item.name
        quantity = item.quantity
        location = item.location
        expiresOn = item.expiresOn
        userEditedDetails = true
    }

    private func save() {
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        if let item {
            item.name = trimmed
            item.quantity = quantity
            item.location = location
            item.expiresOn = expiresOn
            ReminderScheduler.schedule(for: item)
        } else {
            let newItem = FoodItem(name: trimmed, quantity: quantity, location: location, expiresOn: expiresOn)
            context.insert(newItem)
            ReminderScheduler.schedule(for: newItem)
        }
        dismiss()
    }
}
