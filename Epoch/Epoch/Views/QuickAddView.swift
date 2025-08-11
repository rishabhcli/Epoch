import SwiftUI

struct QuickAddView: View {
    @EnvironmentObject var manager: EventKitManager
    @State private var text: String = ""

    var body: some View {
        VStack {
            TextField("Reminder", text: $text)
                .textFieldStyle(.roundedBorder)
            Button("Add") {
                _ = try? manager.addReminder(text: text, due: nil)
                text = ""
            }
        }
        .padding()
    }
}

#Preview {
    QuickAddView().environmentObject(EventKitManager())
}
