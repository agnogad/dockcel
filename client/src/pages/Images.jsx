import { useState, useEffect, useCallback } from "react";
import { api } from "../api/docker.js";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleDateString();
}

export default function Images() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");

  const fetchImages = useCallback(async () => {
    try {
      const data = await api.listImages();
      setImages(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleRemove = async (id) => {
    setActionLoading(id);
    try {
      await api.removeImage(id);
      await fetchImages();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = images.filter((img) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const tags = (img.RepoTags || []).join(" ").toLowerCase();
    const id = img.Id.toLowerCase();
    return tags.includes(q) || id.startsWith(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-body-sm text-mute animate-pulse">Loading images…</div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between flex-wrap gap-sm">
        <div>
          <h1 className="text-display-lg text-ink">Images</h1>
          <p className="text-body-md text-body mt-xs">
            Docker images on this host
          </p>
        </div>
        <button onClick={fetchImages} className="btn-ghost text-caption gap-xs">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-sm text-error text-body-sm bg-error-soft rounded-sm px-sm py-xs">
          <span>⚠</span>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Search by repository, tag, or ID…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-sm max-w-sm"
      />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left text-caption-mono text-mute uppercase px-md py-sm">Repository</th>
                <th className="text-left text-caption-mono text-mute uppercase px-md py-sm">Tag</th>
                <th className="text-left text-caption-mono text-mute uppercase px-md py-sm hidden sm:table-cell">ID</th>
                <th className="text-right text-caption-mono text-mute uppercase px-md py-sm hidden md:table-cell">Size</th>
                <th className="text-right text-caption-mono text-mute uppercase px-md py-sm hidden lg:table-cell">Created</th>
                <th className="text-right text-caption-mono text-mute uppercase px-md py-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((img) => {
                const repo = img.RepoTags?.[0] || "none";
                const [name, tag] = repo.includes(":") ? repo.split(":") : [repo, "latest"];
                const isDangling = !img.RepoTags || img.RepoTags[0] === "<none>:<none>";

                return (
                  <tr
                    key={img.Id}
                    className="border-b border-hairline last:border-0 hover:bg-canvas-soft transition-colors"
                  >
                    <td className="px-md py-sm">
                      <span className={`text-body-sm text-ink font-medium ${isDangling ? "text-mute italic" : ""}`}>
                        {isDangling ? "&lt;dangling&gt;" : name}
                      </span>
                    </td>
                    <td className="px-md py-sm">
                      <span className="badge">{isDangling ? "—" : tag}</span>
                    </td>
                    <td className="px-md py-sm hidden sm:table-cell">
                      <span className="text-caption font-mono text-mute">{img.Id?.slice(7, 19)}</span>
                    </td>
                    <td className="px-md py-sm text-right hidden md:table-cell">
                      <span className="text-body-sm text-body">{formatBytes(img.Size)}</span>
                    </td>
                    <td className="px-md py-sm text-right hidden lg:table-cell">
                      <span className="text-caption text-mute">{formatTime(img.Created)}</span>
                    </td>
                    <td className="px-md py-sm text-right">
                      <button
                        onClick={() => handleRemove(img.Id)}
                        disabled={actionLoading === img.Id}
                        className="btn-icon w-7 h-7 text-caption hover:text-error"
                        title="Remove image"
                      >
                        {actionLoading === img.Id ? "⋯" : "✕"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-body-sm text-mute py-xl">
                    {search ? "No images match your search" : "No images found"}
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
