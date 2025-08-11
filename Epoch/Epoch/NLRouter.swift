import Foundation
import NaturalLanguage

/// Provides subject detection and basic heuristics using `NaturalLanguage`.
struct NLRouter {
    var aliases: [String: Subject]

    func subject(for text: String) -> Subject {
        let lower = text.lowercased()
        for (key, value) in aliases {
            if lower.contains(key.lowercased()) { return value }
        }
        let tagger = NLTagger(tagSchemes: [.lexicalClass])
        tagger.string = lower
        if lower.contains("calc") { return .calc }
        if lower.contains("phys") { return .physics }
        if lower.contains("stat") { return .stats }
        return .generic
    }

    func hasUrgency(in text: String) -> Bool {
        let urgencyWords = ["due", "exam", "final", "quiz", "project"]
        let lower = text.lowercased()
        return urgencyWords.contains { lower.contains($0) }
    }
}
