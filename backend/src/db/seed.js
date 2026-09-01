import { runSeed } from "./seedData.js";

const { legCount, loadCount } = runSeed();

console.log(`Seeded ${legCount} empty legs and ${loadCount} load requests.`);
console.log("Run the server and hit GET /api/matches to see the matcher in action.");
