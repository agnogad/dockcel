import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/docker.js";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function ContainerDetail({ id, onBack }) {
  const [inspect, setInspect] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("info");
  const [actionLoading, setActionLoading] = useState(null);
  const logsEndRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [inspectData, logsData] = await Promise.all([
        api.inspectContainer(id),
        api.containerLogs(id, 200),
      ]);
      setInspect(inspectData);
      setLogs(logsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.containerStats(id);
      setStats(data);
    } catch {
      // stats may not be available for stopped containers
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    fetchStats();
    const interval = setInterval(fetchData, 5000);
    const statsInterval = setInterval(fetchStats, 3000);
    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, [fetchData, fetchStats]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      await api.containerAction(id, action);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-body-sm text-mute animate-pulse">Loading container details…</div>
      </div>
    );
  }

  if (error && !inspect) {
    return (
      <div className="space-y-md">
        <button onClick={onBack} className="text-body-sm text-link hover:underline">← Back to containers</button>
        <div className="card-soft flex items-center gap-sm text-error">
          <span>⚠</span>
          <span className="text-body-sm">{error}</span>
        </div>
      </div>
    );
  }

  const state = inspect?.State;
  const config = inspect?.Config;
  const hostConfig = inspect?.HostConfig;
  const mounts = inspect?.Mounts || [];
  const ports = inspect?.NetworkSettings?.Ports || {};
  const networks = inspect?.NetworkSettings?.Networks || {};

  const tabs = [
    { id: "info", label: "Info" },
    { id: "logs", label: "Logs" },
    { id: "stats", label: "Stats" },
  ];

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-sm">
        <div className="flex items-center gap-sm">
          <button onClick={onBack} className="btn-icon" title="Back">
            ←
          </button>
          <div>
            <h1 className="text-display-sm text-ink truncate max-w-[400px]">
              {inspect?.Name?.replace("/", "") || "Container"}
            </h1>
            <p className="text-caption text-mute font-mono">{id.slice(0, 20)}…</p>
          </div>
          <span
            className={`ml-sm px-xs py-0.5 rounded-full text-caption ${
              state?.Running
                ? "bg-green-900/40 text-green-400"
                : state?.Paused
                ? "bg-warning-soft text-warning"
                : "bg-canvas-soft text-mute"
            }`}
          >
            {state?.Running ? "Running" : state?.Paused ? "Paused" : "Stopped"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {state?.Running ? (
            <>
              <button
                onClick={() => handleAction("stop")}
                disabled={actionLoading === "stop"}
                className="btn-secondary-sm"
              >
                {actionLoading === "stop" ? "⋯" : "Stop"}
              </button>
              <button
                onClick={() => handleAction("pause")}
                disabled={actionLoading === "pause"}
                className="btn-secondary-sm"
              >
                {actionLoading === "pause" ? "⋯" : "Pause"}
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction("start")}
              disabled={actionLoading === "start"}
              className="btn-primary-sm"
            >
              {actionLoading === "start" ? "⋯" : "Start"}
            </button>
          )}
          <button
            onClick={() => handleAction("restart")}
            disabled={actionLoading === "restart"}
            className="btn-secondary-sm"
          >
            {actionLoading === "restart" ? "⋯" : "Restart"}
          </button>
          <button
            onClick={() => handleAction("remove")}
            disabled={actionLoading === "remove"}
            className="btn-secondary-sm hover:text-error"
          >
            {actionLoading === "remove" ? "⋯" : "Remove"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-sm text-error text-body-sm bg-error-soft rounded-sm px-sm py-xs">
          <span>⚠</span>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-hairline">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-md py-sm text-body-sm border-b-2 transition-colors ${
              tab === t.id
                ? "border-ink text-ink font-medium"
                : "border-transparent text-mute hover:text-body"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "info" && inspect && (
        <div className="space-y-md">
          {/* Quick Info */}
          <div className="card p-lg">
            <h3 className="text-body-sm-strong text-ink mb-md">Configuration</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-md text-body-sm">
              <div>
                <div className="text-caption text-mute">Image</div>
                <div className="text-body-sm text-ink mt-0.5">{config?.Image || "—"}</div>
              </div>
              <div>
                <div className="text-caption text-mute">Command</div>
                <div className="text-body-sm text-ink mt-0.5 font-mono">
                  {config?.Cmd?.join(" ") || "—"}
                </div>
              </div>
              <div>
                <div className="text-caption text-mute">Entrypoint</div>
                <div className="text-body-sm text-ink mt-0.5 font-mono">
                  {config?.Entrypoint?.join(" ") || "—"}
                </div>
              </div>
              <div>
                <div className="text-caption text-mute">Working Dir</div>
                <div className="text-body-sm text-ink mt-0.5">{config?.WorkingDir || "—"}</div>
              </div>
              <div>
                <div className="text-caption text-mute">User</div>
                <div className="text-body-sm text-ink mt-0.5">{config?.User || "—"}</div>
              </div>
              <div>
                <div className="text-caption text-mute">Restart Policy</div>
                <div className="text-body-sm text-ink mt-0.5">
                  {hostConfig?.RestartPolicy?.Name || "none"}
                </div>
              </div>
            </div>
          </div>

          {/* State */}
          {state && (
            <div className="card p-lg">
              <h3 className="text-body-sm-strong text-ink mb-md">State</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-md text-body-sm">
                <div>
                  <div className="text-caption text-mute">Running</div>
                  <div className="mt-0.5">
                    <span className={`inline-flex items-center gap-1 text-body-sm ${state.Running ? "text-green-400" : "text-mute"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${state.Running ? "bg-green-400" : "bg-hairline-strong"}`} />
                      {state.Running ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-caption text-mute">Started</div>
                  <div className="text-body-sm text-ink mt-0.5">
                    {state.StartedAt ? new Date(state.StartedAt).toLocaleString() : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-caption text-mute">Finished</div>
                  <div className="text-body-sm text-ink mt-0.5">
                    {state.FinishedAt && state.FinishedAt !== "0001-01-01T00:00:00Z"
                      ? new Date(state.FinishedAt).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-caption text-mute">Exit Code</div>
                  <div className="text-body-sm text-ink mt-0.5">{state.ExitCode ?? "—"}</div>
                </div>
                <div>
                  <div className="text-caption text-mute">Paused</div>
                  <div className="text-body-sm text-ink mt-0.5">{state.Paused ? "Yes" : "No"}</div>
                </div>
                <div>
                  <div className="text-caption text-mute">Restart Count</div>
                  <div className="text-body-sm text-ink mt-0.5">{state.RestartCount || 0}</div>
                </div>
                <div>
                  <div className="text-caption text-mute">OOM Killed</div>
                  <div className="text-body-sm text-ink mt-0.5">{state.OOMKilled ? "Yes" : "No"}</div>
                </div>
                <div>
                  <div className="text-caption text-mute">PID</div>
                  <div className="text-body-sm text-ink mt-0.5">{state.Pid || "—"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Ports */}
          {Object.keys(ports).length > 0 && (
            <div className="card p-lg">
              <h3 className="text-body-sm-strong text-ink mb-md">Ports</h3>
              <div className="space-y-xs">
                {Object.entries(ports).map(([containerPort, mappings]) => (
                  <div key={containerPort} className="flex items-center gap-sm text-body-sm">
                    <span className="text-ink font-mono">{containerPort}</span>
                    <span className="text-mute">→</span>
                    {mappings ? (
                      <span className="text-body font-mono">
                        {mappings.map((m) => `${m.HostIp || "0.0.0.0"}:${m.HostPort}`).join(", ")}
                      </span>
                    ) : (
                      <span className="text-mute">not published</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mounts */}
          {mounts.length > 0 && (
            <div className="card p-lg">
              <h3 className="text-body-sm-strong text-ink mb-md">Mounts</h3>
              <div className="space-y-sm">
                {mounts.map((m, i) => (
                  <div key={i} className="text-body-sm">
                    <div className="flex items-center gap-sm">
                      <span className="text-caption-mono text-mute uppercase">{m.Type}</span>
                      <span className="text-ink">{m.Source || m.Name}</span>
                      <span className="text-mute">→</span>
                      <span className="text-body">{m.Destination}</span>
                    </div>
                    {m.Mode && <div className="text-caption text-mute mt-0.5">Mode: {m.Mode}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Networks */}
          {Object.keys(networks).length > 0 && (
            <div className="card p-lg">
              <h3 className="text-body-sm-strong text-ink mb-md">Networks</h3>
              <div className="space-y-sm">
                {Object.entries(networks).map(([name, net]) => (
                  <div key={name} className="flex items-center gap-sm text-body-sm">
                    <span className="text-ink font-medium">{name}</span>
                    <span className="text-mute">IP:</span>
                    <span className="font-mono text-body">{net.IPAddress || "—"}</span>
                    <span className="text-mute">Gateway:</span>
                    <span className="font-mono text-mute">{net.Gateway || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Env */}
          {config?.Env?.length > 0 && (
            <div className="card p-lg">
              <div className="flex items-center justify-between mb-md">
                <h3 className="text-body-sm-strong text-ink">Environment</h3>
                <span className="text-caption text-mute">{config.Env.length} variables</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {config.Env.map((env, i) => (
                  <div key={i} className="text-caption font-mono text-body truncate hover:text-ink">
                    {env}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {tab === "logs" && (
        <div className="card p-0 overflow-hidden">
          <div className="bg-canvas-soft-2 px-md py-xs border-b border-hairline flex items-center justify-between">
            <span className="text-caption-mono text-mute uppercase">Container Logs</span>
            <button
              onClick={() => fetchData()}
              className="text-caption text-link hover:underline"
            >
              Refresh
            </button>
          </div>
          <div className="p-md max-h-[600px] overflow-y-auto font-mono text-code text-body leading-relaxed">
            {logs.length > 0 ? (
              logs.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-all hover:text-ink">
                  {line}
                </div>
              ))
            ) : (
              <div className="text-mute">No logs available</div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {tab === "stats" && (
        <div className="space-y-md">
          {stats ? (
            <>
              <div className="card p-lg">
                <h3 className="text-body-sm-strong text-ink mb-md">CPU & Memory</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
                  <div>
                    <div className="text-caption text-mute">CPU %</div>
                    <div className="text-display-sm text-ink mt-0.5">
                      {stats.cpu_stats?.cpu_usage?.total_usage
                        ? (
                            ((stats.cpu_stats.cpu_usage.total_usage - (stats.precpu_stats?.cpu_usage?.total_usage || 0)) /
                              ((stats.cpu_stats.system_cpu_usage || 0) - (stats.precpu_stats?.system_cpu_usage || 0))) *
                            100
                          ).toFixed(1)
                        : "0.0"}%
                    </div>
                  </div>
                  <div>
                    <div className="text-caption text-mute">Memory Usage</div>
                    <div className="text-display-sm text-ink mt-0.5">
                      {formatBytes(stats.memory_stats?.usage || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-caption text-mute">Memory Limit</div>
                    <div className="text-display-sm text-ink mt-0.5">
                      {formatBytes(stats.memory_stats?.limit || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-caption text-mute">Memory %</div>
                    <div className="text-display-sm text-ink mt-0.5">
                      {stats.memory_stats?.limit
                        ? ((stats.memory_stats.usage / stats.memory_stats.limit) * 100).toFixed(1)
                        : "0.0"}%
                    </div>
                  </div>
                </div>
                {/* Memory bar */}
                {stats.memory_stats?.limit && (
                  <div className="mt-md h-2 bg-canvas-soft rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((stats.memory_stats.usage / stats.memory_stats.limit) * 100),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="card p-lg">
                <h3 className="text-body-sm-strong text-ink mb-md">Network I/O</h3>
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <div className="text-caption text-mute">Network Received</div>
                    <div className="text-body-md text-ink mt-0.5">
                      {formatBytes(
                        Object.values(stats.networks || {}).reduce(
                          (acc, n) => acc + (n.rx_bytes || 0),
                          0
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-caption text-mute">Network Transmitted</div>
                    <div className="text-body-md text-ink mt-0.5">
                      {formatBytes(
                        Object.values(stats.networks || {}).reduce(
                          (acc, n) => acc + (n.tx_bytes || 0),
                          0
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-lg">
                <h3 className="text-body-sm-strong text-ink mb-md">Block I/O</h3>
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <div className="text-caption text-mute">Block Read</div>
                    <div className="text-body-md text-ink mt-0.5">
                      {formatBytes(
                        (stats.blkio_stats?.io_service_bytes_recursive || [])
                          .filter((b) => b.op === "read")
                          .reduce((acc, b) => acc + b.value, 0)
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-caption text-mute">Block Write</div>
                    <div className="text-body-md text-ink mt-0.5">
                      {formatBytes(
                        (stats.blkio_stats?.io_service_bytes_recursive || [])
                          .filter((b) => b.op === "write")
                          .reduce((acc, b) => acc + b.value, 0)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card-soft text-body-sm text-mute text-center py-xl">
              Stats are only available for running containers. Start the container to see stats.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
