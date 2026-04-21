<h1 align="center">🖥️ SimuBuild</h1>

<p align="center">
  <strong>No-code simulator builder for enterprise software training</strong><br/>
  Build interactive replicas of real business applications so new employees<br/>can practice in safe, simulated environments — zero risk, zero code.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/ReactFlow-11-FF6B6B?style=flat-square" />
  <img src="https://img.shields.io/badge/Fabric.js-7-FF7300?style=flat-square" />
  <img src="https://img.shields.io/badge/Electron-40-47848F?style=flat-square&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow?style=flat-square" />
</p>

---

## 📸 Preview

<!-- 🔽 REPLACE with your actual screenshots 🔽 -->

<p align="center">
  <img src="./screenshots/editor-view.png" alt="SimuBuild Editor — Node-based simulation flow" width="90%" />
</p>
<p align="center"><em>Visual node-based editor — design simulation flows by connecting screens with interactive triggers</em></p>

<br/>

<p align="center">
  <img src="./screenshots/preview-mode.png" alt="SimuBuild Preview — Running a simulation" width="90%" />
</p>
<p align="center"><em>Preview mode — experience the simulation exactly as the end user would</em></p>

<!-- 🔼 REPLACE with your actual screenshots 🔼 -->

---

## 🧠 What is SimuBuild?

Companies that onboard employees into specialized internal software face a tough challenge: **How do you train someone on a system without giving them access to production?**

Traditional approaches — sandbox environments, video walkthroughs, or PDF manuals — are either **expensive to maintain**, **quickly outdated**, or **don't test real comprehension**.

**SimuBuild** is a visual tool that lets trainers **build fully interactive simulations** of any software application using just **screenshots + a powerful trigger system**. Trainees then practice navigating the application step by step, making real decisions, filling in forms, and clicking the right buttons — all in a completely safe environment.

### 🎯 Who is it for?

- **BPO / Call Centers** — Train agents on CRM, ticketing, and billing systems before they go live.
- **Enterprises** — Onboard employees on ERP, HRIS, or any internal tool.
- **Training Teams** — Create reusable, measurable assessments without developer support.

---

## ✨ Key Features

### 🔲 Visual Flow Editor
A **drag-and-drop canvas** (powered by ReactFlow) where you design the entire simulation flow by connecting screen nodes. Each node represents one application screen.

### 🎯 12 Interactive Trigger Types
The heart of SimuBuild — define exactly how users must interact with each screen:

| Category | Triggers |
|---|---|
| **Click** | Single click · Double click |
| **Text Input** | Text fields with validation · Date pickers |
| **Selection** | Dropdowns · Cascading dropdowns · Radio buttons · Checkboxes |
| **Advanced** | Scrollable areas · Floating/draggable windows · Data table grids · Keypress detection |

Each trigger is **visually positioned** as a hotspot overlay on the screenshot with precise coordinates.

### 🖌️ Built-in Image Editor
Annotate and modify screenshots directly in the app using a **Fabric.js-powered** editor. Includes a **Scroll Image Builder** to stitch multiple screenshots into scrollable content.

### 👁️ Live Preview
Run your simulation in real time to test the full user experience before exporting.

### 📦 Multi-Format Export
| Format | Description |
|--------|-------------|
| **ZIP (Web)** | Standalone HTML/CSS/JS player — runs in any browser, zero dependencies |
| **EXE (Desktop)** | Native Windows application via Electron |
| **JSON (Project)** | Save & reload projects for later editing |

### ⚙️ Additional Capabilities
- **Undo / Redo** with full state history
- **Auth Node** with login gate, objectives, and score tracking
- **Result & Ranking Nodes** for completion summaries and leaderboards
- **Mobile mode** for simulating phone-sized applications
- **Focus Mode** for detailed per-screen editing

---

## 🏗️ Architecture & Technical Highlights

This project follows a **feature-based Clean Architecture** with strict separation of concerns:

```
src/
├── features/           # Self-contained feature modules
│   ├── config/         #   Configuration panels (components + hooks)
│   ├── editor/         #   Image editor & scroll builder
│   ├── export/         #   ZIP & EXE export engines
│   ├── nodes/          #   Custom ReactFlow nodes (Screen, Auth, Result, Ranking)
│   └── view-modes/     #   Preview engine & Focus mode
├── shared/             # Reusable components, hooks, constants & utilities
└── export/             # Standalone HTML player templates
```

**Design principles applied:**
- **Composition over prop drilling** — logic is extracted to custom hooks, components stay purely visual.
- **Feature isolation** — each module owns its components, hooks, and state.
- **Export engine** — serializes the simulation graph, extracts Base64 assets into optimized files, and bundles a standalone player.

---

## 🛠️ Tech Stack

| Technology | Role |
|-----------|------|
| **React 19** | UI framework with latest features |
| **Vite 7** | Build tool with instant HMR |
| **ReactFlow** | Node-based visual editor canvas |
| **Fabric.js** | Image manipulation & annotation |
| **TailwindCSS 4** | Utility-first styling |
| **Electron** | Desktop application packaging |
| **JSZip + FileSaver** | Client-side ZIP generation |
| **Lucide Icons** | Consistent UI iconography |

---

## 🗺️ Roadmap → SaaS

SimuBuild is evolving into a full **SaaS platform**:

- [ ] ☁️ Cloud storage & online simulation management
- [ ] 👥 Multi-user real-time collaboration
- [ ] 📊 Analytics dashboard — trainee performance tracking & scoring
- [ ] 🏢 Organization management with roles & permissions
- [ ] 🌐 One-click web deployment with shareable URLs
- [ ] 🔗 LMS integration (SCORM / xAPI)
- [ ] 🤖 AI-assisted trigger detection from screenshots

---

## 📄 License

MIT License — © 2026 Nestor Gomez

---

<p align="center">
  <strong>⚠️ This is the public showcase repository.</strong><br/>
  The full source code is maintained in a private repository.<br/>
  For a live demo or access to the codebase, feel free to <a href="mailto:your-email@example.com">reach out</a>.
</p>

<p align="center">
  Made with ❤️ by <strong>Nestor Gomez</strong>
</p>
