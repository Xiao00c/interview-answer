import type { LandType } from "../mapGenerator/type";

export const LAND_TYPE = {
  FOREST: "FOREST",
  DESERT: "DESERT",
  OCEAN: "OCEAN",
  MOUNTAIN: "MOUNTAIN",
  PLAINS: "PLAINS",
};

export const LAND_TYPE_THRESHOLD: Record<LandType, number> = {
  FOREST: 20,
  DESERT: 20,
  OCEAN: 20,
  MOUNTAIN: 20,
  PLAINS: 20,
};
