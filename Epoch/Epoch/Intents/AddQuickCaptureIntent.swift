import AppIntents
import EventKit

struct AddQuickCaptureIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Quick Capture"
    @Parameter(title: "Text") var text: String

    @MainActor
    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        let manager = EventKitManager()
        try await manager.requestAccess()
        let reminder = try manager.addReminder(text: text, due: nil)
        return .result(value: "Added reminder \(reminder.title ?? text)")
    }
}
