import { LAND_TYPE } from "../../constant";
import type { LandType } from "../type";

export const getBackgroundColorByType = (type: LandType | undefined) => {
  switch (type) {
    case LAND_TYPE.FOREST:
      return "#228B22";
    case LAND_TYPE.DESERT:
      return "#F5DEB3";
    case LAND_TYPE.OCEAN:
      return "#1E90FF";
    case LAND_TYPE.MOUNTAIN:
      return "#A9A9A9";
    case LAND_TYPE.PLAINS:
      return "#9ACD32";
    default:
      return "";
  }
};
