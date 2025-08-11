import Foundation
import EventKit

/// Pure functions for scoring and allocation of study blocks.
struct PlannerEngine {
    /// Produce plan blocks for tonight based on reminders and busy events.
    func plan(reminders: [EKReminder], busy: [EKEvent], settings: Settings) -> [PlanBlock] {
        let now = Date().addingTimeInterval(15*60)
        var cursor = now
        let bedtime = DateUtils.components(settings.bedtime)
        var blocks: [PlanBlock] = []
        let sorted = reminders.sorted { ($0.dueDateComponents?.date ?? now) < ($1.dueDateComponents?.date ?? now) }
        for reminder in sorted {
            guard cursor < bedtime else { break }
            let duration = settings.blockDuration
            let end = cursor.addingTimeInterval(duration)
            if end > bedtime { break }
            let block = PlanBlock(start: cursor, end: end, title: reminder.title, subject: .generic, reminderID: reminder.calendarItemIdentifier)
            blocks.append(block)
            cursor = end.addingTimeInterval(settings.breakDuration)
        }
        return blocks
    }
}
