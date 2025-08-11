import SwiftUI
import EventKit

struct DashboardView: View {
    @EnvironmentObject var manager: EventKitManager
    @EnvironmentObject var settingsStore: SettingsModel
    @State private var blocks: [PlanBlock] = []
    @State private var showPlanner = false

    var body: some View {
        NavigationStack {
            List {
                Section("Insights") {
                    Text(settingsStore.summary)
                }
                Section("Plan") {
                    ForEach(blocks) { block in
                        VStack(alignment: .leading) {
                            Text(block.title)
                            Text("\(block.start.formatted(date: .omitted, time: .shortened)) – \(block.end.formatted(date: .omitted, time: .shortened))")
                                .font(.footnote)
                        }
                    }
                }
            }
            .navigationTitle("Epoch")
            .toolbar {
                Button("Plan Tonight") { runPlanner() }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .quickCaptureText)) { note in
            if let text = note.object as? String {
                try? manager.addReminder(text: text, due: nil)
            }
        }
    }

    func runPlanner() {
        Task {
            let predicate = EKEventStore().predicateForIncompleteReminders(withDueDateStarting: nil, ending: DateUtils.endOfTomorrow(), calendars: nil)
            let rems = try await withCheckedThrowingContinuation { cont in
                EKEventStore().fetchReminders(matching: predicate) { r in cont.resume(returning: r ?? []) }
            }
            let blocks = PlannerEngine().plan(reminders: rems, busy: [], settings: settingsStore.settings)
            await MainActor.run { self.blocks = blocks }
        }
    }
}

#Preview {
    DashboardView()
        .environmentObject(EventKitManager())
        .environmentObject(SettingsModel())
}
