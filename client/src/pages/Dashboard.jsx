import { useState, useEffect, useCallback } from "react";
import { api } from "../api/docker.js";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

export default function Dashboard() {
  const [info, setInfo] = useState(null);
  const [df, setDf] = useState(null);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [infoData, dfData, containersData] = await Promise.all([
        api.info(),
        api.df(),
        api.listContainers(true),
      ]);
      setInfo(infoData);
      setDf(dfData);
      setContainers(containersData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-body-sm text-mute animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-soft flex items-center gap-sm text-error">
        <span className="text-lg">⚠</span>
        <span className="text-body-sm">{error}</span>
      </div>
    );
  }

  const running = containers.filter((c) => c.State === "running").length;
  const stopped = containers.filter((c) => c.State === "exited").length;
  const paused = containers.filter((c) => c.State === "paused").length;
  const totalCpus = info?.NCPU || 0;
  const totalMem = info?.MemTotal || 0;
  const usedMem = df?.LayersSize || 0;

  const statsCards = [
    {
      label: "Total Containers",
      value: info?.Containers ?? 0,
      sub: `${running} running · ${stopped} stopped · ${paused} paused`,
    },
    {
      label: "Images",
      value: info?.Images ?? 0,
      sub: `${df?.Images?.length || 0} layers`,
    },
    {
      label: "CPU Cores",
      value: totalCpus,
      sub: info?.Architecture || "",
    },
    {
      label: "Memory",
      value: formatBytes(totalMem),
      sub: `${formatBytes(usedMem)} used by images`,
    },
    {
      label: "Docker Version",
      value: info?.ServerVersion || "",
      sub: `API ${info?.APIVersion || ""}`,
    },
    {
      label: "OS / Arch",
      value: info?.OperatingSystem || "",
      sub: `${info?.OSType || ""} · ${info?.Architecture || ""}`,
    },
  ];

  return (
    <div className="space-y-lg">
      {/* Page header */}
      <div>
        <h1 className="text-display-lg text-ink">Dashboard</h1>
        <p className="text-body-md text-body mt-xs">
          Docker host overview
          {info?.Name && <span className="text-mute"> — {info.Name}</span>}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        {statsCards.map((card) => (
          <div key={card.label} className="card space-y-sm">
            <div className="text-caption text-mute uppercase tracking-wide">{card.label}</div>
            <div className="text-display-md text-ink">{card.value}</div>
            {card.sub && <div className="text-caption text-mute">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* Container Status */}
      <div className="card p-lg">
        <h2 className="text-display-sm text-ink mb-md">Container Status</h2>
        <div className="flex gap-lg">
          <div className="flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-body-sm text-body">{running} running</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-error" />
            <span className="text-body-sm text-body">{stopped} stopped</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-body-sm text-body">{paused} paused</span>
          </div>
        </div>
        {/* Mini bar */}
        {containers.length > 0 && (
          <div className="mt-md h-2 bg-canvas-soft rounded-full overflow-hidden flex">
            {running > 0 && (
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(running / containers.length) * 100}%` }}
              />
            )}
            {paused > 0 && (
              <div
                className="bg-warning transition-all"
                style={{ width: `${(paused / containers.length) * 100}%` }}
              />
            )}
            {stopped > 0 && (
              <div
                className="bg-hairline-strong transition-all"
                style={{ width: `${(stopped / containers.length) * 100}%` }}
              />
            )}
          </div>
        )}
      </div>

      {/* Recent Containers */}
      <div className="card p-lg">
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-display-sm text-ink">Recent Containers</h2>
        </div>
        <div className="space-y-xs">
          {containers.slice(0, 5).map((c) => (
            <div
              key={c.Id}
              className="flex items-center justify-between py-xs px-sm rounded-sm hover:bg-canvas-soft transition-colors"
            >
              <div className="flex items-center gap-sm min-w-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    c.State === "running"
                      ? "bg-green-400"
                      : c.State === "paused"
                      ? "bg-warning"
                      : "bg-hairline-strong"
                  }`}
                />
                <span className="text-body-sm text-ink truncate">
                  {c.Names[0]?.replace("/", "") || "unnamed"}
                </span>
              </div>
              <div className="flex items-center gap-sm flex-shrink-0 ml-sm">
                <span className="text-caption text-mute hidden sm:inline">
                  {c.Image}
                </span>
                <span className="text-caption text-mute">
                  {c.Status}
                </span>
              </div>
            </div>
          ))}
          {containers.length === 0 && (
            <div className="text-body-sm text-mute py-md text-center">
              No containers found
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      {info && (
        <div className="card p-lg">
          <h2 className="text-display-sm text-ink mb-md">System Info</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-md text-body-sm">
            {[
              ["Storage Driver", info.Driver],
              ["Logging Driver", info.LoggingDriver],
              ["Cgroup Driver", info.CgroupDriver],
              ["Default Runtime", info.DefaultRuntime],
              ["Kernel", info.KernelVersion],
              ["OS Type", info.OSType],
              ["CPUs", info.NCPU],
              ["Total Memory", formatBytes(info.MemTotal)],
              ["Docker Root", info.DockerRootDir],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-caption text-mute">{label}</div>
                <div className="text-body-sm text-ink mt-0.5 truncate" title={value}>
                  {value || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
