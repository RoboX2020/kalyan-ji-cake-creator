<p align="center">
  <img src="https://img.shields.io/badge/🎂_Kalyan--Ji_Bakery-Cake_Creators_Programme-C8956C?style=for-the-badge&labelColor=2C1A0E" alt="Kalyan-Ji Bakery" />
</p>

<h1 align="center">Cake Creators Programme</h1>

<p align="center">
  <em>Design your dream cake with AI-powered visualization — then order it for real.</em>
</p>

<p align="center">
  <a href="https://kalyan-ji-cake-creator.vercel.app"><img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_App-25D366?style=flat-square" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Gemini_AI-Imagen_4-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## ✨ What is this?

**Cake Creators Programme** is an interactive web application for **Kalyan-Ji Bakery** that lets customers design their dream cake using natural language and AI image generation. Describe any cake you can imagine — "a 3-tier galaxy-themed cake with edible glitter and gold leaf" — and the app generates a photorealistic image using Google's **Imagen 4** and **Gemini Flash**.

Once you've perfected your design, share it directly with the bakery via **WhatsApp** to place a real order.

## 🚀 Features

| Feature | Description |
|---|---|
| **🎨 AI Cake Generator** | Describe your cake in plain English → get a photorealistic image via Imagen 4 |
| **📷 Inspiration Upload** | Upload a reference photo to guide the AI's output |
| **💬 WhatsApp Ordering** | One-tap order sharing with size, date, and custom notes |
| **📚 Community Library** | Browse, rate, and remix designs from the bakery's template collection |
| **🧁 Isometric Previews** | Real-time SVG cake renderer with configurable shapes, tiers, and decorations |
| **📱 Fully Responsive** | Optimized for desktop, tablet, and mobile devices |
| **🔑 Bring Your Own Key** | Users enter their own Gemini API key — no server required |

## 🏗️ Architecture

This is a **zero-build, static web app** — no bundler, no Node.js server, no framework boilerplate. It runs entirely in the browser:

```
index.html          → Entry point with design system CSS
js/
├── cake-data.js        → Flavour/filling/frosting/decoration data catalog
├── cake-ai-image.js    → Gemini API integration (Imagen 4 + Flash fallback)
├── cake-renderer.jsx   → Isometric SVG cake renderer (round/square/heart)
├── cake-image-preview.jsx → Animated pixel-art loading canvas
├── cake-builder.jsx    → Prompt-first cake creation UI
├── cake-library.jsx    → Community browsing, rating, and commenting
├── cake-whatsapp.jsx   → WhatsApp order sheet with size picker
├── cake-app.jsx        → App shell, routing, and state management
└── tweaks-panel.jsx    → Design customization controls
```

**Tech stack:**
- **React 18** (via CDN, no build step)
- **Babel Standalone** (JSX transpilation in-browser)
- **Google Gemini API** — Imagen 4 for image generation, Gemini 2.0 Flash for prompt expansion
- **Vanilla CSS** — Custom design system with CSS variables
- **LocalStorage** — Client-side persistence for history and saved cakes

## ⚡ Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/RoboX2020/kalyan-ji-cake-creator.git
cd kalyan-ji-cake-creator
```

### 2. Serve locally

Any static file server works:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .

# VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

### 3. Open in browser

Navigate to `http://localhost:8000` and start designing cakes!

### 4. Add your API key

Click the **"Create"** tab → enter your [Google AI Studio API key](https://aistudio.google.com/apikey) in the prompt area. The key is stored locally in your browser — never sent anywhere except Google's API.

## 🔑 API Key Setup

The app uses **Google's Gemini API** for AI features. You need a free API key:

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key (free tier includes generous limits)
3. Paste it into the app's API key input when you first visit the Create page

**For deployment with a pre-configured key:**

```html
<!-- Add before other scripts in index.html -->
<script>window.__CAKE_API_KEY = 'your-key-here';</script>
```

## 🌐 Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Any static host

This is a plain HTML/CSS/JS app with no build step. Upload the files to any static host:
- **Vercel** / **Netlify** / **Cloudflare Pages** — just connect the repo
- **GitHub Pages** — enable in repo settings
- **S3 + CloudFront** — upload files to a bucket

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built with 🎂 by <strong>Kalyan-Ji Bakery</strong> · London</sub>
</p>
