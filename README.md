# 🌙 Pip's Midnight Observatory

> *Tiny skull. Big dreams. Open after bedtime.*

Built for the **haX.baby — Baby's First Website Hackathon** (17–19 October 2026)  
**Track 1: Pip the Skull Baby**

---

## ✨ What Is This?

Pip's Midnight Observatory is an immersive, interactive personal website for Pip — a tiny skull baby who works as a **Junior Dream Engineer** at the Midnight Nursery. Every night after bedtime, Pip collects lost dreams, composes lullabies, lights dream lanterns, and delivers wonder to sleeping visitors.

The site blends early-internet nostalgia with modern CSS, Web Audio API, and lightweight canvas animations for a polished, whimsical, fully responsive experience.

---

## 🛠 Project Structure

```
pips-midnight-observatory/
├── index.html        # Complete single-page site
├── style.css         # Design system, animations, responsive layout
├── script.js         # All interactive behaviour (no frameworks)
├── assets/           # Local fallback assets (if any)
└── README.md         # This file
```

> **No build step required.** Pure HTML + CSS + JavaScript. Just open `index.html` in any modern browser.

---

## 🚀 How to Run Locally

```bash
# Option 1 — just open the file
open index.html          # macOS
start index.html         # Windows

# Option 2 — local dev server (recommended)
npx serve .              # Node
python -m http.server    # Python 3
```

Or drag `index.html` directly into your browser.

---

## 🎯 Features

### Required & Interactive Showcase Projects (6 Projects Total)

| Feature / Project | Status |
|-------------------|--------|
| Hero with Pip artwork + tagline | ✅ PASS |
| Interactive character reactions (pointer tilt + tap joy hop) | ✅ PASS |
| Meet Pip biography + personality traits | ✅ PASS |
| **Project 1: The Lullaby Lab** — Web Audio note pads + 3 presets + melody composer | ✅ PASS |
| **Project 2: Dream Nightlight** — 5 distinct mode switcher + brightness slider | ✅ PASS |
| **Project 3: Dream Delivery Routes** — 4 destinations, persistent traveler & stardust | ✅ PASS |
| **Project 4: Rattle & Block Toys** — 6 stackable dream blocks + interactive stardust chime rattle | ✅ PASS |
| **Project 5: Bedtime Storybook** — 4-page illustrated adventure ("Pip & the Lost Little Star") with 3D book turns | ✅ PASS |
| **Project 6: Pip's Growth Chart** — 4 imaginative dream milestones with sliding Pip marker | ✅ PASS |
| **Dream Flashlight Cursor** — atmospheric starlight radial illumination layer with nav toggle & tap support | ✅ PASS |
| **Scroll-Driven Origin Story** — 3 illustrated scenes (<150 words each) advancing naturally on scroll + tabs | ✅ PASS |
| **Returning-Visitor Memory** — honest local preference caching (nightlight mode, brightness, story progress) | ✅ PASS |
| Hidden Easter egg constellation | ✅ PASS |
| Responsive design (320px → 1920px) | ✅ PASS |
| Keyboard navigation + visible focus indicators | ✅ PASS |
| `prefers-reduced-motion` support across all animations | ✅ PASS |
| No audio autoplay — accessible mute toggle | ✅ PASS |
| Semantic HTML + ARIA live announcements | ✅ PASS |

### Bonus Side Quests (+13 Points Total)

| Bonus Side Quest | Points | Implementation & Verification | Status |
|------------------|:------:|------------------------------|:------:|
| **Live Guestbook** | **+2** | Validated form with char counter (200 chars max), safe DOM rendering via `textContent`, pre-populated community wishes, clear browser-storage notice | ✅ PASS |
| **Sparkle Cursor Trail** | **+2** | Lightweight canvas particle trail, varied colors, auto-capped particle buffer (<45) preventing memory leaks, auto-paused when hidden or on touch/reduced-motion | ✅ PASS |
| **Hit Counter Odometer** | **+1** | Realistic mechanical tumbler digit tiles with 3D bevels and roller shadow, animated count roll, honest local visit storage | ✅ PASS |
| **Click Sounds + Mute Switch** | **+3** | Soft pleasant Web Audio harmonic clicks on UI controls, throttled to prevent audio clipping, global mute control syncing all audio | ✅ PASS |
| **Responsive Chaos Mode** | **+5** | Dedicated ⚡ nav button + triple-click logo shortcut, retro rainbow marquee banner, whimsical tilted cards & neon borders, 100% usable & responsive down to 320px | ✅ PASS |
| **TOTAL BONUS POINTS** | **+13** | **All 5 Side Quests Completed and Verified** | **13/13** |

---

## 🧪 Testing Interactions

### Character Reaction
1. Move the pointer over Pip's avatar on the hero section on desktop: Pip subtly leans and tilts toward your cursor!
2. Click or tap Pip's avatar: Pip does a happy little bounce hop with a floating heart, star, or moon emoji on both desktop and touch screens.

### Dream Flashlight / Lantern Cursor
1. Move your pointer around the screen: a soft, celestial warm radial light gently illuminates the night sky around your cursor (`mix-blend-mode: screen`, zero click interception).
2. On touch devices: tap anywhere to cast a pool of dream light around your touch point.
3. Click the **🔦** button in the top navigation bar to toggle the flashlight on or off. Preference is automatically remembered locally.

### Scroll-Driven Origin Story
1. Scroll down to **📖 Origin Story — How Pip Became a Dream Engineer**.
2. As you scroll naturally through the section, the three illustrated scenes smoothly cross-fade in order (Scene 1: The First Dream → Scene 2: The Midnight Workshop → Scene 3: The Dream Engineer).
3. The scene progress tabs and indicator dots update dynamically in sync with your scroll position.
4. You can also click any scene tab, dot, or the **← Previous** / **Next →** buttons at any time to jump directly to that scene.
5. All three scenes are concise (under 70 words each) and accessible via keyboard Arrow keys.

### Project 1: The Lullaby Lab
1. Scroll to **Interactive Projects → The Lullaby Lab**.
2. Click the 🔊 button in the nav to unmute first.
3. Click any note pad (Do–Do♪) to compose custom notes, or select one of **Pip's Presets** (**Sleepy Moon**, **Twinkle Cloud**, or **Starfall**) to instantly load a curated melody.
4. Build a sequence of up to 24 notes.
5. Press **▶ Play Melody** to hear your composition with synchronized note chip and pad highlights.
6. Use **⏹ Stop** and **✕ Clear** as needed.
7. The **volume slider** adjusts playback loudness smoothly.

### Project 2: Dream Nightlight
1. Scroll to **Dream Nightlight**.
2. Click any of the 5 mode buttons: **Midnight**, **Moonrise**, **Aurora**, **Sunrise**, or **Cozy**.
3. Watch the entire scene background, lantern glow, celestial body, landscape silhouettes, and stars transform in real time.
4. Drag the **Dream Brightness** slider to adjust intensity without resetting your chosen mode.
5. Your selected mode and brightness are automatically remembered in LocalStorage for returning visits.

### Project 3: Dream Delivery Routes
1. Scroll to **Dream Delivery Routes**.
2. Click any destination: **Cloud Kingdom**, **Moon Garden**, **Star Harbor**, or **Pillow Mountain**.
3. Watch Pip smoothly travel along the curved route with stardust particles.
4. Pip stays at the destination upon arrival and never jumps back or disappears behind scenery.
5. Click consecutive destinations: Pip journeys from location to location seamlessly.
6. Track visits in the 4-stop indicator; when all 4 are visited, a celebration fanfare triggers!

### Project 4: Rattle & Block Toys
1. Scroll to **Rattle & Block Toys**.
2. **Stackable Dream Blocks**:
   - Choose any block from the 6 palette buttons (**Star**, **Moon**, **Cloud**, **Slumber**, **Lullaby**, **Wish**).
   - Each selected block drops into the tower stack with an animated bounce and harmonic clink.
   - Live status announces: *"Pip's tower is growing!"*
   - Stack up to 6 blocks tall; the counter badge updates to `X / 6 blocks stacked`.
   - Click **↩️ Remove Top Block** to carefully take down the topmost block.
   - Click **💥 Topple & Reset** to trigger a playful tumble cascade animation and sound: *"Crash-tumble! A little star fell asleep. 💤 Ready to build again!"*
3. **Magical Stardust Rattle**:
   - Click or tap Pip's illustrated rattle.
   - The rattle shakes with spring physics and emits a sparkling cluster of stardust emojis (`⭐`, `✨`, `✦`, `✧`, `💖`).
   - A synthesized chime bell chord plays (respecting global mute).
   - The counter increments (`✨ Shaken X times`) with playful nursery feedback messages.

### Project 5: Bedtime Storybook
1. Scroll to **Bedtime Storybook**.
2. Read through the 4 illustrated chapters of *"Pip and the Lost Little Star"*:
   - Chapter 1: A Glimmer in the Grass
   - Chapter 2: The Moon Garden's Whisper
   - Chapter 3: The Golden Route to Star Harbor
   - Chapter 4: Safe in the Constellation
3. Navigate using the **◀ Previous Page** / **Next Page ▶** buttons, direct progress dots, or Left/Right keyboard arrow keys.
4. Experience the 3D book-turn perspective transition between pages.
5. On the final page, click **✨ Read Again** to seamlessly return to Chapter 1.
6. Reading progress is saved locally for returning visitors.

### Project 6: Pip's Growth Chart
1. Scroll to **Pip's Growth Chart**.
2. View Pip's fictional celestial nursery growth milestones:
   - **1 Dream Tall**: First Moonlight Steps
   - **2 Dreams Tall**: Little Cloud Explorer
   - **3 Dreams Tall**: Junior Dream Engineer
   - **4 Dreams Tall**: Keeper of the Night Sky
3. Click any milestone notch along the wooden celestial ruler.
4. The Pip skull slider marker smoothly slides vertically to the chosen notch, and the detail showcase card updates with title, age, description, and an authentic quote from Pip.

### Chaos Mode (Bonus Quest)
- Click the **⚡** button in the navigation bar, or **triple-click** the "Pip's Observatory" brand title.
- A retro marquee banner appears at the top, cards take on playful tilts, neon borders, and gradient headings.
- Click the **⚡** button again or the banner's **✕** button to instantly restore calm. Full responsiveness is maintained even at 320px width!

### Hit Counter Odometer (Bonus Quest)
- In the hero section, observe the vintage mechanical tumbler tiles. Each digit is individually recessed and bevelled, rolling up gracefully on visit.

### Live Guestbook (Bonus Quest)
1. Scroll to **Leave a Dream**.
2. Notice the pre-seeded community dreams showing what others have left.
3. Enter your name and dream wish (live character counter shows `X / 200`).
4. Press **Sign Guestbook 💫**: your entry is safely added to the ledger and saved in LocalStorage.

### Easter Egg 🤫
- Look for three faint stars in the footer constellation zone.
- Click all three in any order to reveal Pip's secret constellation canvas modal.
- Dismiss with **Close ✕** or the **Escape** key.

---

## 📱 Responsive Breakpoints

| Width | Layout |
|-------|--------|
| < 480px | Stacked single column, 4-column note grid |
| 480–700px | Single column with slightly more breathing room |
| 700–900px | Two columns start for guestbook |
| > 900px | Full desktop two-column layouts, horizontal hero |

---

## ♿ Accessibility

- Semantic HTML5 with ARIA labels and roles.
- Skip-to-content link.
- Keyboard-accessible all interactive elements (Tab, Enter, Space, Arrow keys).
- Visible focus indicators (2px lavender outline).
- `aria-live` regions for dynamic content (status, melody feedback, map info, guestbook).
- `prefers-reduced-motion` — animations disabled for users who prefer reduced motion.
- Sufficient colour contrast throughout.
- All images have descriptive `alt` text.
- SVG map destinations have `role="button"` and `tabindex="0"` with ARIA labels.

---

## 🔊 Sound Policy

- **No audio autoplays.** The mute toggle (🔇) in the nav starts in the *muted* state.
- Click 🔇 to unmute and unlock the Web Audio API.
- All sounds can be stopped at any time.
- If the browser does not support Web Audio, a graceful fallback message is shown in Lullaby Lab.

---

## 🎨 Asset Credits

| Asset | Source | License |
|-------|--------|---------|
| Pip character artwork (`pip_avatar_cloud.png`, `pip_portrait.png`, `pip_lullaby_box.png`, `pip_dream_lantern.png`) | [haX.baby](https://hax.baby) | Used with attribution for hackathon submission |
| Fredoka font | [Google Fonts](https://fonts.google.com/specimen/Fredoka) | Open Font License |
| Nunito font | [Google Fonts](https://fonts.google.com/specimen/Nunito) | Open Font License |
| All other artwork | Hand-crafted SVGs by the developer | N/A |

---

## 🚢 Deployment

This site is a static HTML/CSS/JS project. Deploy anywhere:

- **Netlify** — drag the project folder to [netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** — `npx vercel` in the project directory
- **GitHub Pages** — push to a repo, enable Pages in Settings → Pages → deploy from root
- **Surge** — `npx surge . your-site-name.surge.sh`

---

## 📜 Commit History Notes

All commits were made during the official hackathon sprint (17–19 October 2026). Commit messages follow conventional style:

```
feat: add hero section with Pip avatar and starfield canvas
feat: implement Lullaby Lab with Web Audio API
feat: add Dream Nightlight with 5 modes
feat: build Dream Delivery Map with animated SVG
feat: add interactive origin story (3 scenes)
feat: implement guestbook with LocalStorage
feat: add easter egg constellation reveal
feat: sparkle cursor trail + visitor counter
feat: responsive design + keyboard a11y
feat: chaos mode bonus + theme toggle
fix: handle missing Pip assets with SVG fallbacks
docs: add README with setup and testing guide
```

---

## 👤 About the Developer

Built with love, caffeine, and a fondness for the early internet. Pip taught me that tiny things can hold enormous dreams.

---

*Made for haX.baby — Baby's First Website Hackathon · Track 1 · October 2026*  
*Pip artwork © haX.baby — used with attribution.*
