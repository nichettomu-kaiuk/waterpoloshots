// The signature divider of the "Corsia" theme — a nod to pool lane ropes.
// Invisible (0 height) under the classic theme; revealed by CSS only when
// the <html> element carries the .theme-lane class (see globals.css).
export default function LaneRope() {
  return <div className="lane-rope" aria-hidden="true" />;
}
