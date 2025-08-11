import Foundation
import UserNotifications
import SwiftUI

/// Handles local notifications and actions.
final class NotificationManager: NSObject, ObservableObject {
    static let shared = NotificationManager()
    private let center = UNUserNotificationCenter.current()

    func requestAuthorization() async {
        _ = try? await center.requestAuthorization(options: [.alert, .badge, .sound])
        center.delegate = self
        registerCategories()
    }

    func registerCategories() {
        let addAction = UNTextInputNotificationAction(identifier: "ADD_REMINDER", title: "Add", options: [])
        let quick = UNNotificationCategory(identifier: "QUICK_CAPTURE", actions: [addAction], intentIdentifiers: [])
        center.setNotificationCategories([quick])
    }

    func scheduleNudge(at components: DateComponents) {
        let content = UNMutableNotificationContent()
        content.title = "Anything to prep?"
        content.categoryIdentifier = "QUICK_CAPTURE"
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        center.add(request)
    }
}

extension NotificationManager: UNUserNotificationCenterDelegate {
    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        if response.actionIdentifier == "ADD_REMINDER", let text = (response as? UNTextInputNotificationResponse)?.userText {
            await MainActor.run {
                // Handle quick add via notification
                NotificationCenter.default.post(name: .quickCaptureText, object: text)
            }
        }
    }
}

extension Notification.Name {
    static let quickCaptureText = Notification.Name("quickCaptureText")
}
