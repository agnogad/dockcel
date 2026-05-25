import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import containersRouter from "./routes/containers.js";
import imagesRouter from "./routes/images.js";
import systemRouter from "./routes/system.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/containers", containersRouter);
app.use("/api/images", imagesRouter);
app.use("/api/system", systemRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// In production, serve the built frontend
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "../client/dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Dockcel running on http://0.0.0.0:${PORT}`);
});
