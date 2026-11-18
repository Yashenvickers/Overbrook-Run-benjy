import Foundation

/// A known ingredient: how to recognize it, where it's usually stored and how long it typically lasts.
struct FoodEntry {
    let key: String
    let keywords: [String]
    let emoji: String
    let location: StorageLocation
    /// Typical shelf life in days after purchase (a conservative estimate, not a safety guarantee).
    let shelfDays: Int

    var displayName: String { key.capitalized }
}

enum FoodCatalog {
    static let entries: [FoodEntry] = [
        FoodEntry(key: "chicken", keywords: ["chicken"], emoji: "🍗", location: .fridge, shelfDays: 2),
        FoodEntry(key: "beef", keywords: ["beef", "steak", "ground beef"], emoji: "🥩", location: .fridge, shelfDays: 3),
        FoodEntry(key: "pork", keywords: ["pork", "sausage"], emoji: "🥩", location: .fridge, shelfDays: 3),
        FoodEntry(key: "bacon", keywords: ["bacon"], emoji: "🥓", location: .fridge, shelfDays: 7),
        FoodEntry(key: "salmon", keywords: ["salmon", "fish", "tilapia", "cod"], emoji: "🐟", location: .fridge, shelfDays: 2),
        FoodEntry(key: "shrimp", keywords: ["shrimp", "prawn"], emoji: "🦐", location: .fridge, shelfDays: 2),
        FoodEntry(key: "tofu", keywords: ["tofu"], emoji: "🍱", location: .fridge, shelfDays: 5),
        FoodEntry(key: "egg", keywords: ["egg", "eggs"], emoji: "🥚", location: .fridge, shelfDays: 21),
        FoodEntry(key: "milk", keywords: ["milk"], emoji: "🥛", location: .fridge, shelfDays: 7),
        FoodEntry(key: "butter", keywords: ["butter"], emoji: "🧈", location: .fridge, shelfDays: 30),
        FoodEntry(key: "cheese", keywords: ["cheese", "cheddar", "mozzarella", "parmesan", "feta"], emoji: "🧀", location: .fridge, shelfDays: 21),
        FoodEntry(key: "yogurt", keywords: ["yogurt", "yoghurt"], emoji: "🥣", location: .fridge, shelfDays: 10),
        FoodEntry(key: "cream", keywords: ["cream", "heavy cream", "half and half"], emoji: "🥛", location: .fridge, shelfDays: 7),
        FoodEntry(key: "sour cream", keywords: ["sour cream"], emoji: "🥣", location: .fridge, shelfDays: 14),
        FoodEntry(key: "spinach", keywords: ["spinach"], emoji: "🥬", location: .fridge, shelfDays: 5),
        FoodEntry(key: "lettuce", keywords: ["lettuce", "romaine", "salad", "greens", "kale"], emoji: "🥬", location: .fridge, shelfDays: 5),
        FoodEntry(key: "broccoli", keywords: ["broccoli"], emoji: "🥦", location: .fridge, shelfDays: 5),
        FoodEntry(key: "carrot", keywords: ["carrot"], emoji: "🥕", location: .fridge, shelfDays: 21),
        FoodEntry(key: "celery", keywords: ["celery"], emoji: "🥬", location: .fridge, shelfDays: 14),
        FoodEntry(key: "cabbage", keywords: ["cabbage"], emoji: "🥬", location: .fridge, shelfDays: 21),
        FoodEntry(key: "bell pepper", keywords: ["pepper", "peppers", "bell pepper"], emoji: "🫑", location: .fridge, shelfDays: 7),
        FoodEntry(key: "tomato", keywords: ["tomato", "tomatoes"], emoji: "🍅", location: .fridge, shelfDays: 5),
        FoodEntry(key: "canned tomatoes", keywords: ["canned tomato", "diced tomato", "crushed tomato", "tomato sauce", "marinara"], emoji: "🥫", location: .pantry, shelfDays: 365),
        FoodEntry(key: "onion", keywords: ["onion", "shallot", "scallion"], emoji: "🧅", location: .pantry, shelfDays: 30),
        FoodEntry(key: "garlic", keywords: ["garlic"], emoji: "🧄", location: .pantry, shelfDays: 30),
        FoodEntry(key: "potato", keywords: ["potato", "potatoes"], emoji: "🥔", location: .pantry, shelfDays: 30),
        FoodEntry(key: "sweet potato", keywords: ["sweet potato", "yam"], emoji: "🍠", location: .pantry, shelfDays: 21),
        FoodEntry(key: "eggplant", keywords: ["eggplant", "aubergine"], emoji: "🍆", location: .fridge, shelfDays: 5),
        FoodEntry(key: "mushroom", keywords: ["mushroom"], emoji: "🍄", location: .fridge, shelfDays: 5),
        FoodEntry(key: "zucchini", keywords: ["zucchini", "courgette", "squash"], emoji: "🥒", location: .fridge, shelfDays: 5),
        FoodEntry(key: "cucumber", keywords: ["cucumber"], emoji: "🥒", location: .fridge, shelfDays: 7),
        FoodEntry(key: "corn", keywords: ["corn"], emoji: "🌽", location: .fridge, shelfDays: 5),
        FoodEntry(key: "avocado", keywords: ["avocado"], emoji: "🥑", location: .pantry, shelfDays: 4),
        FoodEntry(key: "lemon", keywords: ["lemon", "lime"], emoji: "🍋", location: .fridge, shelfDays: 21),
        FoodEntry(key: "apple", keywords: ["apple"], emoji: "🍎", location: .fridge, shelfDays: 30),
        FoodEntry(key: "banana", keywords: ["banana"], emoji: "🍌", location: .pantry, shelfDays: 5),
        FoodEntry(key: "berries", keywords: ["berries", "berry", "strawberr", "blueberr", "raspberr"], emoji: "🍓", location: .fridge, shelfDays: 4),
        FoodEntry(key: "herbs", keywords: ["herbs", "cilantro", "parsley", "basil"], emoji: "🌿", location: .fridge, shelfDays: 5),
        FoodEntry(key: "ginger", keywords: ["ginger"], emoji: "🫚", location: .fridge, shelfDays: 21),
        FoodEntry(key: "rice", keywords: ["rice"], emoji: "🍚", location: .pantry, shelfDays: 365),
        FoodEntry(key: "pasta", keywords: ["pasta", "spaghetti", "penne", "noodle", "macaroni", "linguine"], emoji: "🍝", location: .pantry, shelfDays: 365),
        FoodEntry(key: "bread", keywords: ["bread", "sourdough", "baguette", "loaf", "bagel"], emoji: "🍞", location: .pantry, shelfDays: 5),
        FoodEntry(key: "tortilla", keywords: ["tortilla", "wrap"], emoji: "🫓", location: .pantry, shelfDays: 14),
        FoodEntry(key: "flour", keywords: ["flour"], emoji: "🌾", location: .pantry, shelfDays: 180),
        FoodEntry(key: "oats", keywords: ["oat", "oats", "oatmeal"], emoji: "🥣", location: .pantry, shelfDays: 365),
        FoodEntry(key: "beans", keywords: ["beans", "bean", "chickpea", "lentil"], emoji: "🫘", location: .pantry, shelfDays: 365),
        FoodEntry(key: "peanut butter", keywords: ["peanut butter", "peanut"], emoji: "🥜", location: .pantry, shelfDays: 90),
        FoodEntry(key: "frozen vegetables", keywords: ["frozen veg", "mixed veg", "peas", "frozen vegetables"], emoji: "🥦", location: .freezer, shelfDays: 180),
        FoodEntry(key: "broth", keywords: ["broth", "stock"], emoji: "🍲", location: .pantry, shelfDays: 365),
        FoodEntry(key: "coconut milk", keywords: ["coconut milk", "coconut"], emoji: "🥥", location: .pantry, shelfDays: 365),
        FoodEntry(key: "soy sauce", keywords: ["soy sauce", "soy"], emoji: "🍶", location: .pantry, shelfDays: 365),
        FoodEntry(key: "honey", keywords: ["honey"], emoji: "🍯", location: .pantry, shelfDays: 365),
    ]

    /// Finds the best catalog match for free text, preferring the longest matching keyword
    /// (so "sour cream" beats "cream" and "sweet potato" beats "potato").
    static func entry(for text: String) -> FoodEntry? {
        let n = text.lowercased()
        var best: FoodEntry?
        var bestLength = 0
        for e in entries {
            for k in e.keywords where n.contains(k) && k.count > bestLength {
                best = e
                bestLength = k.count
            }
        }
        return best
    }

    static func entry(forKey key: String) -> FoodEntry? {
        entries.first { $0.key == key }
    }

    static func key(for text: String) -> String {
        entry(for: text)?.key ?? text.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static func emoji(for text: String) -> String {
        entry(for: text)?.emoji ?? "🍽️"
    }

    static func displayName(forKey key: String) -> String {
        entry(forKey: key)?.displayName ?? key.capitalized
    }

    static func suggestedLocation(for text: String) -> StorageLocation {
        entry(for: text)?.location ?? .fridge
    }

    static func suggestedExpiry(for text: String, location: StorageLocation, from date: Date = Date()) -> Date {
        var days = entry(for: text)?.shelfDays ?? 7
        if location == .freezer { days = max(days, 90) }
        return Calendar.current.date(byAdding: .day, value: days, to: date) ?? date
    }
}
