import { useState, useEffect, useCallback } from "react";
import { api } from "../api/docker.js";

export default function Layout({ children, currentRoute, onNavigate }) {
  const [connected, setConnected] = useState(null);
  const [info, setInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      const data = await api.info();
      setConnected(true);
      setInfo(data);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "◉" },
    { id: "containers", label: "Containers", icon: "▣" },
    { id: "images", label: "Images", icon: "⊞" },
  ];

  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col">
      {/* Top Nav */}
      <header className="h-16 bg-canvas border-b border-hairline flex items-center px-sm lg:px-lg sticky top-0 z-50">
        <button
          className="btn-icon mr-sm lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <span className="text-body-sm">☰</span>
        </button>

        <div className="flex items-center gap-sm flex-1">
          <span className="text-display-sm text-ink tracking-tight">dockcel</span>
          <span className="text-caption text-mute hidden sm:inline">— Docker Panel</span>
        </div>

        <div className="flex items-center gap-md">
          {connected === true && info && (
            <div className="hidden md:flex items-center gap-sm text-caption text-mute">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>{info.ServerVersion}</span>
              <span className="text-hairline">·</span>
              <span>{info.Containers} containers</span>
            </div>
          )}
          {connected === false && (
            <div className="flex items-center gap-xs text-caption text-error">
              <span className="w-1.5 h-1.5 rounded-full bg-error" />
              Disconnected
            </div>
          )}
          {connected === null && (
            <div className="flex items-center gap-xs text-caption text-mute">
              <span className="w-1.5 h-1.5 rounded-full bg-hairline-strong animate-pulse" />
              Connecting…
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`
            w-56 bg-canvas border-r border-hairline flex-shrink-0
            fixed lg:sticky top-16 bottom-0 z-40
            transition-transform duration-200
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <nav className="p-md space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-sm px-sm py-2 rounded-md text-left transition-all duration-150
                  ${currentRoute === item.id
                    ? "bg-canvas-soft-2 text-ink font-medium"
                    : "text-body hover:bg-canvas-soft hover:text-ink"}
                `}
              >
                <span className="w-5 text-center text-caption">{item.icon}</span>
                <span className="text-body-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {info && (
            <div className="absolute bottom-0 left-0 right-0 p-md border-t border-hairline">
              <div className="text-caption text-mute space-y-0.5">
                <div className="flex justify-between">
                  <span>Engine</span>
                  <span className="text-ink">{info.ServerVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Containers</span>
                  <span className="text-ink">{info.Containers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Running</span>
                  <span className="text-ink">{info.ContainersRunning}</span>
                </div>
                <div className="flex justify-between">
                  <span>Images</span>
                  <span className="text-ink">{info.Images}</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-md lg:p-lg xl:p-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
