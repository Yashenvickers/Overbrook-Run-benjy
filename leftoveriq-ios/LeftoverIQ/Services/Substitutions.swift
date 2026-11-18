import Foundation

struct Substitution: Hashable {
    /// What to use instead, e.g. "Greek yogurt (same amount)".
    let text: String
    /// Catalog keys this swap needs. Empty means it only uses common pantry staples.
    let needs: [String]
}

enum Substitutions {
    static let table: [String: [Substitution]] = [
        "milk": [Substitution(text: "Yogurt thinned with a little water", needs: ["yogurt"]),
                 Substitution(text: "Coconut milk", needs: ["coconut milk"]),
                 Substitution(text: "Water plus 1 tbsp butter per cup (for baking)", needs: ["butter"])],
        "cream": [Substitution(text: "Milk plus 2 tbsp melted butter per cup", needs: ["milk", "butter"]),
                  Substitution(text: "Coconut milk", needs: ["coconut milk"]),
                  Substitution(text: "Yogurt stirred in off the heat", needs: ["yogurt"])],
        "sour cream": [Substitution(text: "Plain yogurt (same amount)", needs: ["yogurt"])],
        "yogurt": [Substitution(text: "Sour cream (same amount)", needs: ["sour cream"])],
        "butter": [Substitution(text: "Cooking oil (use about ¾ the amount)", needs: [])],
        "egg": [Substitution(text: "½ mashed banana per egg (baking and pancakes)", needs: ["banana"]),
                Substitution(text: "1 tbsp ground flax + 3 tbsp water per egg", needs: [])],
        "cheese": [Substitution(text: "Skip it and finish with extra salt, lemon and herbs", needs: [])],
        "spinach": [Substitution(text: "Chopped greens or kale", needs: ["lettuce"]),
                    Substitution(text: "Frozen vegetables", needs: ["frozen vegetables"]),
                    Substitution(text: "Chopped broccoli", needs: ["broccoli"])],
        "lettuce": [Substitution(text: "Spinach", needs: ["spinach"]), Substitution(text: "Shredded cabbage", needs: ["cabbage"])],
        "lemon": [Substitution(text: "½ tsp vinegar per tbsp of juice", needs: [])],
        "rice": [Substitution(text: "Pasta or noodles", needs: ["pasta"]), Substitution(text: "Bread on the side", needs: ["bread"])],
        "pasta": [Substitution(text: "Rice", needs: ["rice"])],
        "tortilla": [Substitution(text: "Bread, toasted", needs: ["bread"])],
        "bread": [Substitution(text: "Tortillas", needs: ["tortilla"])],
        "chicken": [Substitution(text: "Tofu", needs: ["tofu"]), Substitution(text: "Beans or chickpeas", needs: ["beans"]),
                    Substitution(text: "Shrimp", needs: ["shrimp"])],
        "beef": [Substitution(text: "Mushrooms, well browned", needs: ["mushroom"]), Substitution(text: "Beans", needs: ["beans"]),
                 Substitution(text: "Pork", needs: ["pork"])],
        "salmon": [Substitution(text: "Chicken (cook through)", needs: ["chicken"]), Substitution(text: "Shrimp", needs: ["shrimp"])],
        "shrimp": [Substitution(text: "Chicken, sliced thin", needs: ["chicken"]), Substitution(text: "Tofu", needs: ["tofu"])],
        "broth": [Substitution(text: "Water plus 1 tbsp soy sauce per cup", needs: ["soy sauce"]),
                  Substitution(text: "Water with extra salt and herbs", needs: [])],
        "onion": [Substitution(text: "Extra garlic", needs: ["garlic"]), Substitution(text: "Celery for the base", needs: ["celery"])],
        "garlic": [Substitution(text: "¼ tsp garlic powder per clove", needs: [])],
        "bell pepper": [Substitution(text: "Zucchini", needs: ["zucchini"]), Substitution(text: "Carrot", needs: ["carrot"])],
        "zucchini": [Substitution(text: "Bell pepper", needs: ["bell pepper"]), Substitution(text: "Eggplant", needs: ["eggplant"])],
        "potato": [Substitution(text: "Sweet potato", needs: ["sweet potato"])],
        "sweet potato": [Substitution(text: "Potato", needs: ["potato"])],
        "tomato": [Substitution(text: "Canned tomatoes", needs: ["canned tomatoes"])],
        "canned tomatoes": [Substitution(text: "Fresh tomatoes, chopped and simmered", needs: ["tomato"])],
        "herbs": [Substitution(text: "Dried herbs (⅓ the amount)", needs: [])],
        "coconut milk": [Substitution(text: "Cream", needs: ["cream"]), Substitution(text: "Yogurt, stirred in off the heat", needs: ["yogurt"])],
        "soy sauce": [Substitution(text: "Salt plus a splash of vinegar", needs: [])],
        "honey": [Substitution(text: "Sugar or maple syrup", needs: [])],
        "ginger": [Substitution(text: "¼ tsp ground ginger per tbsp fresh", needs: [])],
        "berries": [Substitution(text: "Banana slices", needs: ["banana"]), Substitution(text: "Diced apple", needs: ["apple"])],
        "banana": [Substitution(text: "Grated apple", needs: ["apple"])],
        "oats": [Substitution(text: "Crumbled toast or flour (in pancakes)", needs: ["flour"])],
        "beans": [Substitution(text: "Lentils or chickpeas, any canned bean works", needs: [])],
        "corn": [Substitution(text: "Frozen vegetables", needs: ["frozen vegetables"])],
        "frozen vegetables": [Substitution(text: "Any chopped fresh vegetables", needs: [])],
        "mushroom": [Substitution(text: "Zucchini", needs: ["zucchini"])],
        "apple": [Substitution(text: "Banana", needs: ["banana"]), Substitution(text: "Berries", needs: ["berries"])],
        "carrot": [Substitution(text: "Celery", needs: ["celery"]), Substitution(text: "Bell pepper", needs: ["bell pepper"])],
        "broccoli": [Substitution(text: "Frozen vegetables", needs: ["frozen vegetables"]), Substitution(text: "Zucchini", needs: ["zucchini"]),
                     Substitution(text: "Spinach, added at the end", needs: ["spinach"])],
        "celery": [Substitution(text: "Carrot", needs: ["carrot"]), Substitution(text: "Onion", needs: ["onion"])],
        "cucumber": [Substitution(text: "Shredded carrot", needs: ["carrot"]), Substitution(text: "Shredded cabbage", needs: ["cabbage"])],
        "peanut butter": [Substitution(text: "Any nut or seed butter", needs: [])],
        "avocado": [Substitution(text: "A spoon of yogurt or sour cream", needs: ["yogurt"]), Substitution(text: "Skip it and add extra lemon", needs: [])],
    ]

    /// Swaps for a missing ingredient, with the ones the user can make right now listed first.
    static func options(for key: String, have: Set<String>) -> [SubstitutionOption] {
        (table[key] ?? [])
            .map { SubstitutionOption(substitution: $0, available: $0.needs.allSatisfy { have.contains($0) }) }
            .sorted { $0.available && !$1.available }
    }

    static func bestAvailable(for key: String, have: Set<String>) -> Substitution? {
        options(for: key, have: have).first(where: { $0.available })?.substitution
    }
}

struct SubstitutionOption: Hashable, Identifiable {
    let substitution: Substitution
    let available: Bool
    var id: String { substitution.text }
}
