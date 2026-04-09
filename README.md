# 🗓️ Wall Poster: Interactive Calendar

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Next JS](https://img.shields.io/badge/Next-white?style=for-the-badge&logo=next.js&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer](https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue)

**Wall Poster** is a completely reimagined digital wall calendar application component, built as a definitive Frontend Engineering Challenge. By blending cinematic motion, tactile physics, and refined architectural aesthetics, Wallscape escapes the utilitarian bounds of traditional date-pickers to deliver an immersive, highly curated user experience. Fully client-side and optimized for uncompromising performance, it transforms personal scheduling into a premium interactive surface.

---

## 🎨 UI Preferences & Design Philosophy

Wallscape was designed with a strict set of UI principles aimed at delivering a "premium tactile" feel, mimicking high-end physical products in a digital space:

*   **Tactile Physics over Linear Animation:** Every interaction—hovering over a date, opening a note, uploading an image—is bound to Framer Motion spring physics. This provides organic dampening, mass, and stiffness rather than sterile ease-in-out curves.
*   **Depth & Dimensionality:** Utilizing heavy mouse-tilt parallax `perspective` styling, the calendar feels like a 3D object resting inside the browser.
*   **Minimalist Data Presentation:** Dates and notes are stylized with stark typography, ample whitespace, and high-contrast borders, taking inspiration from brutalist poster design and physical print media.
*   **Fluid Masking:** A seamless "Paper-Textured Wave" SVG mask organically separates the high-resolution hero imagery from the utilitarian, monochrome data grid.

---

## ✨ Comprehensive Features & Creative Liberties

While adhering to all core calendar requirements, Wallscape introduces several novel capabilities to delight users and optimize browser performance:

### 1. The Phantom Memory Engine
A completely unique UX pattern designed to prevent visual clutter over months of usage. Saved date ranges automatically clear their visual highlights to keep the calendar grid immaculate. However, they remain stored—clicking *any* date within a hidden range instantly summons a floating, contextual **Memory Card** containing all associated notes and data.

### 2. Zero-Latency Cinematic Preloader
To guarantee a flawless first impression, Wallscape masks its initial boot behind a cinematic loading sequence. Under the hood, a `Promise.all` caching layer pre-fetches and forces the browser to decode all high-fidelity images, videos, and graphical assets into memory *before* revealing the UI, entirely eliminating texture pop-in or layout jank.

### 3. Canvas Compression Uploads
Because the application is completely client-side, storing high-resolution user-uploaded hero images directly into `localStorage` would instantly hit the standard 5MB quota. To bypass this, Wallscape features a built-in HTML5 canvas scaler. When an image is uploaded, it is automatically intercepted, resized, deeply compressed, and converted into an optimized Base64 string before saving.

### 4. Seamless Authoring & High-Fidelity Export
*   **Triple-Layered Notes:** Users can annotate their calendar at three distinct levels: the entire **Month**, a specific **Cross-Range** of days, or a **Single Day**.
*   **Pill-Shaped Range Selections:** Dragging across dates creates a smooth, unified "pill" visual that dynamically calculates its bounds—no broken rectangles or jagged highlights.
*   **`html-to-image` Snapshot Export:** Users can perfectly capture their personalized, curated calendar grid and instantly export it as a high-resolution PNG, seamlessly masking out any active UI controls for a clean output.

---

## 🏗️ System Architecture

This application acts as a masterclass in modern frontend architecture, aggressively pushing the limits of the browser by decoupling state, logic, and rendering.

### 1. The Rendering Layer (Next.js App Router & React)
Leveraging the power of React Server Components (where applicable) and Next.js App Router for strict, clean routing logic. The application is built using isolated atomic components (`CalendarGrid.tsx`, `PosterStudio.tsx`) to ensure isolated re-renders.

### 2. The Animation & Physics Engine (Framer Motion)
Chosen over standard CSS transitions to inject realistic physics into the DOM. Every micro-interaction is mapped to a carefully tuned physics spring (`useSpring`, `AnimatePresence`), including the 3D tilt calculations which trace the user's `clientX/Y` mapping against the component's bounding box.

### 3. The Headless Data Logic (date-fns)
To preserve absolute freedom over the UI mapping, `date-fns` acts as the pure headless engine. Timezone complexities, leap years, offset calculations, and iterating over month grids are handled externally. The UI simply consumes these pure arrays, separating presentation from logic.

### 4. The Client Data Store (localStorage)
Because the app guarantees a private, immediate experience with zero backend dependencies, all state—including customized settings, user-uploaded Base64 strings, and saved date notes—is cleanly serialized, typed, and pushed into `localStorage` via persistent React `useEffect` hooks.

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