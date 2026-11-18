import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.modelContext) private var context
    @Query private var kitchen: [FoodItem]
    @Query private var groceries: [GroceryItem]
    @Query private var cooked: [CookedRecipe]
    @Query private var myRecipes: [UserRecipe]

    @AppStorage(SettingsKeys.remindersEnabled) private var remindersEnabled = true
    @AppStorage(SettingsKeys.reminderDaysBefore) private var daysBefore = 1
    @AppStorage(SettingsKeys.prefVegetarian) private var vegetarian = false
    @AppStorage(SettingsKeys.prefDairyFree) private var dairyFree = false
    @AppStorage(SettingsKeys.prefQuick) private var quick = false
    @AppStorage(SettingsKeys.usedInTimeCount) private var usedCount = 0
    @AppStorage(SettingsKeys.tossedCount) private var tossedCount = 0
    @State private var confirmDelete = false

    private var version: String {
        let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let b = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(v) (\(b))"
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Toggle("Expiration reminders", isOn: $remindersEnabled)
                    Picker("Remind me", selection: $daysBefore) {
                        Text("On the day").tag(0)
                        Text("1 day before").tag(1)
                        Text("2 days before").tag(2)
                        Text("3 days before").tag(3)
                    }
                    .disabled(!remindersEnabled)
                } header: {
                    Text("Reminders")
                } footer: {
                    Text("Reminders arrive at 9 AM. Expiration dates are estimates; always check the package.")
                }

                Section("Food preferences") {
                    Toggle("Vegetarian", isOn: $vegetarian)
                    Toggle("Dairy-free", isOn: $dairyFree)
                    Toggle("Quick meals (30 min or less)", isOn: $quick)
                }

                Section("Your impact") {
                    LabeledContent("Items used in time", value: "\(usedCount)")
                    LabeledContent("Items tossed", value: "\(tossedCount)")
                    LabeledContent("Meals cooked", value: "\(cooked.count)")
                }

                Section("Data") {
                    Button("Load sample kitchen") { SampleData.load(into: context) }
                    Button("Delete all my data", role: .destructive) { confirmDelete = true }
                }

                Section {
                    Link("Privacy policy", destination: AppConfig.privacyPolicyURL)
                    Link("Help & support", destination: AppConfig.supportURL)
                    LabeledContent("Version", value: version)
                } header: {
                    Text("About")
                } footer: {
                    Text("Your kitchen data is stored only on this device. Photos are analyzed on-device and are not uploaded.")
                }
            }
            .navigationTitle("Settings")
            .onChange(of: remindersEnabled) { _, isOn in
                if isOn {
                    Task {
                        _ = await ReminderScheduler.requestAuthorization()
                        ReminderScheduler.rescheduleAll(kitchen)
                    }
                } else {
                    ReminderScheduler.rescheduleAll([])
                }
            }
            .onChange(of: daysBefore) { _, _ in ReminderScheduler.rescheduleAll(kitchen) }
            .confirmationDialog("Delete everything?", isPresented: $confirmDelete, titleVisibility: .visible) {
                Button("Delete all data", role: .destructive, action: deleteAll)
            } message: {
                Text("This removes your kitchen, shopping list, recipes and history from this device.")
            }
        }
    }

    private func deleteAll() {
        kitchen.forEach { context.delete($0) }
        groceries.forEach { context.delete($0) }
        cooked.forEach { context.delete($0) }
        myRecipes.forEach { context.delete($0) }
        usedCount = 0
        tossedCount = 0
        ReminderScheduler.rescheduleAll([])
    }
}
