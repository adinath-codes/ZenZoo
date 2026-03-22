# 🐼 Zen Zoo (THE SYSTEM SOUL)

**Give your phone a heartbeat. Meet your new digital companion.**

Zen Zoo is a context-aware widget that transforms your device into a living, breathing digital habitat. It’s not just a virtual pet; it’s a reflection of your digital life, designed to make you smile, focus, and feel better through emotional gamification and a stunning Nothing OS dot-matrix aesthetic.

   

## 🌄 Demo
<img width="320" height="652" alt="image" src="https://github.com/user-attachments/assets/0c986b1c-0b5b-4260-81ba-17f298dbfc51" />
<img width="324" height="660" alt="image" src="https://github.com/user-attachments/assets/4c412e78-dd43-4d95-9091-58aaaf022f06" />
<img width="320" height="665" alt="image" src="https://github.com/user-attachments/assets/6d1e4e6f-3e81-4ee0-aaff-0f3730c47316" />
<img width="318" height="664" alt="image" src="https://github.com/user-attachments/assets/4ba7b6f3-743e-43e1-9217-8d04ab48a92d" />
<img width="317" height="660" alt="image" src="https://github.com/user-attachments/assets/ebdb62fb-092b-4dfe-9c6d-bbe0d736e351" />
<img width="318" height="652" alt="image" src="https://github.com/user-attachments/assets/7cfaf930-450c-4d6e-8f74-708a95296974" />

[](https://www.google.com/search?q=https://www.linkedin.com/in/radinath/) [](https://www.google.com/search?q=%23)

-----

## 🚀 Key Features

  * **🔋 System-Synced Health:** Your pet's energy is directly linked to your device's metabolism. When the battery drops, your pet gets tired. Plug it in to trigger a real-time healing animation\!
  * **📅 Context-Aware Companionship:** Syncs with your schedule and environment. Raining outside? Your pet grabs an umbrella. Calendar meeting coming up? They automatically suit up in a tie.
  * **🧘 Digital Wellbeing & Zen Mode:** Doom-scrolling at 2 AM? Your pet gets disappointed to gently nudge you offline. Need a break? Activate the built-in Meditation Timer and find focus alongside your glowing, golden companion.
  * **🔄 Gamified Habit Tracker:** Reclaim your time by tracking your social media detox on our custom Nothing-style habit ring. Hit your daily goal to award your pet a victory crown.
  * **🎨 The Character Zoo:** Start with the Playful Panda and To-Do Frog. Complete a perfect 7-day habit streak to break the virtual lock and earn the elusive Habit Rabbit\!
  * **⚙️ Custom 2D Graphics Engine:** Procedurally generated dot-matrix pixel art powered by React Native SVG and math-based layout animations, ensuring a butter-smooth, unique visual experience.

-----

## 🛠️ Tech Stack

### Frontend & Graphics

  * **React Native** + **Expo**: High-performance mobile UI rendering.
  * **React Native SVG**: For the interactive node-based drawing engine and custom circular habit rings.
  * **Animated API**: For buttery smooth breathing, bouncing, and layout transitions.

### Context & Infrastructure

  * **React Native Device Info**: For real-time battery and hardware metabolism polling.
  * **Expo Location & Open-Meteo API**: For fetching dynamic, real-world weather states.
  * **React Native Calendar Events**: For parsing schedules to trigger context-aware outfits.
  * **AsyncStorage**: Local, offline-first storage for habit streaks and meditation persistence.
  * **Expo AV**: For lo-fi audio playback during Zen Mode.

-----

## 💻 Local Installation Guide

Follow these steps to run Zen Zoo locally on your simulator or physical device.

### Prerequisites

  * **OS:** macOS, Linux, or Windows.
  * **Node.js:** Version 18+.
  * **Mobile Environment:** iOS Simulator (Xcode), Android Emulator (Android Studio), or the Expo Go app on your physical device.

### 1\. Clone the Repository

```bash
git clone https://github.com/yourusername/zen-zoo.git
cd zen-zoo
```

## 📂 Project Structure

Here is an overview of the repository's architecture:

```text
zen-zoo/
├── src/                     # 🎨 Source Code
│   ├── components/          # Reusable UI (DotMatrix, Ring, Carousel)
│   ├── engine/              # ⚙️ Custom 2D Raster Graphics Engine (renderPanda, renderFrog)
│   ├── styles/              # Design tokens and Nothing OS theme configurations
│   └── App.js               # Main Widget Orchestrator
│
├── assets/                  # 🖼️ Static assets and audio files
│
├── package.json             # App dependencies (Expo, React Native SVG, etc.)
└── README.md                # Project Documentation
```

## ⚙️ Setup Guidelines

To run Zen Zoo locally and test the custom graphics engine, follow these configurations.

### 1\. Environment Setup

Zen Zoo requires a standard React Native / Expo environment.

```bash
# Navigate to the project directory
cd zen-zoo

# Install Dependencies (Expo, SVG, Permissions)
npm install
```

### 2\. Running the App

```bash
# Start the Expo Metro Bundler
npx expo start
```

  * Press **`a`** to open in the Android Emulator.
  * Press **`i`** to open in the iOS Simulator.
  * Scan the QR code with the **Expo Go** app to view directly on your physical Nothing Phone (or any other device).
