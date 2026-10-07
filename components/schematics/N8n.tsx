export function N8nSchematic() {
  return (
    <svg className="schem" viewBox="0 0 480 400" data-schem="n8n">
      <g className="wires">
        <path className="ln" d="M76 200H112"/>
        <path className="ln" d="M172 200H208"/>
        <path className="ln ln--dash" d="M172 214C190 214 190 280 190 296"/>
        <path className="ln ln--mute" d="M185 301l10 10M195 301l-10 10"/>
        <path className="ln" d="M268 200H304"/>
        <path className="ln" d="M364 184C390 184 386 92 412 92"/>
        <path className="ln" d="M364 200H412"/>
        <path className="ln" d="M364 216C390 216 386 308 412 308"/>
      </g>
      <g className="pkts">
        <path className="pkt" d="M46 200H340L364 184C390 184 386 92 412 92H442"/>
        <path className="pkt" d="M46 200H442"/>
        <path className="pkt" d="M46 200H340L364 216C390 216 386 308 412 308H442"/>
        <path className="pkt" d="M46 200H160L172 214C190 214 190 280 190 296"/>
      </g>
      <g className="nodes">
        <g className="node">
          <path className="box" d="M46 170H62A14 14 0 0 1 76 184V216A14 14 0 0 1 62 230H46A30 30 0 0 1 46 170Z"/>
          <path className="icon-fill" d="M49 186L39 203H46L43 214L54 197H47Z"/>
          <circle className="port" cx="76" cy="200" r="4"/>
          <text className="lbl lbl--sm lbl--mute" x="46" y="252" textAnchor="middle">Webhook</text>
        </g>
        <g className="node">
          <rect className="box" x="112" y="170" width="60" height="60" rx="14"/>
          <circle className="icon" cx="142" cy="200" r="11"/>
          <path className="icon" d="M136.5 200.5l4 4 7.5-8"/>
          <circle className="port" cx="172" cy="200" r="4"/>
          <circle className="port" cx="172" cy="214" r="4"/>
          <text className="lbl lbl--sm lbl--mute" x="142" y="252" textAnchor="middle">Validate</text>
        </g>
        <g className="node">
          <rect className="box" x="208" y="170" width="60" height="60" rx="14"/>
          <path className="icon-fill" d="M238 186C239.8 195.2 242.8 198.2 252 200C242.8 201.8 239.8 204.8 238 214C236.2 204.8 233.2 201.8 224 200C233.2 198.2 236.2 195.2 238 186Z"/>
          <circle className="port" cx="268" cy="200" r="4"/>
          <text className="lbl lbl--sm lbl--mute" x="238" y="252" textAnchor="middle">AI Agent</text>
        </g>
        <g className="node">
          <rect className="box" x="304" y="170" width="60" height="60" rx="14"/>
          <path className="icon" d="M322 200H330M330 200C336 200 336 190 345 190M330 200H346M330 200C336 200 336 210 345 210"/>
          <circle className="port" cx="364" cy="184" r="4"/>
          <circle className="port" cx="364" cy="200" r="4"/>
          <circle className="port" cx="364" cy="216" r="4"/>
          <text className="lbl lbl--sm lbl--mute" x="334" y="252" textAnchor="middle">Switch</text>
        </g>
        <g className="node"><rect className="box" x="412" y="62" width="60" height="60" rx="14"/><circle className="icon" cx="442" cy="87" r="5.5"/><path className="icon" d="M432 103c0-7.5 20-7.5 20 0"/><text className="lbl lbl--sm lbl--mute" x="442" y="144" textAnchor="middle">Sales</text></g>
        <g className="node"><rect className="box" x="412" y="170" width="60" height="60" rx="14"/><circle className="icon" cx="442" cy="195" r="5.5"/><path className="icon" d="M432 211c0-7.5 20-7.5 20 0"/><text className="lbl lbl--sm lbl--mute" x="442" y="252" textAnchor="middle">Operations</text></g>
        <g className="node"><rect className="box" x="412" y="278" width="60" height="60" rx="14"/><circle className="icon" cx="442" cy="303" r="5.5"/><path className="icon" d="M432 319c0-7.5 20-7.5 20 0"/><text className="lbl lbl--sm lbl--mute" x="442" y="360" textAnchor="middle">Marketing</text></g>
      </g>
    </svg>
  );
}
