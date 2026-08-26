import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes/api.js";
import "./db/index.js"; // ensures schema exists on boot

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Empty Miles Matcher API running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set — pricing will use the heuristic fallback.");
  }
});
