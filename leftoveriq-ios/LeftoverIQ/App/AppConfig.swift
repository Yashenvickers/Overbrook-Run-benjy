import Foundation

/// Values the publisher must review before submitting to the App Store.
enum AppConfig {
    /// Replace with the public URL of your privacy policy (required by Apple).
    static let privacyPolicyURL = URL(string: "https://example.com/leftoveriq/privacy")!
    /// Replace with a support page or contact URL (required in App Store Connect).
    static let supportURL = URL(string: "https://example.com/leftoveriq/support")!
}

enum SettingsKeys {
    static let hasOnboarded = "hasOnboarded"
    static let remindersEnabled = "remindersEnabled"
    static let reminderDaysBefore = "reminderDaysBefore"
    static let prefVegetarian = "prefVegetarian"
    static let prefDairyFree = "prefDairyFree"
    static let prefQuick = "prefQuick"
    static let usedInTimeCount = "usedInTimeCount"
    static let tossedCount = "tossedCount"
}
