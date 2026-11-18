import SwiftUI

struct ExpiryBadge: View {
    let daysLeft: Int

    var text: String {
        switch daysLeft {
        case ..<0: return "Expired"
        case 0: return "Today"
        case 1: return "1 day"
        case 2...30: return "\(daysLeft) days"
        case 31...89: return "\(daysLeft / 7) wks"
        default: return "\(daysLeft / 30) mo"
        }
    }

    var color: Color {
        switch daysLeft {
        case ..<1: return .red
        case 1...3: return .orange
        default: return .green
        }
    }

    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.15), in: Capsule())
            .foregroundStyle(color)
            .accessibilityLabel(daysLeft < 0 ? "Expired" : "Expires in \(text)")
    }
}

struct FoodRow: View {
    let item: FoodItem

    var body: some View {
        HStack(spacing: 12) {
            Text(item.emoji)
                .font(.title2)
                .frame(width: 40, height: 40)
                .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 10))
            VStack(alignment: .leading, spacing: 2) {
                Text(item.name).font(.body.weight(.medium))
                Text([item.quantity, item.location.title].filter { !$0.isEmpty }.joined(separator: " · "))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            ExpiryBadge(daysLeft: item.daysLeft)
        }
        .padding(.vertical, 2)
    }
}

struct TagChip: View {
    let text: String
    var color: Color = .accentColor

    var body: some View {
        Text(text)
            .font(.caption2.weight(.semibold))
            .padding(.horizontal, 7)
            .padding(.vertical, 3)
            .background(color.opacity(0.15), in: Capsule())
            .foregroundStyle(color)
    }
}
