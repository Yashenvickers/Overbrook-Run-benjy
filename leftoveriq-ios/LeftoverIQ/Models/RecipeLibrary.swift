import Foundation

struct RecipeIngredient: Hashable {
    /// Catalog key used for matching (see FoodCatalog).
    let key: String
    /// What the cook reads, e.g. "1 lb chicken thighs".
    let text: String
}

struct Recipe: Identifiable, Hashable {
    let id: String
    let name: String
    let emoji: String
    let minutes: Int
    let vegetarian: Bool
    let dairyFree: Bool
    let featured: Bool
    let ingredients: [RecipeIngredient]
    let steps: [String]

    var isQuick: Bool { minutes <= 30 }
    var keys: [String] { ingredients.map(\.key) }

    var shareText: String {
        let ing = ingredients.map { "• \($0.text)" }.joined(separator: "\n")
        let st = steps.enumerated().map { "\($0.offset + 1). \($0.element)" }.joined(separator: "\n")
        return "\(name) (\(minutes) min)\n\nIngredients:\n\(ing)\n\nSteps:\n\(st)\n\nShared from LeftoverIQ"
    }
}

private func ing(_ pairs: [(String, String)]) -> [RecipeIngredient] {
    pairs.map { RecipeIngredient(key: $0.0, text: $0.1) }
}

/// Built-in recipe collection. Salt, pepper and cooking oil are assumed pantry staples and not tracked.
enum RecipeLibrary {
    static let all: [Recipe] = [
        Recipe(id: "chicken-spinach-skillet", name: "Creamy Chicken & Spinach Skillet", emoji: "🍗", minutes: 25,
               vegetarian: false, dairyFree: false, featured: true,
               ingredients: ing([("chicken", "1 lb chicken thighs, sliced"), ("spinach", "3 big handfuls spinach"),
                                 ("cream", "½ cup cream"), ("garlic", "2 cloves garlic, minced"), ("cheese", "¼ cup grated parmesan")]),
               steps: ["Season chicken with salt and pepper; brown in an oiled skillet over medium-high heat, 6–7 minutes.",
                       "Add garlic and cook 30 seconds.",
                       "Pour in cream and simmer until slightly thick, 3 minutes.",
                       "Stir in spinach until wilted, then the cheese. Serve over rice or pasta."]),
        Recipe(id: "veggie-fried-rice", name: "Veggie Fried Rice", emoji: "🍚", minutes: 20,
               vegetarian: true, dairyFree: true, featured: false,
               ingredients: ing([("rice", "3 cups cooked rice (day-old is best)"), ("egg", "2 eggs"),
                                 ("frozen vegetables", "1 cup frozen mixed vegetables"), ("onion", "1 small onion, diced"),
                                 ("garlic", "2 cloves garlic"), ("soy sauce", "2 tbsp soy sauce")]),
               steps: ["Fry onion and garlic in oil until soft.", "Add vegetables and cook 3 minutes.",
                       "Push aside, scramble the eggs, then mix in.", "Add rice and soy sauce; fry until hot and slightly crisp."]),
        Recipe(id: "potato-frittata", name: "Loaded Potato Frittata", emoji: "🥔", minutes: 25,
               vegetarian: true, dairyFree: false, featured: true,
               ingredients: ing([("egg", "6 eggs"), ("potato", "2 potatoes, thinly sliced"), ("onion", "1 onion, sliced"),
                                 ("bell pepper", "1 bell pepper, diced"), ("cheese", "½ cup shredded cheese")]),
               steps: ["Cook potatoes and onion in an oven-safe pan with oil until tender, 10 minutes.",
                       "Add pepper for 2 minutes.", "Pour in beaten, seasoned eggs and top with cheese.",
                       "Cook 3 minutes, then broil until set and golden, 3–4 minutes."]),
        Recipe(id: "spinach-tomato-pasta", name: "Spinach & Tomato Pasta", emoji: "🍝", minutes: 20,
               vegetarian: true, dairyFree: false, featured: false,
               ingredients: ing([("pasta", "8 oz pasta"), ("spinach", "2 handfuls spinach"), ("tomato", "2 cups cherry tomatoes"),
                                 ("garlic", "3 cloves garlic"), ("cheese", "Parmesan to serve")]),
               steps: ["Boil pasta in salted water; save ½ cup pasta water.", "Sauté garlic and tomatoes in oil until blistered.",
                       "Add spinach, pasta and a splash of pasta water; toss.", "Finish with cheese."]),
        Recipe(id: "black-bean-tacos", name: "Black Bean Tacos", emoji: "🌮", minutes: 15,
               vegetarian: true, dairyFree: true, featured: false,
               ingredients: ing([("tortilla", "6 small tortillas"), ("beans", "1 can black beans, drained"), ("onion", "½ onion, diced"),
                                 ("bell pepper", "1 bell pepper, sliced"), ("avocado", "1 avocado"), ("lemon", "1 lime or lemon")]),
               steps: ["Cook onion and pepper in oil until soft.", "Add beans with a pinch of salt and cumin if you have it; warm through.",
                       "Warm tortillas.", "Fill with beans, sliced avocado and a squeeze of citrus."]),
        Recipe(id: "sheet-pan-salmon", name: "Sheet-Pan Salmon & Broccoli", emoji: "🐟", minutes: 25,
               vegetarian: false, dairyFree: true, featured: true,
               ingredients: ing([("salmon", "2 salmon fillets"), ("broccoli", "1 head broccoli, in florets"),
                                 ("lemon", "1 lemon"), ("garlic", "2 cloves garlic, minced")]),
               steps: ["Heat oven to 425°F / 220°C.", "Toss broccoli with oil, garlic, salt and pepper on a sheet pan; roast 8 minutes.",
                       "Add seasoned salmon; roast 10–12 minutes more.", "Squeeze lemon over everything."]),
        Recipe(id: "black-bean-chili", name: "Black Bean Chili", emoji: "🍲", minutes: 40,
               vegetarian: true, dairyFree: true, featured: false,
               ingredients: ing([("beans", "2 cans beans"), ("canned tomatoes", "1 can diced tomatoes"), ("onion", "1 onion"),
                                 ("bell pepper", "1 bell pepper"), ("garlic", "3 cloves garlic"), ("broth", "1 cup broth")]),
               steps: ["Sauté onion, pepper and garlic in oil.", "Add chili powder or spices you like; cook 1 minute.",
                       "Add beans, tomatoes and broth; simmer 25 minutes.", "Season and serve with any toppings."]),
        Recipe(id: "banana-oat-pancakes", name: "Banana Oat Pancakes", emoji: "🥞", minutes: 15,
               vegetarian: true, dairyFree: false, featured: false,
               ingredients: ing([("banana", "2 ripe bananas"), ("oats", "1 cup oats"), ("egg", "2 eggs"), ("milk", "¼ cup milk")]),
               steps: ["Blend or mash everything into a batter.", "Rest 5 minutes.", "Cook small pancakes in a buttered or oiled pan, 2 minutes per side."]),
        Recipe(id: "chicken-veggie-soup", name: "Chicken Vegetable Soup", emoji: "🥣", minutes: 40,
               vegetarian: false, dairyFree: true, featured: false,
               ingredients: ing([("chicken", "1 lb chicken"), ("carrot", "2 carrots"), ("celery", "2 celery stalks"),
                                 ("onion", "1 onion"), ("broth", "6 cups broth"), ("pasta", "1 cup small pasta")]),
               steps: ["Sauté diced onion, carrot and celery in oil, 5 minutes.", "Add broth and chicken; simmer 20 minutes.",
                       "Remove chicken, shred, and return.", "Add pasta and cook until tender."]),
        Recipe(id: "mushroom-omelette", name: "Mushroom & Herb Omelette", emoji: "🍳", minutes: 10,
               vegetarian: true, dairyFree: false, featured: false,
               ingredients: ing([("egg", "3 eggs"), ("mushroom", "1 cup sliced mushrooms"), ("cheese", "2 tbsp cheese"), ("herbs", "Chopped herbs")]),
               steps: ["Cook mushrooms in a little oil until browned; set aside.", "Pour beaten eggs into the pan; swirl.",
                       "When nearly set, add mushrooms, cheese and herbs; fold and serve."]),
        Recipe(id: "beef-broccoli", name: "Beef & Broccoli", emoji: "🥩", minutes: 25,
               vegetarian: false, dairyFree: true, featured: false,
               ingredients: ing([("beef", "1 lb thinly sliced beef"), ("broccoli", "1 head broccoli"), ("soy sauce", "3 tbsp soy sauce"),
                                 ("garlic", "2 cloves garlic"), ("ginger", "1 tsp grated ginger"), ("rice", "Rice to serve")]),
               steps: ["Sear beef in a hot oiled pan in batches; set aside.", "Stir-fry broccoli 3 minutes with a splash of water.",
                       "Add garlic, ginger, soy sauce and beef; toss 1 minute.", "Serve over rice."]),
        Recipe(id: "zucchini-corn-quesadillas", name: "Zucchini & Corn Quesadillas", emoji: "🫓", minutes: 15,
               vegetarian: true, dairyFree: false, featured: false,
               ingredients: ing([("tortilla", "4 tortillas"), ("zucchini", "1 zucchini, grated"), ("corn", "½ cup corn"), ("cheese", "1 cup shredded cheese")]),
               steps: ["Cook zucchini and corn until dry, 4 minutes.", "Fill tortillas with veg and cheese; fold.",
                       "Toast in a dry pan until golden on both sides."]),
        Recipe(id: "garlic-shrimp-noodles", name: "Garlic Butter Shrimp Noodles", emoji: "🦐", minutes: 20,
               vegetarian: false, dairyFree: false, featured: false,
               ingredients: ing([("shrimp", "1 lb shrimp"), ("pasta", "8 oz noodles"), ("garlic", "4 cloves garlic"),
                                 ("butter", "3 tbsp butter"), ("lemon", "½ lemon")]),
               steps: ["Cook noodles.", "Melt butter, add garlic, then shrimp; cook until pink, 3 minutes.",
                       "Toss in noodles and lemon juice; season."]),
        Recipe(id: "chickpea-curry", name: "Coconut Chickpea Curry", emoji: "🍛", minutes: 30,
               vegetarian: true, dairyFree: true, featured: true,
               ingredients: ing([("beans", "1 can chickpeas"), ("coconut milk", "1 can coconut milk"), ("onion", "1 onion"),
                                 ("garlic", "2 cloves garlic"), ("ginger", "1 tbsp ginger"), ("spinach", "2 handfuls spinach"), ("rice", "Rice to serve")]),
               steps: ["Sauté onion, garlic and ginger.", "Add curry powder or spices; cook 1 minute.",
                       "Add chickpeas and coconut milk; simmer 15 minutes.", "Stir in spinach and serve over rice."]),
        Recipe(id: "leftover-veg-pasta-bake", name: "Leftover-Veg Pasta Bake", emoji: "🧀", minutes: 40,
               vegetarian: true, dairyFree: false, featured: true,
               ingredients: ing([("pasta", "12 oz pasta"), ("canned tomatoes", "1 jar or can tomato sauce"), ("cheese", "1½ cups cheese"),
                                 ("zucchini", "1 zucchini"), ("bell pepper", "1 bell pepper"), ("onion", "1 onion")]),
               steps: ["Heat oven to 400°F / 200°C; undercook pasta by 2 minutes.", "Sauté chopped vegetables until soft.",
                       "Mix pasta, vegetables and sauce in a baking dish; top with cheese.", "Bake 20 minutes until bubbling."]),
        Recipe(id: "berry-parfait", name: "Berry Yogurt Parfait", emoji: "🍓", minutes: 5,
               vegetarian: true, dairyFree: false, featured: false,
               ingredients: ing([("yogurt", "1 cup yogurt"), ("berries", "1 cup berries"), ("oats", "¼ cup oats or granola"), ("honey", "Drizzle of honey")]),
               steps: ["Layer yogurt, berries and oats in a glass.", "Drizzle with honey."]),
        Recipe(id: "peanut-noodles", name: "Spicy Peanut Noodles", emoji: "🥜", minutes: 20,
               vegetarian: true, dairyFree: true, featured: false,
               ingredients: ing([("pasta", "8 oz noodles"), ("peanut butter", "3 tbsp peanut butter"), ("soy sauce", "2 tbsp soy sauce"),
                                 ("carrot", "1 carrot, shredded"), ("cucumber", "½ cucumber"), ("garlic", "1 clove garlic")]),
               steps: ["Cook noodles; rinse under cold water.", "Whisk peanut butter, soy sauce, garlic and hot water into a sauce; add chili if you like.",
                       "Toss noodles with sauce, carrot and cucumber."]),
        Recipe(id: "clean-out-grain-bowl", name: "Fridge Clean-Out Grain Bowl", emoji: "🥗", minutes: 15,
               vegetarian: true, dairyFree: true, featured: true,
               ingredients: ing([("rice", "2 cups cooked rice"), ("beans", "1 can beans"), ("avocado", "1 avocado"),
                                 ("tomato", "1 tomato"), ("lettuce", "Greens"), ("lemon", "1 lemon")]),
               steps: ["Warm rice and beans.", "Chop vegetables.", "Build bowls and dress with lemon, oil and salt."]),
        Recipe(id: "french-toast", name: "French Toast", emoji: "🍞", minutes: 15,
               vegetarian: true, dairyFree: false, featured: false,
               ingredients: ing([("bread", "4 slices bread (stale is fine)"), ("egg", "2 eggs"), ("milk", "½ cup milk"), ("butter", "Butter for the pan")]),
               steps: ["Whisk eggs and milk with a pinch of cinnamon if you have it.", "Soak bread briefly.",
                       "Cook in butter until golden, 2–3 minutes per side."]),
        Recipe(id: "sweet-potato-hash", name: "Sweet Potato & Bean Hash", emoji: "🍠", minutes: 30,
               vegetarian: true, dairyFree: true, featured: false,
               ingredients: ing([("sweet potato", "2 sweet potatoes, diced"), ("beans", "1 can black beans"), ("onion", "1 onion"),
                                 ("bell pepper", "1 bell pepper"), ("egg", "2–4 eggs")]),
               steps: ["Cook sweet potato in oil, covered, 10 minutes.", "Add onion and pepper; cook until browned.",
                       "Stir in beans; make wells and crack in eggs.", "Cover until eggs are set."]),
        Recipe(id: "chicken-wrap", name: "Chicken Caesar-Style Wrap", emoji: "🌯", minutes: 15,
               vegetarian: false, dairyFree: false, featured: false,
               ingredients: ing([("chicken", "2 cups cooked chicken"), ("tortilla", "2 large tortillas"), ("lettuce", "Romaine"),
                                 ("cheese", "Parmesan"), ("lemon", "½ lemon")]),
               steps: ["Toss chicken and lettuce with lemon, oil, salt and cheese.", "Fill tortillas and roll tightly."]),
        Recipe(id: "apple-oatmeal", name: "Apple Cinnamon Oatmeal", emoji: "🍎", minutes: 10,
               vegetarian: true, dairyFree: false, featured: false,
               ingredients: ing([("oats", "1 cup oats"), ("apple", "1 apple, diced"), ("milk", "2 cups milk"), ("honey", "Honey to taste")]),
               steps: ["Simmer oats, apple and milk, stirring, 5–7 minutes.", "Sweeten with honey and a pinch of cinnamon."]),
    ]

    static func recipe(id: String) -> Recipe? { all.first { $0.id == id } }
}
