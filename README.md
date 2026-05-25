<p align="center">
  <img src="https://img.shields.io/badge/dockcel-v1.0.0-50e3c2?style=flat-square&labelColor=111" alt="dockcel">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-18.3-61dafb?style=flat-square&logo=react&labelColor=111" alt="React">
  <img src="https://img.shields.io/badge/vite-6.0-646cff?style=flat-square&logo=vite&labelColor=111" alt="Vite">
  <img src="https://img.shields.io/badge/express-4.21-000?style=flat-square&logo=express&labelColor=111" alt="Express">
  <img src="https://img.shields.io/badge/docker-2496ed?style=flat-square&logo=docker&labelColor=111" alt="Docker">
  <img src="https://img.shields.io/badge/tailwind-3.4-06b6d4?style=flat-square&logo=tailwindcss&labelColor=111" alt="Tailwind CSS">
</p>

<div align="center">
<pre style="background: #0a0a0a; color: #50e3c2; padding: 1rem 1.5rem; border-radius: 8px; border: 1px solid #1a1a1a; display: inline-block; text-align: left; font-family: 'JetBrains Mono', monospace;">
┌───────────────────────────────────┐
│ ○ ○ ○                            │
│                                   │
│  $ docker compose up -d           │
│  [+] Running 1/1                  │
│  ✔ Container dockcel  Started     │
│  → http://localhost:3001          │
│                                   │
└───────────────────────────────────┘
</pre>
</div>

<p align="center">
  A dark-themed, Vercel-inspired web panel for managing Docker containers,<br>
  images, and system resources — served from a single container.
</p>

<br>

---

<br>

## ✦ At a Glance

<table>
<tr>
<td width="50%">

**Dashboard** — Real-time overview of your Docker host. Containers, images, CPU, memory, and system info at a glance.

</td>
<td width="50%">

**Containers** — Full lifecycle management. Start, stop, restart, pause, or remove containers. Filter by status, search by name.

</td>
</tr>
<tr>
<td width="50%">

**Container Details** — Inspect configs, follow live logs, monitor CPU/memory/network/disk stats in real time.

</td>
<td width="50%">

**Images** — Browse all images on the host, inspect details, remove dangling or unused images.

</td>
</tr>
</table>

<br>

## ✦ Quick Start

```bash
git clone https://github.com/agnogad/dockcel.git
cd dockcel
docker compose up -d
```

Open **[http://localhost:3001](http://localhost:3001)**.

<br>

## ✦ Run Without Docker

```bash
# Terminal 1 — Server
cd server && npm install && npm run dev

# Terminal 2 — Client (dev mode with HMR)
cd client && npm install && npm run dev
```

The client runs on port 5173 and proxies API calls to the server on port 3001.

<br>

## ✦ Environment

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `DOCKER_SOCKET` | `/var/run/docker.sock` | Docker daemon socket path |

<br>

## ✦ Tech Stack

```
Frontend   React 18 · Vite 6 · Tailwind CSS 3.4
Backend    Node.js 22 · Express 4.21 · dockerode 4.0
Design     Vercel-inspired (Geist/Inter type, mesh gradients, stacked shadows)
Deploy     Single Docker container · restart: unless-stopped
```

<br>

## ✦ API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/system/info` | Docker system information |
| `GET` | `/api/system/df` | Docker disk usage |
| `GET` | `/api/system/ping` | Docker ping |
| `GET` | `/api/containers` | List containers (`?all=true`) |
| `POST` | `/api/containers/:id/:action` | `start` · `stop` · `restart` · `pause` · `unpause` · `remove` |
| `GET` | `/api/containers/:id/inspect` | Inspect container |
| `GET` | `/api/containers/:id/logs` | Container logs (`?tail=200`) |
| `GET` | `/api/containers/:id/stats` | Container stats snapshot |
| `GET` | `/api/images` | List images |
| `DELETE` | `/api/images/:id` | Remove image |

<br>

## ✦ License

MIT — use it, fork it, ship it.
