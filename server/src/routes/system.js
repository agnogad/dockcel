import { Router } from "express";
import { getDocker } from "../docker.js";

const router = Router();

// Docker system info
router.get("/info", async (req, res) => {
  try {
    const docker = getDocker();
    const info = await docker.info();
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disk usage (docker system df)
router.get("/df", async (req, res) => {
  try {
    const docker = getDocker();
    const df = await docker.df();
    res.json(df);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ping
router.get("/ping", async (_req, res) => {
  try {
    const docker = getDocker();
    await docker.ping();
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
