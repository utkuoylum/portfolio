export function AttributionSchematic() {
  return (
    <svg className="schem" viewBox="0 0 480 400" data-schem="attribution">
      <g className="wires">
        <path className="ln" d="M86 60C86 88 240 84 240 112"/>
        <path className="ln" d="M240 60V112"/>
        <path className="ln" d="M394 60C394 88 240 84 240 112"/>
        <path className="ln" d="M240 160V192"/>
        <path className="ln" d="M240 296C240 316 130 312 130 332"/>
        <path className="ln" d="M240 296C240 316 350 312 350 332"/>
      </g>
      <g className="pkts">
        <path className="pkt" d="M86 60C86 88 240 84 240 112V296C240 316 130 312 130 332"/>
        <path className="pkt" d="M240 60V296C240 316 350 312 350 332"/>
        <path className="pkt" d="M394 60C394 88 240 84 240 112V296C240 316 130 312 130 332"/>
      </g>
      <g className="nodes">
        <g className="node"><rect className="box" x="16" y="24" width="140" height="36" rx="18"/><text className="lbl lbl--code" x="86" y="47" textAnchor="middle">utm_source</text></g>
        <g className="node"><rect className="box" x="170" y="24" width="140" height="36" rx="18"/><text className="lbl lbl--code" x="240" y="47" textAnchor="middle">utm_campaign</text></g>
        <g className="node"><rect className="box" x="324" y="24" width="140" height="36" rx="18"/><text className="lbl lbl--code" x="394" y="47" textAnchor="middle">gclid, fbclid</text></g>
        <g className="node"><rect className="box" x="140" y="112" width="200" height="48" rx="10"/><text className="lbl" x="240" y="141" textAnchor="middle">Google Tag Manager</text></g>
        <g className="node">
          <rect className="box" x="110" y="192" width="260" height="104" rx="12"/>
          <path className="ln ln--faint" d="M126 226H354M126 260H354"/>
          <text className="lbl lbl--mute" x="128" y="214">Channel</text>
          <text className="lbl lbl--mute" x="128" y="248">Detail</text>
          <text className="lbl lbl--mute" x="128" y="282">Group</text>
          <text className="lbl attr-val" x="352" y="214" textAnchor="end">Paid social</text>
          <text className="lbl attr-val" x="352" y="248" textAnchor="end">Meta</text>
          <text className="lbl attr-val" x="352" y="282" textAnchor="end">Paid</text>
        </g>
        <g className="node"><rect className="box" x="40" y="332" width="180" height="44" rx="10"/><text className="lbl" x="130" y="359" textAnchor="middle">Lead in the CRM</text></g>
        <g className="node"><rect className="box" x="260" y="332" width="180" height="44" rx="10"/><text className="lbl" x="350" y="359" textAnchor="middle">Dashboards</text></g>
      </g>
    </svg>
  );
}
