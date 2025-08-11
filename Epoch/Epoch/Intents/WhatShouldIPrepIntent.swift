import AppIntents
import EventKit

struct WhatShouldIPrepIntent: AppIntent {
    static var title: LocalizedStringResource = "What Should I Prep"

    @MainActor
    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        let manager = EventKitManager()
        try await manager.requestAccess()
        let reminders = try await fetchReminders()
        let count = reminders.count
        let firstClass = manager.tomorrowClasses(from: []).first?.title ?? "none"
        return .result(value: "You have \(count) items. First class: \(firstClass)")
    }

    private func fetchReminders() async throws -> [EKReminder] {
        let predicate = EKEventStore().predicateForIncompleteReminders(withDueDateStarting: nil, ending: DateUtils.endOfTomorrow(), calendars: nil)
        let reminders = try await withCheckedThrowingContinuation { cont in
            EKEventStore().fetchReminders(matching: predicate) { rems in
                cont.resume(returning: rems ?? [])
            }
        }
        return reminders
    }
}
