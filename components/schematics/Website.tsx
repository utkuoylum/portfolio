export function WebsiteSchematic() {
  return (
    <svg className="schem" viewBox="0 0 480 400" data-schem="website">
      <text className="lbl lbl--mute" x="16" y="76">Webflow website</text>
      <g className="wires">
        <path className="ln" d="M200 200C258 200 258 80 316 80"/>
        <path className="ln" d="M200 200C258 200 258 152 316 152"/>
        <path className="ln" d="M200 200C258 200 258 224 316 224"/>
        <path className="ln" d="M200 200C258 200 258 296 316 296"/>
      </g>
      <g className="pkts">
        <path className="pkt" d="M200 200C258 200 258 80 316 80"/>
        <path className="pkt" d="M200 200C258 200 258 152 316 152"/>
        <path className="pkt" d="M200 200C258 200 258 224 316 224"/>
        <path className="pkt" d="M200 200C258 200 258 296 316 296"/>
      </g>
      <g className="nodes">
        <g className="node">
          <rect className="box" x="16" y="92" width="184" height="216" rx="12"/>
          <path className="ln" d="M16 120H200"/>
          <circle className="fill-mute" cx="34" cy="106" r="3.5"/>
          <circle className="fill-mute" cx="46" cy="106" r="3.5"/>
          <circle className="fill-mute" cx="58" cy="106" r="3.5"/>
          <path className="skel" d="M38 150H150M38 168H176M38 186H126"/>
          <rect className="box box--mute" x="36" y="212" width="144" height="30" rx="8"/>
          <rect className="fill" x="36" y="254" width="84" height="30" rx="15"/>
        </g>
        <g className="node"><rect className="box" x="316" y="58" width="148" height="44" rx="10"/><text className="lbl" x="332" y="85">Analytics</text></g>
        <g className="node"><rect className="box" x="316" y="130" width="148" height="44" rx="10"/><text className="lbl" x="332" y="157">CRM</text></g>
        <g className="node"><rect className="box" x="316" y="202" width="148" height="44" rx="10"/><text className="lbl" x="332" y="229">Ad platforms</text></g>
        <g className="node"><rect className="box" x="316" y="274" width="148" height="44" rx="10"/><text className="lbl" x="332" y="301">Mobile app</text></g>
      </g>
    </svg>
  );
}
