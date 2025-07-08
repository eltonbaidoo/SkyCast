---

# SkyCast

[Live Demo](https://skycast.eltonbaidoo.com/)

SkyCast is a modern weather application that provides real-time weather and local time for any city worldwide. It features a beautiful glassmorphism design, vibrant weather-specific color palette, and seamless support for both light and dark modes.

---

## ✨ Features

- **Glassmorphism Panels:** Modern, semi-transparent panels with backdrop blur for a frosted-glass effect.
- **Radial Gradient Backgrounds:** Soft, responsive radial gradients for visual depth.
- **Vibrant Weather Colors:** Custom color palette for clear weather condition distinction.
- **Dark Mode Support:** Seamless experience in both light and dark themes.
- **Responsive Design:** Optimized for desktop and mobile devices.
- **PWA Ready:** Installable and offline-capable.
- **City Search:** Instantly check weather and time for any city.
- **Favorites:** Save and quickly access your favorite locations.

---

## 🛠️ Technologies Used

- **Next.js** (App Router)
- **React**
- **Tailwind CSS** (with custom config for glassmorphism and weather colors)
- **TypeScript**
- **PWA Support**

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/skycast.git
   cd skycast
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## 🖼️ Design System Highlights

- **Glassmorphism:**  
  Panels use backdrop blur, transparency, and subtle borders for a frosted-glass effect.
- **Radial Gradients:**  
  The background features a radial gradient for both light and dark modes.
- **Weather Colors:**  
  Custom Tailwind palette for weather conditions (blue, lightBlue, cyan, teal, yellow, red).

---

## 📦 Project Structure

```
app/
  globals.css         # Global styles (including glassmorphism)
  layout.tsx          # Main layout with radial gradient background
  page.tsx            # Main weather UI with glass panel
components/
  theme-toggle.tsx    # Theme switcher (light/dark)
  ...                 # Other UI components
tailwind.config.ts    # Tailwind CSS config (custom colors, gradients)
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)

---
