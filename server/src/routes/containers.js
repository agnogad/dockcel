import { Router } from "express";
import { getDocker } from "../docker.js";

const router = Router();

// List all containers
router.get("/", async (req, res) => {
  try {
    const docker = getDocker();
    const all = req.query.all !== "false";
    const containers = await docker.listContainers({ all });
    res.json(containers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Container action: start / stop / restart / pause / unpause / remove
router.post("/:id/:action", async (req, res) => {
  try {
    const docker = getDocker();
    const container = docker.getContainer(req.params.id);
    const action = req.params.action;

    switch (action) {
      case "start":
        await container.start();
        break;
      case "stop":
        await container.stop({ t: 5 });
        break;
      case "restart":
        await container.restart({ t: 5 });
        break;
      case "pause":
        await container.pause();
        break;
      case "unpause":
        await container.unpause();
        break;
      case "remove":
        await container.remove({ force: true });
        break;
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    res.json({ success: true, action });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inspect container
router.get("/:id/inspect", async (req, res) => {
  try {
    const docker = getDocker();
    const container = docker.getContainer(req.params.id);
    const data = await container.inspect();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Container stats (stream — single snapshot)
router.get("/:id/stats", async (req, res) => {
  try {
    const docker = getDocker();
    const container = docker.getContainer(req.params.id);
    const stream = await container.stats({ stream: false });
    res.json(stream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Container logs
router.get("/:id/logs", async (req, res) => {
  try {
    const docker = getDocker();
    const container = docker.getContainer(req.params.id);
    const tail = parseInt(req.query.tail) || 200;
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail,
      timestamps: false,
    });
    // dockerode returns a Buffer — strip the 8-byte Docker header per chunk
    const output = logs
      .toString("utf-8")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        // Remove Docker log header (8 bytes) if present
        return line.replace(/^[\x00-\x1f]{8}/, "");
      });
    res.json(output);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
