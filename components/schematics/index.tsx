import type { SchematicKind } from '@/lib/content';
import { WebsiteSchematic } from './Website';
import { AttributionSchematic } from './Attribution';
import { RoadmapSchematic } from './Roadmap';
import { VisibilitySchematic } from './Visibility';
import { N8nSchematic } from './N8n';
import { LifecycleSchematic } from './Lifecycle';
import { ConsentSchematic } from './Consent';

const schematics: Record<SchematicKind, () => React.JSX.Element> = {
  'website': WebsiteSchematic,
  'attribution': AttributionSchematic,
  'geo-roadmap': RoadmapSchematic,
  'ai-visibility': VisibilitySchematic,
  'n8n': N8nSchematic,
  'lifecycle': LifecycleSchematic,
  'consent': ConsentSchematic,
};

/** The line drawing for one case. Pure SVG: the motion layer animates it by class names. */
export function Schematic({ kind }: { kind: SchematicKind }) {
  const Drawing = schematics[kind];
  return <Drawing />;
}
