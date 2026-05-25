# Dockcel — Docker Management Panel

> A dark-themed, Vercel-inspired web panel for managing Docker containers, images, and system resources.

![screenshot](https://img.shields.io/badge/status-active-success?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## Features

- **Dashboard** — Real-time overview of containers, images, CPU, memory, and Docker host info
- **Container Management** — Start, stop, restart, pause, and remove containers with one click
- **Container Details** — Inspect configuration, view live logs, monitor CPU/memory/network/disk stats
- **Image Browser** — List and remove Docker images
- **Dark Theme** — Full dark UI inspired by Vercel's design language
- **Dockerized** — Runs as a single container with Docker socket access

## Quick Start

```bash
# Clone the repo
git clone https://github.com/agnogad/dockcel.git
cd dockcel

# Start the panel
docker compose up -d
```

Open **http://localhost:3001** in your browser.

## Manual Start (without Docker)

```bash
# Server
cd server && npm install && npm run dev

# Client (separate terminal)
cd client && npm install && npm run dev
```

The client runs on port 5173 and proxies API requests to the server on port 3001.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `DOCKER_SOCKET` | `/var/run/docker.sock` | Docker socket path |

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js, Express, dockerode
- **Design:** Vercel-inspired design system (Geist/Inter type, mesh gradients, stacked shadows)

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/system/info` | Docker system info |
| `GET` | `/api/system/df` | Docker disk usage |
| `GET` | `/api/system/ping` | Docker ping |
| `GET` | `/api/containers?all=true` | List containers |
| `POST` | `/api/containers/:id/start` | Start container |
| `POST` | `/api/containers/:id/stop` | Stop container |
| `POST` | `/api/containers/:id/restart` | Restart container |
| `POST` | `/api/containers/:id/pause` | Pause container |
| `POST` | `/api/containers/:id/unpause` | Unpause container |
| `POST` | `/api/containers/:id/remove` | Remove container |
| `GET` | `/api/containers/:id/inspect` | Inspect container |
| `GET` | `/api/containers/:id/logs` | Container logs |
| `GET` | `/api/containers/:id/stats` | Container stats |
| `GET` | `/api/images` | List images |
| `DELETE` | `/api/images/:id` | Remove image |

## License

MIT
