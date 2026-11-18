import UIKit
import Vision
import ImageIO

/// On-device ingredient recognition using Apple's built-in Vision image classifier.
/// Photos never leave the phone. Results are suggestions the user confirms before use.
/// To improve accuracy later, swap `detect` for a custom Core ML model or a cloud vision API.
enum IngredientScanner {
    static func detect(in image: UIImage) async -> [String] {
        guard let cgImage = image.cgImage else { return [] }
        let orientation = CGImagePropertyOrientation(image.imageOrientation)

        return await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let request = VNClassifyImageRequest()
                let handler = VNImageRequestHandler(cgImage: cgImage, orientation: orientation, options: [:])
                do {
                    try handler.perform([request])
                } catch {
                    continuation.resume(returning: [])
                    return
                }
                let observations = (request.results ?? [])
                    .filter { $0.confidence >= 0.08 }
                    .sorted { $0.confidence > $1.confidence }
                var keys: [String] = []
                for observation in observations {
                    let label = observation.identifier.replacingOccurrences(of: "_", with: " ")
                    if let entry = FoodCatalog.entry(for: label), !keys.contains(entry.key) {
                        keys.append(entry.key)
                    }
                }
                continuation.resume(returning: Array(keys.prefix(8)))
            }
        }
    }
}

extension CGImagePropertyOrientation {
    init(_ orientation: UIImage.Orientation) {
        switch orientation {
        case .up: self = .up
        case .upMirrored: self = .upMirrored
        case .down: self = .down
        case .downMirrored: self = .downMirrored
        case .left: self = .left
        case .leftMirrored: self = .leftMirrored
        case .right: self = .right
        case .rightMirrored: self = .rightMirrored
        @unknown default: self = .up
        }
    }
}
