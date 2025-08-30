// deterministic seed helper
import seedrandom from "seedrandom";

export function initSeed(seed?: string) {
  const s = seed || (import.meta.env.VITE_SEED ?? "00000000");
  const rng = seedrandom(s);
  return {
    seed: s,
    rand: () => rng.quick(), // [0,1)
  };
}
