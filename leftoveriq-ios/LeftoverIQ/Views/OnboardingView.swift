import SwiftUI

struct OnboardingView: View {
    var onFinish: () -> Void
    @State private var page = 0

    private let pages: [(String, String, String)] = [
        ("refrigerator", "Know what you have", "Keep track of your fridge, freezer and pantry right from your phone. No special equipment."),
        ("bell.badge", "Use it before you lose it", "Get a reminder before food reaches its expected expiration date."),
        ("camera.viewfinder", "Know what to cook", "Snap your ingredients or let LeftoverIQ pick recipes from what you own, with swaps for anything missing."),
    ]

    var body: some View {
        VStack(spacing: 24) {
            TabView(selection: $page) {
                ForEach(pages.indices, id: \.self) { i in
                    VStack(spacing: 20) {
                        Image(systemName: pages[i].0)
                            .font(.system(size: 72))
                            .foregroundStyle(Color.accentColor)
                            .frame(height: 100)
                        Text(pages[i].1).font(.largeTitle.bold()).multilineTextAlignment(.center)
                        Text(pages[i].2).font(.title3).foregroundStyle(.secondary).multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 32)
                    .tag(i)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .always))
            .indexViewStyle(.page(backgroundDisplayMode: .always))

            Button {
                if page < pages.count - 1 {
                    withAnimation { page += 1 }
                } else {
                    Task {
                        _ = await ReminderScheduler.requestAuthorization()
                        onFinish()
                    }
                }
            } label: {
                Text(page < pages.count - 1 ? "Next" : "Get started")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
            }
            .buttonStyle(.borderedProminent)
            .padding(.horizontal, 24)

            Button("Skip", action: onFinish)
                .padding(.bottom, 12)
        }
        .padding(.top, 40)
    }
}
