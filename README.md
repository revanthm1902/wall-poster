# 🗓️ Wall Poster: Interactive Calendar

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Next JS](https://img.shields.io/badge/Next-white?style=for-the-badge&logo=next.js&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer](https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue)

**Wall Poster** is a completely reimagined digital wall calendar application component, built as a definitive Frontend Engineering Challenge. By blending cinematic motion, tactile physics, and refined architectural aesthetics, Wall Poster escapes the utilitarian bounds of traditional date-pickers to deliver an immersive, highly curated user experience. Fully client-side and optimized for uncompromising performance, it transforms personal scheduling into a premium interactive surface.

---

## 🎨 UI Preferences & Design Philosophy

Wall Poster was designed with a strict set of UI principles aimed at delivering a "premium tactile" feel, mimicking high-end physical products in a digital space:

*   **Tactile Physics over Linear Animation:** Every interaction—hovering over a date, opening a note, uploading an image—is bound to Framer Motion spring physics. This provides organic dampening, mass, and stiffness rather than sterile ease-in-out curves.
*   **Depth & Dimensionality:** Utilizing heavy mouse-tilt parallax `perspective` styling, the calendar feels like a 3D object resting inside the browser.
*   **Minimalist Data Presentation:** Dates and notes are stylized with stark typography, ample whitespace, and high-contrast borders, taking inspiration from brutalist poster design and physical print media.
*   **Fluid Masking:** A seamless "Paper-Textured Wave" SVG mask organically separates the high-resolution hero imagery from the utilitarian, monochrome data grid.

---

## ✨ Comprehensive Features & Creative Liberties

While adhering to all core calendar requirements, Wall Poster introduces several novel capabilities to delight users and optimize browser performance:

### 1. The Phantom Memory Engine
A completely unique UX pattern designed to prevent visual clutter over months of usage. Saved date ranges automatically clear their visual highlights to keep the calendar grid immaculate. However, they remain stored—clicking *any* date within a hidden range instantly summons a floating, contextual **Memory Card** containing all associated notes and data.

### 2. Intelligent Priority Preloader
To guarantee a flawless first impression, Wall Poster masks its initial boot behind a cinematic loading sequence. Under the hood, a priority `Promise` cache aggressively forces the browser to decode the *current* month's hero image and background video into memory *before* revealing the UI, perfectly bypassing layout jank. The remaining 11 months are then seamlessly and silently fetched in the background, allowing the user immediate entry on fast or slow connections alike.

### 3. Canvas Compression Uploads
Because the application is completely client-side, storing high-resolution user-uploaded hero images directly into `localStorage` would instantly hit the standard 5MB quota. To bypass this, Wall Poster features a built-in HTML5 canvas scaler. When an image is uploaded, it is automatically intercepted, resized, deeply compressed, and converted into an optimized Base64 string before saving.

### 4. Seamless Authoring & High-Fidelity Export
*   **Triple-Layered Notes:** Users can annotate their calendar at three distinct levels: the entire **Month**, a specific **Cross-Range** of days, or a **Single Day**.
*   **Pill-Shaped Range Selections:** Dragging across dates creates a smooth, unified "pill" visual that dynamically calculates its bounds—no broken rectangles or jagged highlights.
*   **`html-to-image` Snapshot Export:** Users can perfectly capture their personalized, curated calendar grid and instantly export it as a high-resolution PNG, seamlessly masking out any active UI controls for a clean output.

---

## 🧠 Key Engineering Decisions

Why were certain tools or patterns used?
*   **Framer Motion over CSS Transitions:** CSS animations are fundamentally time-based (easing curves). Framer Motion utilizes physics-based math (mass, stiffness, dampening), which is crucial for recreating the heavy, tactile weight of dragging and dropping a physical wall calendar.
*   **`date-fns` over `moment.js`:** `date-fns` is pure, modular, and headless. It simply outputs math and arrays rather than heavy localized object states, ensuring the UI layer remains completely free to map the grid however it wants without fighting a rigid calendar library.
*   **Custom Asset Promises over native Next.js `<Image/>`:** While Next.js provides excellent lazy-loading image optimization, this challenge required a synchronized "cinematic boot". Utilizing raw `window.Image()` and `Promise.race()` arrays provided the strict programmatic control needed over *exact* load times to drive the loading bar progression and ensure the video and hero image mounted on the exact same frame.
*   **`localStorage` over a Database:** To ensure the challenge could be flawlessly reviewed instantly by anyone without provisioning a backend, configuring `.env` variables, or spinning up Docker containers. Data parsing was rigorously typed and compressed to prove frontend ingenuity around standard 5MB browser quotas.

---

## 🏗️ System Architecture

This application acts as a masterclass in modern frontend architecture, aggressively pushing the limits of the browser by decoupling state, logic, and rendering.

### 1. The Rendering Layer (Next.js App Router & React)
Leveraging the power of Next.js App Router for strict, clean routing logic alongside `useClient` boundaries. The application is built using isolated atomic components (`CalendarGrid.tsx`, `PosterStudio.tsx`) to ensure isolated, highly optimized re-renders when dragging date ranges.

### 2. The Animation Engine (Framer Motion)
Every micro-interaction is mapped to a tuned physics spring, importantly including the 3D tilt calculations which actively trace the user's `clientX/Y` mapping mathematically against the component's bounding box.

### 3. The Headless Data Logic (date-fns)
To preserve absolute freedom over the UI mapping, `date-fns` acts as the pure headless engine. Timezone complexities, leap years, offset calculations, and iterating over month grids are handled externally. The UI simply consumes these pure arrays, separating presentation from logic.

### 4. The Client Data Store (localStorage)
Because the app guarantees a private, immediate experience, all state—including customized settings, user-uploaded Base64 strings, and saved date notes—is cleanly serialized, typed, and pushed into `localStorage` via persistent React hooks.

---

## 🚀 Running Locally

Ready to experience the physics and UI locally? Follow these steps to spin up the development environment.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/wallscape.git
cd wallscape
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛠️ Stack & Libraries
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animation & Physics:** [Framer Motion](https://www.framer.com/motion/)
- **Date Logic:** [date-fns](https://date-fns.org/)
- **Exporting:** [html-to-image](https://github.com/bubkoo/html-to-image)
- **Icons:** [Lucide React](https://lucide.dev/)

---

> *"Design is not just what it looks like and feels like. Design is how it works."* – Built with meticulous attention to detail as a Frontend Engineering Challenge.