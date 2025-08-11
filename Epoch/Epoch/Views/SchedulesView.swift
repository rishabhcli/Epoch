import SwiftUI

struct SchedulesView: View {
    @EnvironmentObject var settingsModel: SettingsModel
    @State private var nudgeTime = DateComponents(hour: 20, minute: 0)

    var body: some View {
        Form {
            DatePicker("Nudge Time", selection: Binding(
                get: { DateUtils.components(nudgeTime) },
                set: { nudgeTime = Calendar.current.dateComponents([.hour, .minute], from: $0) }
            ), displayedComponents: .hourAndMinute)
            Button("Reschedule Nudges") {
                NotificationManager.shared.scheduleNudge(at: nudgeTime)
            }
        }
        .navigationTitle("Schedules")
    }
}

#Preview {
    SchedulesView().environmentObject(SettingsModel())
}
