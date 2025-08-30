import { z } from "zod";
import Ajv from "ajv/dist/2020.js";
import schema from "../../schema/scene-control.schema.json";

export const ZSceneControl = z.object({
  arousal: z.number().min(0).max(1),
  valence: z.number().min(-1).max(1),
  twist: z.object({
    axis: z.enum(["primaryDiagonal","secondaryDiagonal","y"]),
    magnitude: z.number().min(0).max(1),
    durationMs: z.number().int().min(250).max(60000)
  }),
  shards: z.object({
    density: z.number().min(0).max(1),
    halfLifeMs: z.number().int().min(200).max(20000)
  }),
  palette: z.enum(["nocturne","prismatic","infra"])
});
export type SceneControl = z.infer<typeof ZSceneControl>;

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(schema as any);

export function validateSceneControl(payload: unknown): { ok: true; data: SceneControl } | { ok: false; errors: string[] } {
  if (!validate(payload)) {
    return { ok: false, errors: (validate.errors ?? []).map(e => `${e.instancePath} ${e.message}`) };
  }
  const parsed = ZSceneControl.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`) };
  }
  return { ok: true, data: parsed.data };
}
