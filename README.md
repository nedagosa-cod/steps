<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/ReactFlow-11-FF6B6B?style=for-the-badge" alt="ReactFlow" />
  <img src="https://img.shields.io/badge/Fabric.js-7-FF7300?style=for-the-badge" alt="Fabric.js" />
  <img src="https://img.shields.io/badge/Electron-40-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

<h1 align="center">🖥️ SimuBuild</h1>

<p align="center">
  <strong>A visual, no-code simulator builder for enterprise software training.</strong><br/>
  Design interactive replicas of real business applications so new employees can practice in safe, simulated environments — eliminating costly mistakes in production systems.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#️-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-export-options">Export</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-license">License</a>
</p>

---

## 💡 The Problem

Onboarding new call center agents, back-office operators, or any employee that relies on specialized internal software is **expensive and risky**. Traditional training methods include:

- Granting access to **production systems** where mistakes have real consequences.
- Building disposable **sandbox environments** that quickly become outdated.
- Recording static **video walkthroughs** that don't test real comprehension.

**SimuBuild** solves this by letting trainers **visually build interactive simulations** of any software application using just screenshots and a powerful trigger system — no coding required.

---

## ✨ Features

### 🎨 Visual Node-Based Editor
- **Drag-and-drop canvas** powered by ReactFlow to design simulation flows.
- Four specialized node types:
  | Node | Purpose |
  |------|---------|
  | **Screen Node** | Represents an application screen using uploaded screenshots or videos |
  | **Auth Node** | Login / welcome gate with customizable title, objectives, and score tracking |
  | **Result Node** | End-of-simulation summary with completion messages |
  | **Ranking Node** | Leaderboard to display top performer scores |
- **MiniMap & Controls** for navigating large simulation flows.
- **Undo / Redo** history with full state tracking.

### 🎯 Rich Trigger System
Define exactly how users interact with each simulated screen:

| Trigger Type | Description |
|---|---|
| `click` | Single click on a hotspot area |
| `double_click` | Double click interaction |
| `input` | Text field with value validation |
| `input_date` | Date picker field |
| `dropdown` | Select menu with predefined options |
| `dependent_dropdown` | Cascading / nested dropdowns |
| `keypress` | Specific keyboard shortcut detection |
| `scroll_area` | Scrollable content regions with nested triggers |
| `floating_window` | Draggable overlay panels with nested triggers |
| `table_grid` | Configurable data tables/grids |
| `radio` | Single-option selection |
| `checkbox` | Multi-option selection |

Each trigger has a **visual hotspot overlay** with precise `x, y, width, height` positioning (in %) directly on the screenshot, making it intuitive to map interactive areas.

### 🖌️ Built-in Image Editor
- **Fabric.js-powered** image editor for annotating and modifying screenshots.
- **Scroll Image Builder** — stitch multiple screenshots into a single scrollable image for simulating long pages.
- **Scroll Image Library** — save and reuse scroll compositions across your projects.

### 👁️ Preview & Focus Modes
- **Preview Mode** — run your simulation exactly as the end user will experience it, with the full engine powered by `usePreviewMode`.
- **Focus Mode** — zoom into a single node for detailed editing without distractions.

### 📦 Export Options
- **Export as ZIP** — generates a standalone HTML/CSS/JS player bundle that runs in any browser, zero dependencies. Media assets are extracted from Base64 into an optimized `assets/` folder.
- **Export as .EXE** — package the simulation as a native Windows desktop application via Electron, with real-time progress tracking during the build process.
- **Save / Load Projects** — serialize your entire simulation (nodes, edges, configuration) as a `.json` file for later editing.

### ⚙️ Global Configuration
- Customizable simulator title, brand colors, timers, and layout settings.
- Mobile mode toggle for simulating phone-sized applications.
- Resizable right configuration panel for a comfortable editing workspace.

---

## 🔄 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌────────────────┐
│  1. CAPTURE  │ ──▶ │  2. BUILD    │ ──▶ │  3. CONFIGURE   │ ──▶ │  4. EXPORT     │
│  Screenshots │     │  Node Flow   │     │  Triggers &     │     │  ZIP / EXE /   │
│  of your app │     │  on Canvas   │     │  Interactions   │     │  Web Player    │
└─────────────┘     └──────────────┘     └─────────────────┘     └────────────────┘
```

1. **Capture** — Take screenshots of each screen in the real application you want to simulate.
2. **Build** — Create Screen Nodes on the canvas and upload each screenshot. Connect nodes with edges to define the navigation flow.
3. **Configure** — Add triggers (clicks, inputs, dropdowns, etc.) on each screen to define where and how the user must interact. Set validation rules and navigation targets.
4. **Export** — Generate a self-contained simulator as a ZIP (web), EXE (desktop), or keep the project file for future edits.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 19 | Component-based UI |
| **Build Tool** | Vite 7 | Fast HMR & optimized builds |
| **Flow Editor** | ReactFlow 11 | Node-based visual canvas |
| **Image Editing** | Fabric.js 7 | Canvas manipulation & annotation |
| **Styling** | TailwindCSS 4 | Utility-first styling |
| **Icons** | Lucide React | Clean, consistent iconography |
| **Bundling** | JSZip + FileSaver | ZIP generation for export |
| **Desktop** | Electron 40 | Native .EXE packaging |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/simubuild.git
cd simubuild

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Generate a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 📁 Project Structure

```
simubuild/
├── src/
│   ├── features/                  # Feature-based architecture
│   │   ├── config/                # Node & global configuration panels
│   │   │   ├── components/        #   NodeConfigPanel, GlobalConfigPanel, TriggerCard
│   │   │   └── hooks/
│   │   ├── editor/                # Image editing tools
│   │   │   ├── components/        #   ImageEditor, ScrollImageBuilder, ScrollImageLibrary
│   │   │   └── hooks/             #   useImageEditor
│   │   ├── export/                # Export system
│   │   │   ├── components/        #   ExportProgressDialog
│   │   │   ├── exporter.js        #   ZIP export logic
│   │   │   └── exporterExe.js     #   Electron EXE export logic
│   │   ├── nodes/                 # Custom ReactFlow nodes
│   │   │   ├── ScreenNode.jsx     #   Main simulation screen
│   │   │   ├── AuthNode.jsx       #   Login / access gate
│   │   │   ├── ResultNode.jsx     #   Completion screen
│   │   │   ├── RankingNode.jsx    #   Leaderboard
│   │   │   └── ButtonEdge.jsx     #   Custom deletable edge
│   │   └── view-modes/            # Preview & Focus modes
│   │       ├── components/        #   PreviewMode, FocusMode
│   │       └── hooks/             #   usePreviewMode (simulation engine)
│   ├── shared/                    # Reusable across features
│   │   ├── components/            #   TopNavbar, LeftSidebar, RightSidebar
│   │   ├── constants/             #   initialState (defaults)
│   │   ├── hooks/                 #   useHistory (undo/redo)
│   │   └── utils/                 #   triggers.js (trigger data model)
│   ├── export/                    # Standalone player templates
│   │   ├── index.html             #   Player HTML shell
│   │   ├── app.js                 #   Player runtime engine
│   │   └── styles.css             #   Player styles
│   ├── App.jsx                    # Root orchestrator
│   └── main.jsx                   # Entry point
├── electron/                      # Electron wrapper for EXE builds
├── public/                        # Static assets
└── package.json
```

> The project follows a **feature-based architecture** with strict separation of concerns — UI components are purely visual, all logic lives in custom hooks, and shared utilities are centralized.

---

## 🗺️ Roadmap

SimuBuild is actively evolving toward becoming a full SaaS platform:

- [ ] ☁️ **Cloud storage** — Save and manage simulations online
- [ ] 👥 **Multi-user collaboration** — Real-time co-editing of simulation flows
- [ ] 📊 **Analytics dashboard** — Track trainee performance, completion rates, and scores
- [ ] 🏢 **Organization management** — Teams, roles, and permissions
- [ ] 🌐 **Web deployment** — One-click publish simulations to a shareable URL
- [ ] 📱 **Responsive simulator player** — Optimized playback on tablets and phones
- [ ] 🔗 **LMS integration** — SCORM/xAPI compatibility for enterprise LMS platforms
- [ ] 🤖 **AI-assisted trigger detection** — Auto-detect interactive areas from screenshots

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<p align="center">
  Made with ❤️ by <strong>Nestor Gomez</strong>
</p>