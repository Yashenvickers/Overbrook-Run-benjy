import SwiftUI
import SwiftData

struct CommunityView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \UserRecipe.createdOn, order: .reverse) private var myRecipes: [UserRecipe]
    @State private var showingNew = false

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(RecipeLibrary.all.filter(\.featured)) { recipe in
                        NavigationLink(value: recipe) {
                            HStack(spacing: 12) {
                                Text(recipe.emoji).font(.title)
                                VStack(alignment: .leading) {
                                    Text(recipe.name).font(.body.weight(.semibold))
                                    Text("\(recipe.minutes) min · \(recipe.ingredients.count) ingredients")
                                        .font(.caption).foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                } header: {
                    Text("Kitchen picks")
                } footer: {
                    Text("Favorites built for turning everyday leftovers into dinner.")
                }

                Section {
                    if myRecipes.isEmpty {
                        Button { showingNew = true } label: {
                            Label("Write your first recipe", systemImage: "square.and.pencil")
                        }
                    }
                    ForEach(myRecipes) { r in
                        NavigationLink { UserRecipeDetail(recipe: r) } label: {
                            Label(r.title, systemImage: "book.closed")
                        }
                    }
                    .onDelete { offsets in offsets.map { myRecipes[$0] }.forEach { context.delete($0) } }
                } header: {
                    Text("My recipes")
                } footer: {
                    Text("Share your recipes with friends and family by message, email or AirDrop.")
                }
            }
            .navigationTitle("Recipes")
            .navigationDestination(for: Recipe.self) { RecipeDetailView(recipe: $0) }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingNew = true } label: { Label("New recipe", systemImage: "plus") }
                }
            }
            .sheet(isPresented: $showingNew) { UserRecipeEditor() }
        }
    }
}

struct UserRecipeDetail: View {
    let recipe: UserRecipe

    var body: some View {
        List {
            Section("Ingredients") { Text(recipe.ingredients) }
            Section("Steps") { Text(recipe.steps) }
        }
        .navigationTitle(recipe.title)
        .toolbar {
            ShareLink(item: recipe.shareText) { Label("Share", systemImage: "square.and.arrow.up") }
        }
    }
}

struct UserRecipeEditor: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var ingredients = ""
    @State private var steps = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Name") { TextField("e.g. Grandma's Sunday soup", text: $title) }
                Section("Ingredients") {
                    TextEditor(text: $ingredients).frame(minHeight: 120)
                }
                Section("Steps") {
                    TextEditor(text: $steps).frame(minHeight: 160)
                }
            }
            .navigationTitle("New recipe")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        context.insert(UserRecipe(title: title.trimmingCharacters(in: .whitespaces),
                                                  ingredients: ingredients, steps: steps))
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}
