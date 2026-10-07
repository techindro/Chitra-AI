# Contributing to Chitra-AI 🚀

First of all, thank you so much for taking the time to contribute! Whether you are fixing a small bug, adding a gorgeous new UI style, or polishing our image generation logic, we are thrilled to have you here. 

Chitra-AI is built on a mission to bring hyper-fast, state-of-the-art AI art rendering straight to creators with a clean, cinematic user experience. Let's build the future of AI canvas together.

---

## 🛠️ Getting Started Locally

Here is how you can set up the project on your machine:

1. **Fork & Clone**
   Fork this repository and clone it to your local machine:
   ```bash
   git clone https://github.com/your-username/chitra-chatbot.git
   cd chitra-chatbot
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your API tokens:
   ```env
   # Required for reference image / image-to-image features
   VITE_HF_TOKEN=your_huggingface_token
   
   # Required for paid tier generation features (Ideogram v4)
   VITE_IDEOGRAM_API_KEY=your_ideogram_api_key
   ```

4. **Run Development Server**
   Start the local dev server at `http://localhost:3000`:
   ```bash
   npm run dev
   ```

---

## 🎨 How Can You Help?

Here are some cool areas we are actively looking to improve:
- **Style Presets:** Adding more creative options inside `src/constants.js`.
- **UI/UX Aesthetics:** Making our Midjourney-inspired dark mode even more immersive with micro-interactions.
- **Mobile Packaging:** Optimizing components to run perfectly as a hybrid Android/iOS app using Capacitor.
- **Documentation:** Improving README files, writing helpful code comments, or building beginner tutorials.

---

## 📝 Code Style & Guidelines

To keep the codebase healthy, clean, and easy to read:
- **Functional Components:** We use modern React with hooks. Keep components focused, reusable, and neat.
- **CSS Variables:** Avoid hardcoding hex colors. Use the CSS tokens defined in `src/index.css` (e.g., `var(--bg)`, `var(--surface)`, `var(--text-secondary)`) so that both light and dark modes render beautifully.
- **Preserve Clean Code:** Please keep existing comments and explain your logic if you are introducing complex routing.
- **Build Verification:** Always run `npm run build` locally before pushing to make sure the bundler compiles everything with zero errors.

---

## 💬 Community & Communication

We want to keep this community supportive and friendly. When opening issues, PRs, or participating in discussions:
- Be respectful, constructive, and open-minded.
- Focus on building high-quality, accessible AI tools.
- Have fun coding!

If you have any questions or just want to align on a feature before writing code, feel free to open a GitHub Discussion or submit a draft issue. Happy creating! 🎨✨
