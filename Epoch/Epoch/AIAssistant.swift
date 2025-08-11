import Foundation

/// Minimal URLSession based AI planner client.
struct AIAssistant {
    struct Request: Codable {
        var classes: [String]
        var tasks: [String]
        var start: Date
        var end: Date
    }
    struct Response: Codable {
        struct Block: Codable { let title: String; let start: Date; let end: Date }
        var blocks: [Block]
    }

    var baseURL: URL
    var apiKey: String

    func generatePlan(request: Request) async throws -> Response {
        var req = URLRequest(url: baseURL)
        req.httpMethod = "POST"
        req.addValue("application/json", forHTTPHeaderField: "Content-Type")
        req.addValue(apiKey, forHTTPHeaderField: "X-API-Key")
        req.httpBody = try JSONEncoder().encode(request)

        let (data, response) = try await URLSession.shared.data(for: req)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
        return try JSONDecoder().decode(Response.self, from: data)
    }
}
