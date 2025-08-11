import Foundation
import EventKit
import SwiftUI

enum DateUtils {
    static func startOfToday() -> Date {
        Calendar.current.startOfDay(for: Date())
    }
    static func startOfTomorrow() -> Date {
        Calendar.current.date(byAdding: .day, value: 1, to: startOfToday())!
    }
    static func endOfTomorrow() -> Date {
        Calendar.current.date(byAdding: DateComponents(day: 2, second: -1), to: startOfToday())!
    }
    static func components(_ time: DateComponents) -> Date {
        Calendar.current.nextDate(after: startOfToday(), matching: time, matchingPolicy: .nextTimePreservingSmallerComponents) ?? Date()
    }
}

extension EKCalendar {
    /// Safe UIColor from optional `cgColor` provided by EventKit.
    var uiColor: UIColor { UIColor(cgColor: cgColor ?? UIColor.systemBlue.cgColor) }
}

extension Color {
    init(ekColor: EKCalendar) {
        self.init(ekColor.uiColor)
    }
}
