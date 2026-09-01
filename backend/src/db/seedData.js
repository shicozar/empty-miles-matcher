import { db } from "./index.js";

/**
 * Wipes and repopulates the demo data. Returns the counts inserted so callers
 * (the CLI seed script, the auto-seed on boot) can log what happened.
 */
export function runSeed() {
  db.exec("DELETE FROM matches; DELETE FROM empty_legs; DELETE FROM load_requests;");

  const insertLeg = db.prepare(`
    INSERT INTO empty_legs (carrier_name, origin, destination, earliest_date, latest_date, capacity_lbs, truck_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLoad = db.prepare(`
    INSERT INTO load_requests (shipper_name, origin, destination, cargo_type, weight_lbs, needed_by, urgency, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const inDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  const legs = [
    ["Valley Freight Co.", "Sacramento, CA", "Fresno, CA", inDays(2), inDays(5), 42000, "Dry Van"],
    ["Pacific Haulers", "Stockton, CA", "Modesto, CA", inDays(1), inDays(3), 20000, "Box Truck"],
    ["Golden State Transport", "Oakland, CA", "San Jose, CA", inDays(3), inDays(6), 35000, "Dry Van"],
    ["Central Valley Logistics", "Bakersfield, CA", "Los Angeles, CA", inDays(4), inDays(7), 40000, "Flatbed"],
    ["Delta Line Carriers", "Manteca, CA", "Hayward, CA", inDays(1), inDays(4), 26000, "Box Truck"],
  ];

  const loads = [
    ["Foothill Foods Co.", "Sacramento, CA", "Fresno, CA", "Packaged food", 18000, inDays(3), "standard", "Pallets, no refrigeration needed"],
    ["Northgate Supply", "Stockton, CA", "Modesto, CA", "Retail goods", 9000, inDays(2), "urgent", "Store restock, tight window"],
    ["BayTech Components", "Oakland, CA", "San Jose, CA", "Electronics", 6000, inDays(4), "standard", "Fragile, needs care in handling"],
    ["SoCal Building Supply", "Bakersfield, CA", "Los Angeles, CA", "Construction materials", 32000, inDays(6), "standard", "Lumber and fixtures"],
    ["Manteca Farms Direct", "Manteca, CA", "Hayward, CA", "Produce", 12000, inDays(2), "urgent", "Time-sensitive, same-week delivery"],
    ["Riverbend Furniture", "Fresno, CA", "Bakersfield, CA", "Furniture", 15000, inDays(10), "standard", "No matching empty leg on this route — should NOT match"],
  ];

  for (const l of legs) insertLeg.run(...l);
  for (const l of loads) insertLoad.run(...l);

  return { legCount: legs.length, loadCount: loads.length };
}
