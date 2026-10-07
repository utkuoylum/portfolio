export function LifecycleSchematic() {
  return (
    <svg className="schem" viewBox="0 0 480 400" data-schem="lifecycle">
      <text className="lbl lbl--mute" x="240" y="350" textAnchor="middle">Lifecycle journeys</text>
      <g className="wires">
        <path className="ln" d="M144 62H176"/>
        <path className="ln" d="M304 62H336"/>
        <path className="ln" d="M400 88C400 124 240 114 240 150"/>
        <path className="ln" d="M240 202C240 236 104 232 104 268"/>
        <path className="ln" d="M126 290H218"/>
        <path className="ln" d="M262 290H354"/>
      </g>
      <g className="pkts">
        <path className="pkt" d="M80 62H400V88C400 124 240 114 240 150V202C240 236 104 232 104 268V290H376"/>
        <path className="pkt" d="M80 62H400V88C400 124 240 114 240 150V202C240 236 104 232 104 268V290H376"/>
        <path className="pkt" d="M80 62H400V88C400 124 240 114 240 150V202C240 236 104 232 104 268V290H376"/>
      </g>
      <g className="nodes">
        <g className="node">
          <rect className="box" x="16" y="36" width="128" height="52" rx="10"/>
          <rect className="icon" x="32" y="53" width="20" height="18" rx="3"/>
          <path className="icon" d="M32 59H52"/>
          <text className="lbl" x="62" y="67">Retool</text>
        </g>
        <g className="node">
          <rect className="box" x="176" y="36" width="128" height="52" rx="10"/>
          <path className="icon" d="M198 52V72M189.3 57L206.7 67M189.3 67L206.7 57"/>
          <text className="lbl" x="216" y="67">Snowflake</text>
        </g>
        <g className="node">
          <rect className="box" x="336" y="36" width="128" height="52" rx="10"/>
          <circle className="icon" cx="355" cy="55" r="3"/>
          <circle className="icon" cx="355" cy="69" r="3"/>
          <circle className="icon" cx="369" cy="62" r="3"/>
          <path className="icon" d="M358 56.5L366 60.5M358 67.5L366 63.5"/>
          <text className="lbl" x="384" y="67">dbt</text>
        </g>
        <g className="node"><rect className="box" x="170" y="150" width="140" height="52" rx="10"/><text className="lbl" x="240" y="181" textAnchor="middle">Braze</text></g>
        <g className="node">
          <rect className="box" x="82" y="268" width="44" height="44" rx="12"/>
          <rect className="icon" x="94" y="283" width="20" height="14" rx="2"/>
          <path className="icon" d="M94 285L104 292L114 285"/>
        </g>
        <g className="node">
          <rect className="box" x="218" y="268" width="44" height="44" rx="12"/>
          <path className="icon" d="M232 296H248M234 296V290A6 6 0 0 1 246 290V296M238 299.5A2 2 0 0 0 242 299.5"/>
        </g>
        <g className="node">
          <rect className="box" x="354" y="268" width="44" height="44" rx="12"/>
          <path className="icon" d="M368 282H384A3 3 0 0 1 387 285V293A3 3 0 0 1 384 296H374L369 300V296H368A3 3 0 0 1 365 293V285A3 3 0 0 1 368 282Z"/>
        </g>
      </g>
    </svg>
  );
}
