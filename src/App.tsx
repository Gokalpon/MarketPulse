// @ts-nocheck
import React from "react";
import { AnimatePresence } from "motion/react";
import { List, Globe, Users, Settings } from "lucide-react";
import { motion } from "motion/react";
import { APP_ASSETS } from "./data";
import { AppProvider, useApp } from "./context/AppContext";
import { SplashScreen, OnboardingScreen } from "./components/SplashOnboarding";
import { Header } from "./components/Header";
import { CommentSheet, MyCommentsSheet, DetailSheet } from "./components/Modals";
import { Dashboard }  from "./screens/Dashboard";
import { Watchlist }  from "./screens/Watchlist";
import { Markets }    from "./screens/Markets";
import { Community }  from "./screens/Community";
import { Profile }    from "./screens/Profile";

function AppShell() {
  const { showSplash, isLoggedIn, activeTab, setActiveTab, setSelectedPoint, setProfilePage, setChartCrosshair } = useApp();

  if (showSplash)   return <SplashScreen />;
  if (!isLoggedIn)  return <OnboardingScreen />;

  return (
    <div className="min-h-screen bg-[#030508] flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[430px] min-h-screen text-white font-sans selection:bg-[#00FFFF]/30 relative shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col overflow-x-hidden">

        {/* Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ backgroundImage: `url(${APP_ASSETS.mainBackground})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
        />

        <Header />

        <main className="relative z-20 pt-[110px] pb-32">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard"  && <Dashboard />}
            {activeTab === "watchlist"  && <Watchlist />}
            {activeTab === "markets"    && <Markets />}
            {activeTab === "community"  && <Community />}
            {activeTab === "profile"    && <Profile />}
          </AnimatePresence>
        </main>

        {/* Modals */}
        <CommentSheet />
        <MyCommentsSheet />
        <DetailSheet />

        {/* Bottom Tab Bar */}
        <footer className="absolute bottom-0 inset-x-0 h-[90px] bg-black/30 backdrop-blur-[40px] border-t border-white/[0.03] flex justify-around items-start pt-5 px-4 z-[100]">
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="blueGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00FFFF" />
                <stop offset="100%" stopColor="#39FF14" />
              </linearGradient>
            </defs>
          </svg>
          {[
            { id: "dashboard",  icon: <img src={APP_ASSETS.tabLogo} alt="Dashboard" className="w-6 h-6 object-contain" /> },
            { id: "watchlist",  icon: <List className="w-6 h-6" /> },
            { id: "markets",    icon: <Globe className="w-6 h-6" /> },
            { id: "community",  icon: <Users className="w-6 h-6" /> },
            { id: "profile",    icon: <Settings className="w-6 h-6" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedPoint(null); setProfilePage(null); setChartCrosshair(null); }}
              className="flex flex-col items-center gap-1.5 relative w-14 group"
            >
              <div className={`transition-all duration-300 ${activeTab === tab.id ? "text-white scale-110" : "text-[#7A7B8D] group-hover:text-white/70"}`}>
                {tab.icon}
              </div>
              {activeTab === tab.id && (
                <motion.div layoutId="activeDot" className="w-1 h-1 rounded-full bg-[#00FFFF] absolute -bottom-3 shadow-[0_0_10px_#00FFFF]" />
              )}
            </button>
          ))}
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
