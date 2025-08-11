import Foundation
import EventKit

/// Handles EventKit operations for calendars and reminders.
@MainActor
final class EventKitManager: ObservableObject {
    private let store = EKEventStore()
    var eventStore: EKEventStore { store }
    @Published var studyCalendar: EKCalendar?

    init() {
        Task { await loadStudyCalendar() }
    }

    func requestAccess() async throws {
        try await store.requestFullAccessToEvents()
        try await store.requestFullAccessToReminders()
        await loadStudyCalendar()
    }

    func loadStudyCalendar() async {
        let name = "Study Plan"
        if let existing = store.calendars(for: .event).first(where: { $0.title == name }) {
            studyCalendar = existing
            return
        }
        let cal = EKCalendar(for: .event, eventStore: store)
        cal.title = name
        cal.source = store.defaultCalendarForNewEvents?.source
        try? store.saveCalendar(cal, commit: true)
        studyCalendar = cal
    }

    func tomorrowClasses(from calendars: [EKCalendar]) -> [EKEvent] {
        let start = DateUtils.startOfTomorrow()
        let end = DateUtils.endOfTomorrow()
        let predicate = store.predicateForEvents(withStart: start, end: end, calendars: calendars)
        return store.events(matching: predicate)
    }

    func addStudyEvent(title: String, start: Date, end: Date, note: String, reminderID: String?) throws {
        guard let calendar = studyCalendar else { return }
        let event = EKEvent(eventStore: store)
        event.calendar = calendar
        event.title = "Study: \(title)"
        event.startDate = start
        event.endDate = end
        event.notes = "epoch://study/\(reminderID ?? UUID().uuidString)\n\(note)"
        try store.save(event, span: .thisEvent)
    }

    func addReminder(text: String, due: Date?) throws -> EKReminder {
        let reminder = EKReminder(eventStore: store)
        reminder.title = text
        reminder.calendar = store.defaultCalendarForNewReminders()
        if let due {
            reminder.dueDateComponents = Calendar.current.dateComponents([.year,.month,.day,.hour,.minute], from: due)
            let alarm = EKAlarm(absoluteDate: due)
            reminder.addAlarm(alarm)
        }
        try store.save(reminder, commit: true)
        return reminder
    }
}
