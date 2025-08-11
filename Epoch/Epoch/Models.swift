import Foundation
import EventKit

/// Represents a study block scheduled by the planner.
struct PlanBlock: Identifiable, Codable {
    var id = UUID()
    var start: Date
    var end: Date
    var title: String
    var subject: Subject
    var reminderID: String?
}

/// Simple subject enumeration with a `generic` fallback.
enum Subject: String, Codable, CaseIterable, Identifiable {
    case generic
    case calc
    case stats
    case physics
    case chemistry
    case history
    case english
    var id: String { rawValue }
}

/// User editable settings persisted via `SettingsStore`.
struct Settings: Codable {
    var classCalendarIDs: [String] = []
    var prepWindowStart: DateComponents = DateComponents(hour: 18, minute: 0)
    var prepWindowEnd: DateComponents = DateComponents(hour: 22, minute: 0)
    var bedtime: DateComponents = DateComponents(hour: 22, minute: 30)
    var blockDuration: TimeInterval = 50 * 60
    var breakDuration: TimeInterval = 10 * 60
    var useQuickCaptureListOnly: Bool = false
    var aliasTable: [String: Subject] = [:]
    var lastPlanSummary: String?
    var aiAssistEnabled: Bool = false
}
