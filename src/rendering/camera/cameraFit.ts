/** Fit camera distance so both width and height of a ground footprint are in frame. */
export function fitDistance(
  horizontalSpan: number,
  verticalSpan: number,
  verticalFovRad: number,
  aspect: number,
): number {
  const hFov = 2 * Math.atan(Math.tan(verticalFovRad / 2) * Math.max(aspect, 0.1));
  const distV = verticalSpan / 2 / Math.tan(verticalFovRad / 2);
  const distH = horizontalSpan / 2 / Math.tan(hFov / 2);
  return Math.max(distV, distH, 1);
}
