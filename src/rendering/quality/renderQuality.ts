/** Canvas DPR range — cap at 2× for retina sharpness without 3×+ fill cost. */
export function canvasDprRange(): [number, number] {
  return [1, 2];
}
