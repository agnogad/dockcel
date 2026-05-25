import { Router } from "express";
import { getDocker } from "../docker.js";

const router = Router();

// List images
router.get("/", async (req, res) => {
  try {
    const docker = getDocker();
    const images = await docker.listImages({ all: true });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove image
router.delete("/:id", async (req, res) => {
  try {
    const docker = getDocker();
    const image = docker.getImage(req.params.id);
    await image.remove({ force: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inspect image
router.get("/:id/inspect", async (req, res) => {
  try {
    const docker = getDocker();
    const image = docker.getImage(req.params.id);
    const data = await image.inspect();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
