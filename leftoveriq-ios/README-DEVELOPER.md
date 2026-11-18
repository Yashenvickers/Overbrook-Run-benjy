# LeftoverIQ iOS: Developer Guide

SwiftUI + SwiftData app, iOS 17+, iPhone, no third-party dependencies, no backend.

> **Not yet compiled.** This project was written without Xcode available. The Swift files pass a syntax parse and the project file parses, but nothing has been type-checked or built. Expect to fix a few compile errors on the first build. After that, run through the full test checklist below.

## 1. Open and run

1. Requirements: macOS with **Xcode 16 or newer** (the project uses Xcode 16's folder-synced groups, `objectVersion 77`).
2. Double-click `LeftoverIQ.xcodeproj`.
3. Select the **LeftoverIQ** target → **Signing & Capabilities**:
   - **Team**: choose your Apple Developer team.
   - **Bundle Identifier**: change `com.yourcompany.leftoveriq` to a unique reverse-domain ID you own, for example `com.acmefoods.leftoveriq`.
4. Choose an iPhone simulator and press **Run** (⌘R).

If the project won't open, regenerate it with XcodeGen: `brew install xcodegen && xcodegen` in this folder (uses `project.yml`).

## 2. Before submitting: required edits

| What | Where |
|---|---|
| Privacy policy URL | `LeftoverIQ/App/AppConfig.swift` → `privacyPolicyURL` |
| Support URL | `LeftoverIQ/App/AppConfig.swift` → `supportURL` |
| Bundle ID and Team | Target → Signing & Capabilities |
| Version / build | Target → General (`MARKETING_VERSION` 1.0, `CURRENT_PROJECT_VERSION` 1) |

Publish `PRIVACY_POLICY.md` (edited with your company name and contact) at the URL you set.

## 3. Test checklist (on a real iPhone)

- [ ] First launch shows onboarding and asks for notification permission.
- [ ] Kitchen → "Try with sample items" loads 14 items; "Use soon" section shows spinach, chicken, tomatoes, bell pepper.
- [ ] Add item: typing "milk" auto-suggests Fridge and about 7 days; saving works; editing and swipe actions (Used / Tossed) work.
- [ ] Shopping list: add items; "You may already have this" warning appears for items in the kitchen; checking items and "Put away in my kitchen" moves them.
- [ ] Cook tab: recipes ranked; filter chips change results; recipe detail shows have/missing, swaps, and "Add missing to shopping list".
- [ ] "I cooked this" → removing used items works; that recipe ranks higher afterwards.
- [ ] Snap Ingredients: camera permission prompt appears; photos of e.g. bananas, broccoli or eggs are recognized; manual add works; "Show recipes" and "Add to my kitchen" work.
- [ ] Notifications: set reminder to "On the day", add an item expiring tomorrow, then change the device date to confirm the 9 AM alert (or temporarily shorten the trigger while testing).
- [ ] Recipes tab: create, view, share and delete a personal recipe.
- [ ] Settings: all toggles persist; "Delete all my data" clears everything.
- [ ] Dark mode, largest Dynamic Type size, and VoiceOver pass a quick check.

## 4. App Store Connect

1. At appstoreconnect.apple.com → **Apps** → **+ New App**: platform iOS, name `LeftoverIQ` (pick another if it's taken), your bundle ID, SKU `leftoveriq-ios`.
2. **App Information**: category **Food & Drink** (secondary: Lifestyle). Content rights: no third-party content.
3. **App Privacy**: select **Data Not Collected**. The app stores everything on-device, has no analytics, and analyzes photos on-device. Update this if you add analytics, accounts or a server.
4. **Age rating**: answer "None" to everything, which gives 4+.
5. **Pricing**: Free (or your choice).
6. Paste listing text from `APP_STORE_LISTING.md`.
7. **Screenshots**: required for the 6.9" iPhone display (1320 × 2868 or 1290 × 2796). Take them in the iPhone 16 Pro Max simulator with sample items loaded (⌘S saves a screenshot).

## 5. Archive and upload

1. In Xcode set the run destination to **Any iOS Device (arm64)**.
2. **Product → Archive**.
3. In the Organizer: **Distribute App → App Store Connect → Upload**.
4. After processing (10 to 30 minutes), the build appears in App Store Connect under **TestFlight**. Install it on a device and test again.
5. On the app's version page, choose the build, fill in **App Review Information** (notes are in `APP_STORE_LISTING.md`; no demo account needed) and **Submit for Review**.

## Architecture

```
LeftoverIQ/
  App/        LeftoverIQApp (entry, tabs, onboarding gate), AppConfig (URLs, settings keys)
  Models/     SwiftData models (FoodItem, GroceryItem, CookedRecipe, UserRecipe),
              FoodCatalog (ingredient recognition, storage, shelf life), RecipeLibrary (22 recipes)
  Services/   RecipeEngine (ranking), Substitutions, ReminderScheduler (local notifications),
              IngredientScanner (Vision VNClassifyImageRequest, on-device), SampleData
  Views/      Kitchen, ShoppingList, Cook (+ RecipeDetail), Scan, Community/Recipes, Settings, Onboarding
  PrivacyInfo.xcprivacy  Privacy manifest (declares UserDefaults use, no tracking or data collection)
```

- **Persistence**: SwiftData, local only. Adding iCloud sync later means enabling CloudKit; the models already use default values for every property, as CloudKit requires.
- **Ingredient recognition**: uses Apple's built-in general image classifier and maps its labels to `FoodCatalog` keywords. It handles common produce well and packaged goods poorly. For better accuracy, replace `IngredientScanner.detect` with a custom Core ML model or a cloud vision/LLM API. If you add a cloud API, update the privacy policy and the App Privacy answers.
- **Expiration dates** are typical shelf-life estimates from `FoodCatalog.shelfDays`, and the UI says so. Users can edit every date.

## Roadmap (needs a backend)

- **Grocery purchase import**: requires partner APIs or receipt and email parsing, plus a server and user accounts.
- **Community feed**: requires accounts, storage, and Apple guideline 1.2 user-generated-content tools (report, block, filter objectionable content, published contact info).
- **AI recipe generation beyond the built-in library**: LLM API behind your own server. Never ship API keys in the app.
