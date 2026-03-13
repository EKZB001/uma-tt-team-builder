# 🐎 Uma Musume Team Builder

A modern, high-performance web application designed for **Uma Musume: Pretty Derby** players to plan and optimize their Team Stadium lineups. Built with a "Zero-Backend" architecture, the app is fast, secure, and fully automated.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

## 🚀 Live Demo
**[VIEW LIVE PROJECT HERE](https://ekzb001.github.io/uma-tt-team-builder/)**

## ✨ Key Features

- **Drag & Drop Interface:** Effortlessly organize your Umas into specific tracks (Sprint, Mile, Medium, Long, Dirt) with real-time validation (max 3 per track).
- **Smart Character Constraints:** Prevents assigning different versions of the same character to the same team, reflecting in-game rules.
- **Advanced Multi-Sorting:** Uses a custom **Weighted Scoring System** to evaluate characters across multiple aptitudes simultaneously.
- **Automated Data Pipeline:** A custom Node.js bot runs daily via GitHub Actions to keep the character database synchronized with the latest updates from Game8.
- **Persistence:** Your team configurations and "Owned" status are automatically saved to your browser's LocalStorage.
- **Fully Responsive:** Optimized for desktop, tablet, and mobile views.

## 🛠️ Tech Stack

- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS v4
- **State & Drag-and-Drop:** `@hello-pangea/dnd`
- **Automation:** GitHub Actions + Node.js (Data Scraper)
- **Deployment:** GitHub Pages

## 🤖 Automated Data Updates

This project features a custom automation workflow:
1. Every 24 hours, a **GitHub Action** triggers a specialized script (`database_update.js`).
2. The script fetches the latest character data from **Game8**.
3. It performs an integrity check: data is updated only if new characters are detected.
4. If an update occurs, the bot commits the changes directly to the repository, triggering a fresh deployment.

## 📜 Credits & Disclaimer

- **Data Source:** Character stats and images are sourced from [Game8](https://game8.co/games/Uma-Musume-Pretty-Derby).
- **Copyright:** All character names, images, and related assets are the property of Cygames, Inc. This is a non-commercial, fan-made tool.