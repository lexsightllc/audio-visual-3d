import { z } from 'zod';

// Helper functions for validation and transformation
const clamp = (min: number, max: number) => (n: number) =>
  Math.min(max, Math.max(min, n));

const clamp01 = clamp(0, 1);
const clampValence = clamp(-1, 1);
const clampMs = clamp(1, 120_000);

// Schema definition
export const sceneControlSchema = z.object({
  // Core emotional dimensions (0-1 for arousal, -1 to 1 for valence)
  arousal: z.coerce.number().transform(clamp01).default(0.4),
  valence: z.coerce.number().transform(clampValence).default(0),

  // Visual effect: twisting animation
  twist: z.object({
    axis: z.enum(["primaryDiagonal", "secondaryDiagonal", "y"]).default("y"),
    magnitude: z.coerce.number().transform(clamp01).default(0.2),
    durationMs: z.coerce.number().transform(clampMs).default(1500)
  }).strict(),

  // Particle effects
  shards: z.object({
    density: z.coerce.number().transform(clamp01).default(0.1),
    halfLifeMs: z.coerce.number().transform(clampMs).default(3000)
  }).strict(),

  // Color scheme
  palette: z.enum(["nocturne", "prismatic", "infra"]).default("nocturne")
}).strict();

// TypeScript type
export type SceneControl = z.infer<typeof sceneControlSchema>;

// Default values
export const defaultSceneControl: SceneControl = {
  arousal: 0.4,
  valence: 0,
  twist: {
    axis: "y",
    magnitude: 0.2,
    durationMs: 1500
  },
  shards: {
    density: 0.1,
    halfLifeMs: 3000
  },
  palette: "nocturne"
};

/**
 * Safely parse and validate scene control data
 * @param input Unknown input to parse
 * @returns Validated SceneControl object with defaults for missing fields
 */
export function parseSceneControl(input: unknown): SceneControl {
  const result = sceneControlSchema.safeParse(input);
  return result.success ? result.data : { ...defaultSceneControl };
}

/**
 * Type guard for SceneControl
 * @param input Value to check
 * @returns Whether the input is a valid SceneControl
 */
export function isSceneControl(input: unknown): input is SceneControl {
  return sceneControlSchema.safeParse(input).success;
}

/**
 * Merge partial scene control updates with defaults
 * @param current Current scene control state
 * @param updates Partial updates to apply
 * @returns Merged scene control state
 */
export function mergeSceneControl(
  current: SceneControl,
  updates: Partial<SceneControl>
): SceneControl {
  return {
    ...current,
    ...updates,
    twist: { ...current.twist, ...updates.twist },
    shards: { ...current.shards, ...updates.shards }
  };
}
