import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API to list tests
  app.get("/api/tests", (req, res) => {
    const testsDir = path.join(process.cwd(), "tests");
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir);
    }
    const files = fs.readdirSync(testsDir).filter(file => file.endsWith(".txt"));
    res.json(files);
  });

  // API to get test content
  app.get("/api/tests/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), "tests", filename);
    if (fs.existsSync(filePath) && filename.endsWith(".txt")) {
      const content = fs.readFileSync(filePath, "utf-8");
      res.send(content);
    } else {
      res.status(404).send("Test not found");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
