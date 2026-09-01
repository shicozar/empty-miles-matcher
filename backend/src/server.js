import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes/api.js";
import { db } from "./db/index.js"; // ensures schema exists on boot
import { runSeed } from "./db/seedData.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Lock down CORS in production if FRONTEND_ORIGIN is set (comma-separated list
// of allowed origins). Requests with no Origin header (curl, server-to-server)
// are always allowed. If unset, stay permissive so local dev is unaffected.
const frontendOrigin = process.env.FRONTEND_ORIGIN;
if (frontendOrigin) {
  const allowed = frontendOrigin.split(",").map((o) => o.trim()).filter(Boolean);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
    })
  );
} else {
  app.use(cors());
}

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", router);

// Render's free tier can reset the filesystem (and the SQLite file) on redeploy
// or after spin-down, so seed demo data on boot whenever the DB is empty.
function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM empty_legs").get();
  if (count === 0) {
    const { legCount, loadCount } = runSeed();
    console.log(`Empty database — auto-seeded ${legCount} empty legs and ${loadCount} load requests.`);
  }
}

seedIfEmpty();

app.listen(PORT, () => {
  console.log(`Empty Miles Matcher API running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set — pricing will use the heuristic fallback.");
  }
});
