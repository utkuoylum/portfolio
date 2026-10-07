// Order in which the 100 cells light up; a fixed, scattered sequence (2 lit before, 20 after).
const RANKS = [
  95, 48, 93, 1, 81, 3, 85, 24, 55, 56,
  2, 68, 98, 7, 77, 38, 99, 6, 73, 64,
  43, 26, 25, 19, 59, 18, 16, 0, 60, 15,
  57, 52, 79, 92, 42, 11, 61, 78, 76, 14,
  44, 58, 65, 8, 67, 66, 27, 62, 83, 34,
  49, 23, 90, 74, 51, 17, 72, 40, 12, 80,
  89, 21, 39, 53, 71, 41, 20, 54, 9, 82,
  29, 94, 32, 45, 31, 46, 97, 88, 5, 47,
  96, 35, 36, 10, 30, 69, 50, 63, 37, 33,
  84, 13, 70, 22, 28, 87, 86, 91, 4, 75,
];

const GRID = RANKS.map((rank, cell) => (
  <circle
    key={cell}
    className={rank < 20 ? 'dot on' : 'dot'}
    cx={24 + (cell % 10) * 22}
    cy={136 + Math.floor(cell / 10) * 22}
    r={6}
    data-rank={rank}
  />
));

export function VisibilitySchematic() {
  return (
    <svg className="schem" viewBox="0 0 480 400" data-schem="ai-visibility">
      <text className="lbl lbl--mute" x="16" y="40">AI visibility</text>
      <text className="num" x="14" y="98" data-counter data-from="2" data-to="20">20%</text>
      <g className="grid">{GRID}</g>
      <text className="lbl lbl--mute" x="270" y="152">Organic leads</text>
      <rect className="fill-mute" x="270" y="166" width="56" height="10" rx="5"/>
      <text className="lbl lbl--sm lbl--mute" x="336" y="176">1×</text>
      <rect className="fill bar-after" x="270" y="190" width="168" height="10" rx="5"/>
      <text className="lbl lbl--sm" x="446" y="200">3×</text>
      <text className="lbl lbl--mute" x="270" y="262">Tracked competitors</text>
      <path className="ln ln--mute" d="M276 290H456"/>
      <g className="ticks">
        <circle className="tick" cx="276" cy="290" r="4"/><circle className="tick" cx="296" cy="290" r="4"/>
        <circle className="tick" cx="316" cy="290" r="4"/><circle className="tick" cx="336" cy="290" r="4"/>
        <circle className="tick" cx="356" cy="290" r="4"/><circle className="tick" cx="376" cy="290" r="4"/>
        <circle className="tick" cx="396" cy="290" r="4"/><circle className="tick" cx="416" cy="290" r="4"/>
        <circle className="tick" cx="436" cy="290" r="4"/><circle className="tick" cx="456" cy="290" r="4"/>
      </g>
      <circle className="fill brand" cx="426" cy="290" r="7"/>
      <text className="lbl lbl--strong" x="270" y="330">Ahead of 80%</text>
    </svg>
  );
}
