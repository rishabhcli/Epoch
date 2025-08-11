import Foundation
#if canImport(CloudKit)
import CloudKit
#endif

/// Abstract persistence layer for settings.
protocol SettingsStore: AnyObject {
    func load() async throws -> Settings
    func save(_ settings: Settings) async throws
    var description: String { get }
}

/// Observable container for settings that chooses appropriate backend.
@MainActor
final class SettingsModel: ObservableObject {
    @Published var settings: Settings
    private var store: SettingsStore
    var summary: String { settings.lastPlanSummary ?? "No plan" }
    var description: String { store.description }

    init(store: SettingsStore = UserDefaultsStore()) {
        self.store = store
        self.settings = Settings()
        Task { try? await load() }
    }

    func load() async throws {
        settings = try await store.load()
    }

    func save() {
        Task { try? await store.save(settings) }
    }

    func switchStore(_ newStore: SettingsStore) {
        store = newStore
        save()
    }
}

/// Local `UserDefaults` backed store.
final class UserDefaultsStore: SettingsStore {
    private let key = "settings"
    private let defaults = UserDefaults.standard
    var description: String { "Local" }

    func load() async throws -> Settings {
        if let data = defaults.data(forKey: key),
           let s = try? JSONDecoder().decode(Settings.self, from: data) {
            return s
        }
        return Settings()
    }

    func save(_ settings: Settings) async throws {
        let data = try JSONEncoder().encode(settings)
        defaults.set(data, forKey: key)
    }
}

#if canImport(CloudKit)
/// Simple CloudKit backed store. Falls back to `UserDefaults` on error.
final class CloudKitStore: SettingsStore {
    private let container: CKContainer
    private let recordID = CKRecord.ID(recordName: "settings")
    var description: String { "iCloud" }

    init?(containerID: String) {
        self.container = CKContainer(identifier: containerID)
    }

    func load() async throws -> Settings {
        do {
            let db = container.privateCloudDatabase
            let record = try await db.record(for: recordID)
            if let data = record["data"] as? Data {
                return try JSONDecoder().decode(Settings.self, from: data)
            }
        } catch { }
        return Settings()
    }

    func save(_ settings: Settings) async throws {
        let db = container.privateCloudDatabase
        let record = CKRecord(recordType: "Settings", recordID: recordID)
        record["data"] = try JSONEncoder().encode(settings) as CKRecordValue
        _ = try await db.modifyRecords(saving: [record], deleting: [])
    }
}
#endif
