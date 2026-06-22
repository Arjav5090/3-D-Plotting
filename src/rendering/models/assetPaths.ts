/** GLB paths for user-provided models under public/models/required/. */
import { useGLTF } from "@react-three/drei";

export const ASSETS = {
  avenueTree: "/models/required/03-old_tree/plant_series__palm_tree.glb",
  fountain: "/models/required/12-fountain/fountain_water_simulation.glb",
  bench: "/models/required/13-bench/bench.glb",
  lampPost: "/models/required/14-lamp_post/moscow_lamp_post.glb",
  flowerBed:
    "/models/required/15-flower_bed/blumenbeet_download_-_flower_bed_for_free.glb",
  gardenTree: "/models/required/16-garden_tree/high_quality_tree_66.glb",
  carSedan: "/models/required/17-car_sedan/generic_sedan_car.glb",
  carSuv: "/models/required/18-car_suv/mmc_generic_small_suv_car.glb",
  carHatch: "/models/required/19-car_hatch/2016_volkswagen_polo.glb",
  greenBush: "/models/required/20-green-bush/green_bush.glb",
  lowPolyPot: "/models/required/21-low-poly-pot/low_poly_pot.glb",
} as const;

for (const url of Object.values(ASSETS)) {
  useGLTF.preload(url);
}
