//
//  Item.swift
//  Epoch
//
//  Created by Rishabh Bansal on 8/10/25.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
