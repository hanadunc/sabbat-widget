# ✦ Wheel of the Year — Desktop Companion ✦
*Turning of the Seasons*

A lightweight, frameless occult desktop companion widget built with Electron that tracks the progression of the civil calendar through the 8 sacred Sabbats of the Wheel of the Year. 

Designed as part of a triadic occult companion suite alongside **Lunar Cycle** and **Daily Arcana**.

<p align="center">
  <img width="310" height="365" alt="Wheel of the Year Widget Window" src="https://github.com/user-attachments/assets/04c42eb2-1c8d-4ca1-9e78-9dac5e3d417e" />
</p>

---

## ✦ Key Features

- **Dynamic Astrarium Clock Hand:** Custom antique brass filigree spade hand that continuously rotates across the year, pointing dead-center to each Sabbat sector at its exact calendar date.
- **8 Sacred Sectors:** Curved circular text paths centered at (140, 140) tracking *Samhain, Yule, Imbolc, Ostara, Beltane, Litha, Lammas,* and *Mabon*.
- **Live Ephemeris Telemetry:** Minimal celestial divider tracking the upcoming Sabbat alongside an active day countdown.
- **Occult Talisman Aesthetic:** 
  - Frameless, transparent floating window (`310px` × `365px`) with draggable title region.
  - Cohesive design tokens (`#f2e6d8` parchment cream, `#E3C896` talisman gold).
  - Subtle radial back-glow and outer broken celestial compass star frame.

---

## ✦ Companion Suite Showcase

<p align="center">
  <img width="100%" alt="Companion Desktop Suite in situ" src="https://github.com/user-attachments/assets/ba5f94ab-d561-4c0e-a6ec-d11b4b7017df" />
  <br>
  <em>The complete desktop suite: Daily Arcana, Lunar Cycle, and Wheel of the Year.</em>
</p>

---

## ✦ Tech Stack

- **Runtime:** Electron
- **Target:** Windows Portable executable (`electron-builder`)
- **Frontend:** Vanilla HTML5, CSS custom properties/animations, SVG geometry & text paths
- **Typography:** *Cinzel* (titling & sectors), *Lexend* (metrics & telemetry)

---

## ✦ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/hanadunc/sabbat-widget.git](https://github.com/hanadunc/sabbat-widget.git)
   cd sabbat-widget
