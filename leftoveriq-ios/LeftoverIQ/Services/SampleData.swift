import Foundation
import SwiftData

enum SampleData {
    /// Fills an empty kitchen with a realistic starter set so new users (and App Review) can try every feature.
    static func load(into context: ModelContext) {
        let cal = Calendar.current
        func inDays(_ d: Int) -> Date { cal.date(byAdding: .day, value: d, to: Date()) ?? Date() }
        let items: [FoodItem] = [
            FoodItem(name: "Spinach", quantity: "1 bag", location: .fridge, expiresOn: inDays(0)),
            FoodItem(name: "Chicken thighs", quantity: "1.2 lb", location: .fridge, expiresOn: inDays(1)),
            FoodItem(name: "Cherry tomatoes", quantity: "1 pint", location: .fridge, expiresOn: inDays(2)),
            FoodItem(name: "Eggs", quantity: "8", location: .fridge, expiresOn: inDays(14)),
            FoodItem(name: "Parmesan", quantity: "1 wedge", location: .fridge, expiresOn: inDays(21)),
            FoodItem(name: "Milk", quantity: "Half gallon", location: .fridge, expiresOn: inDays(5)),
            FoodItem(name: "Bell pepper", quantity: "2", location: .fridge, expiresOn: inDays(3)),
            FoodItem(name: "Onions", quantity: "3", location: .pantry, expiresOn: inDays(30)),
            FoodItem(name: "Garlic", quantity: "1 head", location: .pantry, expiresOn: inDays(30)),
            FoodItem(name: "Potatoes", quantity: "2 lb", location: .pantry, expiresOn: inDays(25)),
            FoodItem(name: "Spaghetti", quantity: "1 box", location: .pantry, expiresOn: inDays(300)),
            FoodItem(name: "Rice", quantity: "2 lb", location: .pantry, expiresOn: inDays(300)),
            FoodItem(name: "Black beans", quantity: "2 cans", location: .pantry, expiresOn: inDays(300)),
            FoodItem(name: "Frozen peas", quantity: "1 bag", location: .freezer, expiresOn: inDays(150)),
        ]
        items.forEach { item in
            context.insert(item)
            ReminderScheduler.schedule(for: item)
        }
        ["Greek yogurt", "Lemons", "Tortillas"].forEach { context.insert(GroceryItem(name: $0)) }
        try? context.save()
    }
}
