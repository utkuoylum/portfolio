export function ConsentSchematic() {
  return (
    <svg className="schem" viewBox="0 0 480 400" data-schem="consent">
      <g className="wires">
        <path className="ln" d="M240 60V120"/>
        <path className="ln" d="M240 152V200"/>
        <path className="ln" d="M240 244C240 277 80 277 80 310"/>
        <path className="ln" d="M240 244V310"/>
        <path className="ln" d="M240 244C240 277 400 277 400 310"/>
      </g>
      <g className="pkts">
        <path className="pkt" d="M240 60V244C240 277 80 277 80 310"/>
        <path className="pkt" d="M240 60V310"/>
        <path className="pkt" d="M240 60V244C240 277 400 277 400 310"/>
        <path className="pkt pkt--drop" d="M240 60V120"/>
      </g>
      <g className="nodes">
        <g className="node"><rect className="box" x="170" y="20" width="140" height="40" rx="20"/><text className="lbl" x="240" y="45" textAnchor="middle">User events</text></g>
        <g className="node consent" data-consent="on">
          <rect className="box consent__track" x="208" y="120" width="64" height="32" rx="16"/>
          <circle className="fill consent__knob" cx="256" cy="136" r="11"/>
          <text className="lbl consent__on" x="288" y="142">Consent given</text>
          <text className="lbl lbl--mute consent__off" x="288" y="142">No consent</text>
        </g>
        <g className="node"><rect className="box" x="140" y="200" width="200" height="44" rx="10"/><text className="lbl" x="240" y="227" textAnchor="middle">Segment, mParticle</text></g>
        <g className="node"><rect className="box" x="20" y="310" width="120" height="44" rx="10"/><text className="lbl" x="80" y="337" textAnchor="middle">Analytics</text></g>
        <g className="node"><rect className="box" x="180" y="310" width="120" height="44" rx="10"/><text className="lbl" x="240" y="337" textAnchor="middle">CRM</text></g>
        <g className="node"><rect className="box" x="340" y="310" width="120" height="44" rx="10"/><text className="lbl" x="400" y="337" textAnchor="middle">Ad platforms</text></g>
      </g>
    </svg>
  );
}
