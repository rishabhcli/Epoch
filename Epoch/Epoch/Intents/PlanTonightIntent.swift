import AppIntents
import EventKit

struct PlanTonightIntent: AppIntent {
    static var title: LocalizedStringResource = "Plan Tonight"

    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        let manager = EventKitManager()
        try await manager.requestAccess()
        let settings = Settings()
        let reminders = try await fetchReminders(manager: manager)
        let busy: [EKEvent] = []
        let blocks = PlannerEngine().plan(reminders: reminders, busy: busy, settings: settings)
        for block in blocks {
            try manager.addStudyEvent(title: block.title, start: block.start, end: block.end, note: "", reminderID: block.reminderID)
        }
        return .result(value: "Planned \(blocks.count) blocks")
    }

    private func fetchReminders(manager: EventKitManager) async throws -> [EKReminder] {
        let predicate = EKEventStore().predicateForIncompleteReminders(withDueDateStarting: nil, ending: DateUtils.endOfTomorrow(), calendars: nil)
        let reminders = try await withCheckedThrowingContinuation { cont in
            EKEventStore().fetchReminders(matching: predicate) { rems in
                cont.resume(returning: rems ?? [])
            }
        }
        return reminders.filter { ($0.dueDateComponents?.date ?? Date()) <= DateUtils.endOfTomorrow() }
    }
}
