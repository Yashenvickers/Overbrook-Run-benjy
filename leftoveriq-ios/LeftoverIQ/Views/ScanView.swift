import SwiftUI
import SwiftData
import PhotosUI
import UIKit

struct ScanView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var context
    @Query private var kitchen: [FoodItem]

    @State private var pickerItem: PhotosPickerItem?
    @State private var image: UIImage?
    @State private var showingCamera = false
    @State private var isScanning = false
    @State private var detected: [String] = []
    @State private var selected: Set<String> = []
    @State private var manualEntry = ""
    @State private var message: String?

    private var cameraAvailable: Bool { UIImagePickerController.isSourceTypeAvailable(.camera) }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    if let image {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFill()
                            .frame(height: 200)
                            .frame(maxWidth: .infinity)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                            .listRowInsets(EdgeInsets())
                    } else {
                        VStack(spacing: 8) {
                            Image(systemName: "camera.viewfinder").font(.system(size: 44)).foregroundStyle(Color.accentColor)
                            Text("Photograph your ingredients on the counter or inside the fridge.")
                                .font(.subheadline)
                                .multilineTextAlignment(.center)
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                    }
                    HStack {
                        if cameraAvailable {
                            Button { showingCamera = true } label: { Label("Take photo", systemImage: "camera") }
                                .buttonStyle(.borderedProminent)
                        }
                        PhotosPicker(selection: $pickerItem, matching: .images) {
                            Label("Choose photo", systemImage: "photo.on.rectangle")
                        }
                        .buttonStyle(.bordered)
                    }
                    .frame(maxWidth: .infinity)
                    .listRowBackground(Color.clear)
                }

                if isScanning {
                    Section { HStack { ProgressView(); Text("Finding ingredients…").padding(.leading, 8) } }
                }

                if !detected.isEmpty || (image != nil && !isScanning) {
                    Section {
                        if detected.isEmpty {
                            Text("We couldn't confidently recognize ingredients in this photo. Add them by name below.")
                                .foregroundStyle(.secondary)
                        }
                        ForEach(detected, id: \.self) { key in
                            Toggle(isOn: Binding(
                                get: { selected.contains(key) },
                                set: { isOn in if isOn { selected.insert(key) } else { selected.remove(key) } }
                            )) {
                                Label {
                                    Text(FoodCatalog.displayName(forKey: key))
                                } icon: {
                                    Text(FoodCatalog.entry(forKey: key)?.emoji ?? "🍽️")
                                }
                            }
                        }
                    } header: {
                        Text("Ingredients")
                    } footer: {
                        Text("Recognition happens on your phone. Turn off anything that's wrong.")
                    }
                }

                Section("Add by name") {
                    HStack {
                        TextField("e.g. zucchini", text: $manualEntry)
                            .onSubmit(addManual)
                        Button("Add", action: addManual)
                            .disabled(manualEntry.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }

                Section {
                    NavigationLink {
                        ScanResultsView(keys: selected)
                    } label: {
                        Label("Show recipes", systemImage: "fork.knife")
                    }
                    .disabled(selected.isEmpty)
                    Button {
                        addToKitchen()
                    } label: {
                        Label("Add these to my kitchen", systemImage: "refrigerator")
                    }
                    .disabled(selected.isEmpty)
                }
            }
            .navigationTitle("Snap Ingredients")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: Recipe.self) { RecipeDetailView(recipe: $0) }
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } }
            }
            .onChange(of: pickerItem) { _, newItem in
                guard let newItem else { return }
                Task {
                    if let data = try? await newItem.loadTransferable(type: Data.self), let picked = UIImage(data: data) {
                        await analyze(picked)
                    }
                }
            }
            .fullScreenCover(isPresented: $showingCamera) {
                CameraPicker { captured in
                    Task { await analyze(captured) }
                }
                .ignoresSafeArea()
            }
            .alert("Kitchen updated", isPresented: Binding(get: { message != nil }, set: { if !$0 { message = nil } })) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(message ?? "")
            }
        }
    }

    @MainActor
    private func analyze(_ newImage: UIImage) async {
        image = newImage
        isScanning = true
        let keys = await IngredientScanner.detect(in: newImage)
        for key in keys where !detected.contains(key) { detected.append(key) }
        selected.formUnion(keys)
        isScanning = false
    }

    private func addManual() {
        let text = manualEntry.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        let key = FoodCatalog.key(for: text)
        if !detected.contains(key) { detected.append(key) }
        selected.insert(key)
        manualEntry = ""
    }

    private func addToKitchen() {
        let existing = Set(kitchen.map(\.key))
        let toAdd = selected.filter { !existing.contains($0) }
        for key in toAdd {
            let name = FoodCatalog.displayName(forKey: key)
            let loc = FoodCatalog.suggestedLocation(for: name)
            let item = FoodItem(name: name, location: loc, expiresOn: FoodCatalog.suggestedExpiry(for: name, location: loc))
            context.insert(item)
            ReminderScheduler.schedule(for: item)
        }
        message = toAdd.isEmpty ? "Those are already in your kitchen." : "Added \(toAdd.count) item\(toAdd.count == 1 ? "" : "s") with suggested dates."
    }
}

struct ScanResultsView: View {
    @Query private var kitchen: [FoodItem]
    let keys: Set<String>

    private var suggestions: [RecipeSuggestion] {
        RecipeEngine.suggestions(have: keys.union(kitchen.map(\.key)), expiring: keys,
                                 preferences: Preferences(), cookedCounts: [:])
    }

    var body: some View {
        List(suggestions.prefix(12)) { s in
            NavigationLink(value: s.recipe) { SuggestionRow(suggestion: s) }
        }
        .navigationTitle("Recipe ideas")
    }
}

struct CameraPicker: UIViewControllerRepresentable {
    var onImage: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraPicker
        init(_ parent: CameraPicker) { self.parent = parent }

        func imagePickerController(_ picker: UIImagePickerController,
                                   didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage { parent.onImage(image) }
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}
