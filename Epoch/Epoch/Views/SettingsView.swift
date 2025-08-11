import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var settingsModel: SettingsModel
    @State private var aiKey: String = (try? KeychainService.load()) ?? ""

    var body: some View {
        Form {
            Section("Durations") {
                Stepper(value: $settingsModel.settings.blockDuration, in: 1500...3600, step: 300) {
                    Text("Block: \(Int(settingsModel.settings.blockDuration/60)) min")
                }
                Stepper(value: $settingsModel.settings.breakDuration, in: 300...900, step: 300) {
                    Text("Break: \(Int(settingsModel.settings.breakDuration/60)) min")
                }
            }
            Section("AI") {
                SecureField("API Key", text: $aiKey)
                Toggle("Enable", isOn: $settingsModel.settings.aiAssistEnabled)
                Button("Save Key") { try? KeychainService.save(key: aiKey) }
            }
            Section("Storage") {
                Text("Backend: \(settingsModel.description)")
            }
        }
        .navigationTitle("Settings")
        .onDisappear { settingsModel.save() }
    }
}

#Preview {
    SettingsView().environmentObject(SettingsModel())
}
