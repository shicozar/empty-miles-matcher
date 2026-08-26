import { Router } from "express";
import { db } from "../db/index.js";
import { findAllMatches, scorePair } from "../services/matcher.js";
import { suggestPrice } from "../services/pricing.js";

export const router = Router();

// ---- Empty legs ----
router.get("/empty-legs", (req, res) => {
  const legs = db.prepare("SELECT * FROM empty_legs ORDER BY created_at DESC").all();
  res.json(legs);
});

router.post("/empty-legs", (req, res) => {
  const { carrier_name, origin, destination, earliest_date, latest_date, capacity_lbs, truck_type } = req.body;
  if (!carrier_name || !origin || !destination || !earliest_date || !latest_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const stmt = db.prepare(`
    INSERT INTO empty_legs (carrier_name, origin, destination, earliest_date, latest_date, capacity_lbs, truck_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(carrier_name, origin, destination, earliest_date, latest_date, capacity_lbs || null, truck_type || null);
  const leg = db.prepare("SELECT * FROM empty_legs WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(leg);
});

// ---- Load requests ----
router.get("/loads", (req, res) => {
  const loads = db.prepare("SELECT * FROM load_requests ORDER BY created_at DESC").all();
  res.json(loads);
});

router.post("/loads", async (req, res) => {
  const { shipper_name, origin, destination, cargo_type, weight_lbs, needed_by, urgency, notes } = req.body;
  if (!shipper_name || !origin || !destination || !cargo_type || !needed_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const stmt = db.prepare(`
    INSERT INTO load_requests (shipper_name, origin, destination, cargo_type, weight_lbs, needed_by, urgency, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    shipper_name, origin, destination, cargo_type,
    weight_lbs || null, needed_by, urgency || "standard", notes || null
  );
  const load = db.prepare("SELECT * FROM load_requests WHERE id = ?").get(info.lastInsertRowid);

  // Immediately report how many existing empty legs this new load could match
  const legs = db.prepare("SELECT * FROM empty_legs").all();
  const potentialMatches = legs.filter((leg) => scorePair(leg, load) !== null).length;

  res.status(201).json({ load, potentialMatches });
});

// ---- Matches ----
// Computes matches fresh each time (fine at this data scale) and
// caches AI pricing per pair so repeat calls don't re-hit the API.
router.get("/matches", async (req, res) => {
  const legs = db.prepare("SELECT * FROM empty_legs").all();
  const loads = db.prepare("SELECT * FROM load_requests").all();
  const rawMatches = findAllMatches(legs, loads);

  const results = [];
  for (const m of rawMatches) {
    let cached = db.prepare(
      "SELECT * FROM matches WHERE empty_leg_id = ? AND load_request_id = ?"
    ).get(m.leg.id, m.load.id);

    if (!cached) {
      const priced = await suggestPrice({
        leg: m.leg,
        load: m.load,
        legDistanceMiles: m.legDistanceMiles,
        score: m.score,
        dateSlackDays: m.dateSlackDays,
      });
      db.prepare(`
        INSERT INTO matches (empty_leg_id, load_request_id, match_score, suggested_price, price_rationale)
        VALUES (?, ?, ?, ?, ?)
      `).run(m.leg.id, m.load.id, m.score, priced.suggested_price, priced.rationale);
      cached = db.prepare(
        "SELECT * FROM matches WHERE empty_leg_id = ? AND load_request_id = ?"
      ).get(m.leg.id, m.load.id);
    }

    results.push({
      leg: m.leg,
      load: m.load,
      score: m.score,
      legDistanceMiles: m.legDistanceMiles,
      suggestedPrice: cached.suggested_price,
      rationale: cached.price_rationale,
    });
  }

  res.json(results);
});
