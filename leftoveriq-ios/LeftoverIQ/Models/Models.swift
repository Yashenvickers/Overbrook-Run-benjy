import Foundation
import SwiftData

enum StorageLocation: String, CaseIterable, Identifiable, Codable {
    case fridge, freezer, pantry

    var id: String { rawValue }

    var title: String {
        switch self {
        case .fridge: return "Fridge"
        case .freezer: return "Freezer"
        case .pantry: return "Pantry"
        }
    }

    var symbol: String {
        switch self {
        case .fridge: return "refrigerator"
        case .freezer: return "snowflake"
        case .pantry: return "archivebox"
        }
    }
}

@Model
final class FoodItem {
    var id: UUID = UUID()
    var name: String = ""
    var quantity: String = ""
    var locationRaw: String = StorageLocation.fridge.rawValue
    var addedOn: Date = Date()
    var expiresOn: Date = Date()

    init(name: String, quantity: String = "", location: StorageLocation, expiresOn: Date, addedOn: Date = Date()) {
        self.id = UUID()
        self.name = name
        self.quantity = quantity
        self.locationRaw = location.rawValue
        self.expiresOn = expiresOn
        self.addedOn = addedOn
    }

    var location: StorageLocation {
        get { StorageLocation(rawValue: locationRaw) ?? .fridge }
        set { locationRaw = newValue.rawValue }
    }

    /// Whole days until the expected expiration date (negative once expired).
    var daysLeft: Int {
        let cal = Calendar.current
        let start = cal.startOfDay(for: Date())
        let end = cal.startOfDay(for: expiresOn)
        return cal.dateComponents([.day], from: start, to: end).day ?? 0
    }

    var key: String { FoodCatalog.key(for: name) }
    var emoji: String { FoodCatalog.emoji(for: name) }
}

@Model
final class GroceryItem {
    var id: UUID = UUID()
    var name: String = ""
    var isDone: Bool = false
    var addedOn: Date = Date()

    init(name: String) {
        self.id = UUID()
        self.name = name
        self.isDone = false
        self.addedOn = Date()
    }

    var emoji: String { FoodCatalog.emoji(for: name) }
}

/// One entry each time the user cooks a recipe; drives personalized ranking.
@Model
final class CookedRecipe {
    var recipeID: String = ""
    var cookedOn: Date = Date()

    init(recipeID: String) {
        self.recipeID = recipeID
        self.cookedOn = Date()
    }
}

/// A recipe the user writes and can share with friends.
@Model
final class UserRecipe {
    var id: UUID = UUID()
    var title: String = ""
    var ingredients: String = ""
    var steps: String = ""
    var createdOn: Date = Date()

    init(title: String, ingredients: String, steps: String) {
        self.id = UUID()
        self.title = title
        self.ingredients = ingredients
        self.steps = steps
        self.createdOn = Date()
    }

    var shareText: String {
        "\(title)\n\nIngredients:\n\(ingredients)\n\nSteps:\n\(steps)\n\nShared from LeftoverIQ"
    }
}
