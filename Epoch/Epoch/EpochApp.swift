import SwiftUI

@main
struct EpochApp: App {
    @StateObject private var settingsModel = SettingsModel()
    @StateObject private var eventKit = EventKitManager()

    var body: some Scene {
        WindowGroup {
            DashboardView()
                .environmentObject(eventKit)
                .environmentObject(settingsModel)
                .task { await NotificationManager.shared.requestAuthorization() }
        }
    }
}
