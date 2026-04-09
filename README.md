# 🗓️ Wallscape: Ultra-Premium Interactive Calendar

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Next JS](https://img.shields.io/badge/Next-white?style=for-the-badge&logo=next.js&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer](https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue)

**Wallscape** is a completely reimagined digital wall calendar component. Blending cinematic motion, tactile physics, and refined aesthetics, it escapes the utilitarian bounds of traditional date-pickers to deliver an immersive, highly curated user experience. Fully client-side and optimized for uncompromising performance, Wallscape transforms personal scheduling into a premium interactive surface.

---

## ✨ Features & Creative Liberties

While adhering to core calendar requirements, this project introduces several novel mechanics designed to delight and optimize:

*   **Phantom Memory Engine:** A unique UX pattern that prevents visual clutter over time. Saved date ranges automatically clear visually to keep the grid immaculate, but reappear instantly as a contextual *Memory Card* when clicking any date within that hidden range.
*   **Hardware-Accelerated 3D Physics:** Interactions carry weight. Leveraging Framer Motion, the calendar features reactive mouse-tilt parallax effects, creating a sense of depth and spatial awareness, along with heavy spring-drop animations for delightful, tactile feedback.
*   **Zero-Latency Preloader:** A cinematic loading sequence masks the initial boot, utilizing a `Promise.all` caching layer. This guarantees all high-fidelity images, videos, and graphical assets are fully cached in memory before the UI is revealed, eliminating texture pop-in or layout jank.
*   **Canvas Compression Uploads:** Built entirely client-side, a custom HTML5 canvas scaler compresses user-uploaded high-resolution hero images into optimized Base64 payloads. This ingenuity entirely bypasses standard `localStorage` 5MB quota restrictions without requiring a backend.
*   **High-Fidelity Export & Authoring:** Seamlessly export the entire customized view into a high-resolution snapshot via `html-to-image`. Authoring capabilities also include unified pill-shaped range selections and our "Triple-Layered" note system (Month, Cross-Range, and Single Day annotations).

---

## 🏗️ Technical Architecture

This application acts as a masterclass in modern frontend architecture, aggressively pushing the limits of the browser:

*   **Framer Motion for Physics:** Chosen over standard CSS transitions to inject realistic spring physics, dampening, and custom inertia models into the DOM. Every micro-interaction is mapped to a carefully tuned physics spring.
*   **Date-fns (Headless Logic):** To preserve absolute freedom over the UI mapping, `date-fns` handles the headless calendar logic. Timezone complexity, leap years, and offset calculations are handled externally, feeding a pure rendering cycle.
*   **SVG Masking & Texture Blending:** One of the most challenging layout hurdles was the organic division between the high-resolution hero media and the utilitarian data grid. We utilize intricate SVG masking to render a seamless, paper-textured wave—blending the two planes perfectly regardless of viewport scaling.

---

## 🚀 Running Locally

Ready to experience the UI locally? Follow these steps to spin up the development environment.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/wallscape.git
cd wallscape