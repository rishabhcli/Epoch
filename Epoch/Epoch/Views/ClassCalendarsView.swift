import SwiftUI
import EventKit

struct ClassCalendarsView: View {
    @EnvironmentObject var manager: EventKitManager
    @EnvironmentObject var settingsModel: SettingsModel

    var body: some View {
        List {
            ForEach(manager.eventStore.calendars(for: .event), id: \.self) { cal in
                let binding = Binding(
                    get: { settingsModel.settings.classCalendarIDs.contains(cal.calendarIdentifier) },
                    set: { isOn in
                        if isOn {
                            settingsModel.settings.classCalendarIDs.append(cal.calendarIdentifier)
                        } else {
                            settingsModel.settings.classCalendarIDs.removeAll { $0 == cal.calendarIdentifier }
                        }
                        settingsModel.save()
                    }
                )
                HStack {
                    Circle().fill(Color(ekColor: cal)).frame(width: 8, height: 8)
                    Toggle(cal.title, isOn: binding)
                }
            }
        }
        .navigationTitle("Class Calendars")
    }
}

#Preview {
    ClassCalendarsView()
        .environmentObject(EventKitManager())
        .environmentObject(SettingsModel())
}
