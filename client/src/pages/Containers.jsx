import { useState, useEffect, useCallback } from "react";
import { api } from "../api/docker.js";

function formatTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function Containers({ onSelectContainer }) {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchContainers = useCallback(async () => {
    try {
      const data = await api.listContainers(true);
      setContainers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, [fetchContainers]);

  const handleAction = async (id, action) => {
    setActionLoading(`${id}-${action}`);
    try {
      await api.containerAction(id, action);
      await fetchContainers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = containers
    .filter((c) => {
      if (filter === "running") return c.State === "running";
      if (filter === "stopped") return c.State === "exited";
      if (filter === "paused") return c.State === "paused";
      return true;
    })
    .filter((c) => {
      if (!search) return true;
      const name = (c.Names[0] || "").toLowerCase();
      const image = c.Image.toLowerCase();
      const id = c.Id.toLowerCase();
      const q = search.toLowerCase();
      return name.includes(q) || image.includes(q) || id.startsWith(q);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-body-sm text-mute animate-pulse">Loading containers…</div>
      </div>
    );
  }

  const tabs = [
    { id: "all", label: "All", count: containers.length },
    { id: "running", label: "Running", count: containers.filter((c) => c.State === "running").length },
    { id: "stopped", label: "Stopped", count: containers.filter((c) => c.State === "exited").length },
    { id: "paused", label: "Paused", count: containers.filter((c) => c.State === "paused").length },
  ];

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between flex-wrap gap-sm">
        <div>
          <h1 className="text-display-lg text-ink">Containers</h1>
          <p className="text-body-md text-body mt-xs">
            Manage your Docker containers
          </p>
        </div>
        <button onClick={fetchContainers} className="btn-ghost text-caption gap-xs">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-sm text-error text-body-sm bg-error-soft rounded-sm px-sm py-xs">
          <span>⚠</span>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-sm">
        <div className="flex bg-canvas rounded-pill-sm p-0.5 shadow-level-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-active={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className="tab-pill text-caption whitespace-nowrap"
            >
              {tab.label}
              <span className="ml-1 text-mute">({tab.count})</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name, image, or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-sm flex-1 min-w-[200px]"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left text-caption-mono text-mute uppercase px-md py-sm">Name</th>
                <th className="text-left text-caption-mono text-mute uppercase px-md py-sm hidden sm:table-cell">Image</th>
                <th className="text-left text-caption-mono text-mute uppercase px-md py-sm hidden md:table-cell">Status</th>
                <th className="text-left text-caption-mono text-mute uppercase px-md py-sm hidden lg:table-cell">Created</th>
                <th className="text-right text-caption-mono text-mute uppercase px-md py-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isLoading = actionLoading === `${c.Id}-start` ||
                  actionLoading === `${c.Id}-stop` ||
                  actionLoading === `${c.Id}-restart` ||
                  actionLoading === `${c.Id}-remove`;
                return (
                  <tr
                    key={c.Id}
                    className="border-b border-hairline last:border-0 hover:bg-canvas-soft transition-colors cursor-pointer"
                    onClick={() => onSelectContainer(c.Id)}
                  >
                    <td className="px-md py-sm">
                      <div className="flex items-center gap-sm">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            c.State === "running"
                              ? "bg-green-500"
                              : c.State === "paused"
                              ? "bg-warning"
                              : "bg-hairline-strong"
                          }`}
                        />
                        <span className="text-body-sm text-ink font-medium">
                          {c.Names[0]?.replace("/", "") || "unnamed"}
                        </span>
                      </div>
                    </td>
                    <td className="px-md py-sm text-body-sm text-body hidden sm:table-cell truncate max-w-[200px]">
                      {c.Image}
                    </td>
                    <td className="px-md py-sm hidden md:table-cell">
                      <span className={`text-body-sm ${
                        c.State === "running" ? "text-green-400" :
                        c.State === "paused" ? "text-warning" :
                        "text-mute"
                      }`}>
                        {c.Status}
                      </span>
                    </td>
                    <td className="px-md py-sm text-caption text-mute hidden lg:table-cell">
                      {formatTime(c.Created)}
                    </td>
                    <td className="px-md py-sm text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {c.State === "running" ? (
                          <button
                            onClick={() => handleAction(c.Id, "stop")}
                            disabled={isLoading}
                            className="btn-icon w-7 h-7 text-caption"
                            title="Stop"
                          >
                            {isLoading ? "⋯" : "■"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(c.Id, "start")}
                            disabled={isLoading}
                            className="btn-icon w-7 h-7 text-caption"
                            title="Start"
                          >
                            {isLoading ? "⋯" : "▶"}
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(c.Id, "restart")}
                          disabled={isLoading}
                          className="btn-icon w-7 h-7 text-caption"
                          title="Restart"
                        >
                          ⟳
                        </button>
                        <button
                          onClick={() => handleAction(c.Id, "remove")}
                          disabled={isLoading}
                          className="btn-icon w-7 h-7 text-caption hover:text-error"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-body-sm text-mute py-xl">
                    {search ? "No containers match your search" : "No containers found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
