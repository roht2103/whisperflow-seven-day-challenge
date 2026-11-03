# Rohit Thorat — Product Launch Funnel Portfolio

A creative campaign-grade portfolio website for **Rohit Thorat**, final-year engineering student from Pune applying to Growth Team roles.

The portfolio is architected as an interactive **3D Product Launch Conversion Funnel**, where **the candidate is the product**.

---

## 🌪️ Concept & Chambers Architecture

As visitors scroll, the camera moves smoothly down through a 3D geometric funnel with glowing portal rings and real-time flowing particles representing users traveling down the funnel:

1. **Chamber 01: Awareness (Top of Funnel — TOFU)**
   - *Lighting & Accent:* Electric Cyan (`#06b6d4`)
   - *Theme:* Discovery, first impressions, engineering mindset as an unfair advantage for acquisition.
   - *Placeholders:* Acquisition experiments, 0-to-1 engineering build, distribution channels.

2. **Chamber 02: Interest (Middle of Funnel — MOFU Activation)**
   - *Lighting & Accent:* Cyan-to-Amber Convergence (`#22d3ee` → `#f59e0b`)
   - *Theme:* The "Aha!" moment, rapid experimentation velocity, user journey telemetry.
   - *Placeholders:* Feature activation case study, growth stack tooling (SQL, PostHog, Python, React), product teardown.

3. **Chamber 03: Consideration (Middle of Funnel — MOFU Evaluation)**
   - *Lighting & Accent:* Warm Amber Core (`#f59e0b`)
   - *Theme:* Quantitative rigor, A/B test statistical significance, retention engines, scorecard matrix.
   - *Placeholders:* Statistical significance experiment, event tracking schema, retention loop, peer/mentor testimonials.

4. **Chamber 04: Hire (Bottom of Funnel — BOFU Conversion)**
   - *Lighting & Accent:* Radiant Gold / Amber Nexus (`#ffaa1d`)
   - *Theme:* Candidate acquisition checkout, day-1 impact readiness, final conversion.
   - *Placeholders:* Official resume PDF, 1:1 scheduling link (Cal.com/Calendly), contact info, LinkedIn/GitHub profiles.

---

## ⚡ Key Technical Features

- **3D Scene (Three.js):** Smooth scroll-driven camera spline, dynamic lighting shifts per chamber, 1,400+ flowing user particles that accelerate down the funnel constriction, and soft glowing portal rings.
- **Mobile & Low-Power Fallback (2D Eco Mode):** Auto-detects mobile devices (< 768px) and switches to a 60 FPS animated 2D Canvas & SVG funnel with flowing particles and stage dividers, so nothing breaks or drains battery.
- **Design System:** Obsidian black background (`#08090c`), warm amber primary accent (`#f59e0b`), cyan secondary accent (`#06b6d4`), modern typography (`Space Grotesk` & `Plus Jakarta Sans`). Zero generic purple gradients.
- **Interactive Telemetry HUD:** Real-time funnel depth percentage, stage indicators, and jump-to-chamber navigation.
- **No Invented Details:** Every missing detail is housed in a `PlaceholderCard` with suggested metrics to slot in.

---

## 🚀 Getting Started

To run locally:

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser.

