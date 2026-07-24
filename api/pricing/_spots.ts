import fs from "fs";
import path from "path";

let founderSpotsRemaining = 23;
const FOUNDER_SPOTS_FILE = path.join("/tmp", ".founder_spots.json");

export function getFounderSpots(): { remaining: number; total: number; soldOut: boolean } {
  try {
    if (fs.existsSync(FOUNDER_SPOTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(FOUNDER_SPOTS_FILE, "utf-8"));
      if (typeof data.remaining === "number") {
        founderSpotsRemaining = Math.max(0, data.remaining);
      }
    } else {
      fs.writeFileSync(FOUNDER_SPOTS_FILE, JSON.stringify({ remaining: 23, total: 30 }));
    }
  } catch (err) {
    console.warn("Could not load founder spots file:", err);
  }

  return {
    remaining: founderSpotsRemaining,
    total: 30,
    soldOut: founderSpotsRemaining <= 0
  };
}

export function decrementFounderSpots(): { remaining: number; total: number; soldOut: boolean } {
  const current = getFounderSpots();
  if (current.remaining > 0) {
    founderSpotsRemaining = current.remaining - 1;
    try {
      fs.writeFileSync(FOUNDER_SPOTS_FILE, JSON.stringify({ remaining: founderSpotsRemaining, total: 30 }));
    } catch (err) {
      console.warn("Could not save founder spots file:", err);
    }
  }
  return {
    remaining: founderSpotsRemaining,
    total: 30,
    soldOut: founderSpotsRemaining <= 0
  };
}
