import Foundation
import UserNotifications

/// Schedules local (on-device) expiration reminders. No server or push certificate is needed.
enum ReminderScheduler {
    static func requestAuthorization() async -> Bool {
        do {
            return try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
        } catch {
            return false
        }
    }

    static func schedule(for item: FoodItem) {
        let defaults = UserDefaults.standard
        let enabled = defaults.object(forKey: SettingsKeys.remindersEnabled) as? Bool ?? true
        let daysBefore = defaults.object(forKey: SettingsKeys.reminderDaysBefore) as? Int ?? 1
        let center = UNUserNotificationCenter.current()
        let identifier = item.id.uuidString
        center.removePendingNotificationRequests(withIdentifiers: [identifier])
        guard enabled else { return }

        let cal = Calendar.current
        guard let fireDay = cal.date(byAdding: .day, value: -daysBefore, to: item.expiresOn) else { return }
        var components = cal.dateComponents([.year, .month, .day], from: fireDay)
        components.hour = 9
        components.minute = 0
        guard let fireDate = cal.date(from: components), fireDate > Date() else { return }

        let content = UNMutableNotificationContent()
        content.title = "\(item.emoji) Use your \(item.name) soon"
        content.body = daysBefore == 0
            ? "It's expected to expire today. Open LeftoverIQ for recipe ideas."
            : "It's expected to expire in \(daysBefore) day\(daysBefore == 1 ? "" : "s"). Open LeftoverIQ for recipe ideas."
        content.sound = .default

        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        center.add(UNNotificationRequest(identifier: identifier, content: content, trigger: trigger))
    }

    static func cancel(for item: FoodItem) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [item.id.uuidString])
    }

    static func rescheduleAll(_ items: [FoodItem]) {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        items.forEach { schedule(for: $0) }
    }
}
