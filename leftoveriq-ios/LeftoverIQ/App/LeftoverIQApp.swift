import SwiftUI
import SwiftData

@main
struct LeftoverIQApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(for: [FoodItem.self, GroceryItem.self, CookedRecipe.self, UserRecipe.self])
    }
}

struct RootView: View {
    @AppStorage(SettingsKeys.hasOnboarded) private var hasOnboarded = false
    @State private var showOnboarding = false

    var body: some View {
        ContentView()
            .onAppear { if !hasOnboarded { showOnboarding = true } }
            .fullScreenCover(isPresented: $showOnboarding) {
                OnboardingView {
                    hasOnboarded = true
                    showOnboarding = false
                }
            }
    }
}

struct ContentView: View {
    var body: some View {
        TabView {
            KitchenView()
                .tabItem { Label("Kitchen", systemImage: "refrigerator") }
            ShoppingListView()
                .tabItem { Label("Shop", systemImage: "cart") }
            CookView()
                .tabItem { Label("Cook", systemImage: "fork.knife") }
            CommunityView()
                .tabItem { Label("Recipes", systemImage: "person.2") }
            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape") }
        }
    }
}
