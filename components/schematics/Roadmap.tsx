export function RoadmapSchematic() {
  return (
    <svg className="schem" viewBox="0 0 480 400" data-schem="geo-roadmap">
      <text className="lbl lbl--strong" x="240" y="198" textAnchor="middle">AI visibility</text>
      <text className="lbl lbl--detail" x="240" y="220" textAnchor="middle">mentions, citations</text>
      <g className="wires">
        <path className="ln" d="M240 60A140 140 0 0 1 240 340A140 140 0 0 1 240 60"/>
      </g>
      <g className="pkts">
        <path className="pkt" d="M240 60A140 140 0 0 1 240 340A140 140 0 0 1 240 60"/>
      </g>
      <g className="nodes">
        <g className="node"><rect className="box" x="172" y="32" width="136" height="56" rx="12"/><text className="lbl" x="240" y="56" textAnchor="middle">Measure</text><text className="lbl lbl--detail" x="240" y="74" textAnchor="middle">prompt baseline</text></g>
        <g className="node"><rect className="box" x="305" y="129" width="136" height="56" rx="12"/><text className="lbl" x="373" y="153" textAnchor="middle">Access</text><text className="lbl lbl--detail" x="373" y="171" textAnchor="middle">Bing, IndexNow</text></g>
        <g className="node"><rect className="box" x="254" y="285" width="136" height="56" rx="12"/><text className="lbl" x="322" y="309" textAnchor="middle">Structure</text><text className="lbl lbl--detail" x="322" y="327" textAnchor="middle">schema.org graph</text></g>
        <g className="node"><rect className="box" x="90" y="285" width="136" height="56" rx="12"/><text className="lbl" x="158" y="309" textAnchor="middle">Answer</text><text className="lbl lbl--detail" x="158" y="327" textAnchor="middle">answer-first</text></g>
        <g className="node"><rect className="box" x="39" y="129" width="136" height="56" rx="12"/><text className="lbl" x="107" y="153" textAnchor="middle">Authority</text><text className="lbl lbl--detail" x="107" y="171" textAnchor="middle">cited sources</text></g>
      </g>
    </svg>
  );
}
