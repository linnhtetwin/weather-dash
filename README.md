<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🌤️ Weather Environmental Dashboard

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC.svg)](https://tailwindcss.com/)

A comprehensive weather and environmental monitoring dashboard built with React and TypeScript. Monitor real-time weather conditions, air quality, seismic activity, tsunami alerts, historical trends, and user-friendly weather suggestions.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Real-time Weather Monitoring**: Current conditions, forecasts, and historical data
- **Environmental Metrics**: Air Quality Index (AQI), UV Index, precipitation, pressure
- **Natural Disaster Alerts**: Earthquake and tsunami monitoring
- **Wind & Visibility**: Detailed wind speed/direction and cloud visibility data
- **Weather Suggestions**: Rule-based recommendations based on weather, temperature, and UV conditions
- **Responsive Design**: Optimized for desktop and mobile devices
- **Interactive Charts**: Visual data representation using Recharts
- **PWA Support**: Installable app experience with manifest, icons, and service worker
- **Unit & Accessibility Settings**: Custom units, high contrast mode, larger text, and reduced motion
- **Resilient Data Sources**: Primary APIs with silent fallback and cross-check logic

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Deployment**: Cloudflare Pages (Wrangler)

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/weather-environmental-dashboard.git
   cd weather-environmental-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 📖 Usage

Once the app is running, you can:

- View current weather conditions and forecasts
- Monitor air quality and environmental metrics
- Check for earthquake and tsunami alerts
- Get rule-based suggestions based on weather data
- Explore historical weather data trends
- Customize units and accessibility preferences

## 🚀 Deployment

The app is configured for deployment to Cloudflare Pages:

```bash
npm run deploy
```

This command builds the app and deploys it to Cloudflare Pages on the production branch.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and not licensed for public use.
