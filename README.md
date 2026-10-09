# FoodLens — Food Ingredient Safety & Health Analyzer
*(ফুডলেন্স — খাদ্য উপাদানের নিরাপত্তা ও স্বাস্থ্য বিশ্লেষক)*

FoodLens is a modern, responsive, bilingual web application (English + বাংলা) that decodes packaged food labels into clear, evidence-based health and safety insights.

---

## 🌟 Key Features

1. **Bilingual Experience (English & বাংলা)**:
   - Instant language switcher in the header (`EN | বাংলা`).
   - Every ingredient, health explanation, category, and concern badge is translated naturally into Bengali and English.
   - Handles mixed-language package labels (e.g. `Ingredients: Sugar, চিনি, E621, Milk Powder`).

2. **Smart OCR with Human-in-the-Loop Verification**:
   - Mobile-first camera capture (`Take Photo`) and drag-and-drop file upload.
   - Google Gemini 2.5 Flash Vision OCR extraction.
   - **Verification Modal**: Displays detected text for user review before running analysis. Highlights typos (e.g. `E62I` → `E621`) so uncertain OCR output is never silently analyzed.

3. **Evidence-Based Ingredient Database**:
   - Structured profiles for E-numbers, INS codes, chemical names, and Bengali names.
   - 4-Tier Safety Concern Classification:
     - 🟢 **Low Concern**: Generally recognized as safe in normal permitted amounts.
     - 🟡 **Moderate Concern**: Worth moderating based on intake volume or frequency.
     - 🟠 **Higher Concern**: Deserves closer attention due to documented sensitivities (e.g., Tartrazine child activity warnings, Aspartame).
     - 🔴 **High Concern**: Potentially significant under specific circumstances (e.g., severe allergens).
   - "What Can It Cause?" section using calm, scientific language without fear-mongering.

4. **Allergen Alert & Personal Profile**:
   - Auto-detects top allergens: Milk, Wheat/Gluten, Peanuts, Soy, Eggs, Fish.
   - User profile settings (`/preferences`) to flag specific allergens or dietary concerns (High Sugar, High Sodium, Artificial Colors, Preservatives).
   - Dynamic alerts when a scanned product matches your avoidance criteria.

5. **Side-by-Side Product Comparison (`/compare`)**:
   - Compare two packaged products (Product A vs Product B) on concern scores, total additives, allergens, and high-concern items.
   - Generates a balanced, objective verdict without declaring products universally "healthy".

6. **Searchable Encyclopedia (`/ingredients`)**:
   - Instant search by E-code, INS number, English name, or Bengali name.
   - Rich pop-up modal with regulatory status (FDA, EFSA, Codex) and review dates.

7. **Scan History**:
   - Saves recent scans locally in browser storage with one-click reload or deletion.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js 18+ installed

### 2. Configure Gemini API Key (Optional for OCR)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your free Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: FoodLens works even without an API key by providing smart mock OCR output and full local database matching!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```
