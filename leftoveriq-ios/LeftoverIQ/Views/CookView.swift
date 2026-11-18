import SwiftUI
import SwiftData

struct CookView: View {
    @Query private var kitchen: [FoodItem]
    @Query private var cooked: [CookedRecipe]
    @AppStorage(SettingsKeys.prefVegetarian) private var vegetarian = false
    @AppStorage(SettingsKeys.prefDairyFree) private var dairyFree = false
    @AppStorage(SettingsKeys.prefQuick) private var quick = false
    @State private var showingScanner = false

    private var suggestions: [RecipeSuggestion] {
        let have = Set(kitchen.map(\.key))
        let expiring = Set(kitchen.filter { $0.daysLeft <= 3 }.map(\.key))
        var counts: [String: Int] = [:]
        cooked.forEach { counts[$0.recipeID, default: 0] += 1 }
        return RecipeEngine.suggestions(have: have, expiring: expiring,
                                        preferences: Preferences(vegetarian: vegetarian, dairyFree: dairyFree, quick: quick),
                                        cookedCounts: counts)
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Button { showingScanner = true } label: {
                        HStack(spacing: 14) {
                            Image(systemName: "camera.viewfinder")
                                .font(.title)
                                .foregroundStyle(.white)
                                .frame(width: 52, height: 52)
                                .background(Color.accentColor, in: RoundedRectangle(cornerRadius: 14))
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Snap your ingredients").font(.headline)
                                Text("Take a photo and get recipe ideas").font(.subheadline).foregroundStyle(.secondary)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }

                Section {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack {
                            Toggle("Vegetarian", isOn: $vegetarian)
                            Toggle("Dairy-free", isOn: $dairyFree)
                            Toggle("30 min or less", isOn: $quick)
                        }
                        .toggleStyle(.button)
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                    }
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())

                Section {
                    if suggestions.isEmpty {
                        Text("No recipes match those filters yet.").foregroundStyle(.secondary)
                    }
                    ForEach(suggestions) { s in
                        NavigationLink(value: s.recipe) { SuggestionRow(suggestion: s) }
                    }
                } header: {
                    Text(kitchen.isEmpty ? "Recipes" : "Best matches for your kitchen")
                } footer: {
                    if kitchen.isEmpty {
                        Text("Add items to your kitchen and these will be ranked by what you already have.")
                    }
                }
            }
            .navigationTitle("What to Cook")
            .navigationDestination(for: Recipe.self) { RecipeDetailView(recipe: $0) }
            .sheet(isPresented: $showingScanner) { ScanView() }
        }
    }
}

struct SuggestionRow: View {
    let suggestion: RecipeSuggestion

    var body: some View {
        HStack(spacing: 12) {
            Text(suggestion.recipe.emoji)
                .font(.title)
                .frame(width: 48, height: 48)
                .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 12))
            VStack(alignment: .leading, spacing: 4) {
                Text(suggestion.recipe.name).font(.body.weight(.semibold))
                Text("\(suggestion.recipe.minutes) min · have \(suggestion.have.count) of \(suggestion.recipe.keys.count)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                HStack(spacing: 6) {
                    if suggestion.missing.isEmpty {
                        TagChip(text: "Nothing to buy", color: .green)
                    } else if suggestion.canMakeNow {
                        TagChip(text: "Make it with swaps", color: .green)
                    }
                    if !suggestion.expiringUsed.isEmpty {
                        TagChip(text: "Uses \(suggestion.expiringUsed.count) expiring", color: .orange)
                    }
                }
            }
        }
        .padding(.vertical, 2)
    }
}

struct RecipeDetailView: View {
    @Environment(\.modelContext) private var context
    @Query private var kitchen: [FoodItem]
    @Query private var groceries: [GroceryItem]
    let recipe: Recipe

    @State private var addedMessage: String?
    @State private var showCookedPrompt = false

    private var have: Set<String> { Set(kitchen.map(\.key)) }
    private var missing: [String] { recipe.keys.filter { !have.contains($0) } }

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text(recipe.emoji).font(.system(size: 56))
                    Text(recipe.name).font(.title2.bold())
                    HStack(spacing: 6) {
                        TagChip(text: "\(recipe.minutes) min")
                        if recipe.vegetarian { TagChip(text: "Vegetarian", color: .green) }
                        if recipe.dairyFree { TagChip(text: "Dairy-free", color: .blue) }
                    }
                }
                .padding(.vertical, 4)
            }

            Section("Ingredients") {
                ForEach(recipe.ingredients, id: \.self) { ingredient in
                    let owned = have.contains(ingredient.key)
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Image(systemName: owned ? "checkmark.circle.fill" : "circle.dashed")
                                .foregroundStyle(owned ? Color.green : Color.orange)
                            Text(ingredient.text)
                            Spacer()
                            if !owned { Text("Missing").font(.caption).foregroundStyle(.orange) }
                        }
                        if !owned {
                            ForEach(Substitutions.options(for: ingredient.key, have: have)) { option in
                                HStack(alignment: .top, spacing: 6) {
                                    Image(systemName: "arrow.triangle.swap")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text("Swap: \(option.substitution.text)")
                                        .font(.caption)
                                        .foregroundStyle(option.available ? Color.primary : Color.secondary)
                                    if option.available && !option.substitution.needs.isEmpty {
                                        TagChip(text: "In your kitchen", color: .green)
                                    }
                                }
                                .padding(.leading, 28)
                            }
                        }
                    }
                }
                if !missing.isEmpty {
                    Button {
                        addMissingToList()
                    } label: {
                        Label("Add \(missing.count) missing to shopping list", systemImage: "cart.badge.plus")
                    }
                }
            }

            Section("Steps") {
                ForEach(Array(recipe.steps.enumerated()), id: \.offset) { index, step in
                    HStack(alignment: .top, spacing: 12) {
                        Text("\(index + 1)")
                            .font(.subheadline.bold())
                            .frame(width: 26, height: 26)
                            .background(Color.accentColor.opacity(0.15), in: Circle())
                        Text(step)
                    }
                    .padding(.vertical, 2)
                }
            }

            Section {
                Button {
                    showCookedPrompt = true
                } label: {
                    Label("I cooked this", systemImage: "checkmark.seal")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .listRowBackground(Color.clear)
            } footer: {
                Text("LeftoverIQ learns what you like to cook and ranks those recipes higher.")
            }
        }
        .navigationTitle(recipe.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ShareLink(item: recipe.shareText) { Label("Share", systemImage: "square.and.arrow.up") }
        }
        .confirmationDialog("Nice! Update your kitchen?", isPresented: $showCookedPrompt, titleVisibility: .visible) {
            Button("Remove the ingredients I used") { logCooked(removeUsed: true) }
            Button("Just log that I cooked it") { logCooked(removeUsed: false) }
            Button("Cancel", role: .cancel) {}
        }
        .alert("Shopping list updated", isPresented: Binding(get: { addedMessage != nil }, set: { if !$0 { addedMessage = nil } })) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(addedMessage ?? "")
        }
    }

    private func addMissingToList() {
        let onList = Set(groceries.filter { !$0.isDone }.map { FoodCatalog.key(for: $0.name) })
        let toAdd = missing.filter { !onList.contains($0) }
        toAdd.forEach { context.insert(GroceryItem(name: FoodCatalog.displayName(forKey: $0))) }
        addedMessage = toAdd.isEmpty ? "Those items are already on your list." : "Added \(toAdd.count) item\(toAdd.count == 1 ? "" : "s")."
    }

    private func logCooked(removeUsed: Bool) {
        context.insert(CookedRecipe(recipeID: recipe.id))
        guard removeUsed else { return }
        let used = UserDefaults.standard.integer(forKey: SettingsKeys.usedInTimeCount)
        var removed = 0
        for key in Set(recipe.keys) {
            // Remove the item expiring soonest for each ingredient used.
            if let item = kitchen.filter({ $0.key == key }).min(by: { $0.expiresOn < $1.expiresOn }) {
                ReminderScheduler.cancel(for: item)
                context.delete(item)
                removed += 1
            }
        }
        UserDefaults.standard.set(used + removed, forKey: SettingsKeys.usedInTimeCount)
    }
}
