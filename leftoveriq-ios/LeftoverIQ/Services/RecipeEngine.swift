import Foundation

struct Preferences {
    var vegetarian = false
    var dairyFree = false
    var quick = false
}

struct RecipeSuggestion: Identifiable {
    let recipe: Recipe
    let have: [String]
    let missing: [String]
    /// Missing ingredients that can be covered with a swap from the user's kitchen.
    let swappable: [String]
    let expiringUsed: [String]
    let score: Double

    var id: String { recipe.id }
    var canMakeNow: Bool { missing.count == swappable.count }
}

/// Ranks recipes by how well they use what's on hand, especially items that expire soon,
/// and by what the user has cooked before.
enum RecipeEngine {
    static func suggestions(have: Set<String>,
                            expiring: Set<String>,
                            preferences: Preferences,
                            cookedCounts: [String: Int]) -> [RecipeSuggestion] {
        RecipeLibrary.all
            .filter { r in
                (!preferences.vegetarian || r.vegetarian) &&
                (!preferences.dairyFree || r.dairyFree) &&
                (!preferences.quick || r.isQuick)
            }
            .map { r in
                let keys = Array(NSOrderedSet(array: r.keys)) as? [String] ?? r.keys
                let haveKeys = keys.filter { have.contains($0) }
                let missing = keys.filter { !have.contains($0) }
                let swappable = missing.filter { Substitutions.bestAvailable(for: $0, have: have) != nil }
                let expiringUsed = haveKeys.filter { expiring.contains($0) }
                let coverage = Double(haveKeys.count + swappable.count) / Double(max(keys.count, 1))
                let cooked = Double(min(cookedCounts[r.id] ?? 0, 5))
                let score = coverage * 100
                    + Double(expiringUsed.count) * 20
                    + cooked * 3
                    - Double(missing.count - swappable.count) * 4
                return RecipeSuggestion(recipe: r, have: haveKeys, missing: missing, swappable: swappable,
                                        expiringUsed: expiringUsed, score: score)
            }
            .sorted { $0.score > $1.score }
    }
}
