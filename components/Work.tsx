import { work } from '@/lib/content';
import Cases from './Cases';
import Scene from './Scene';

export default function Work() {
  return (
    <Scene id="work" className="work" labelledBy="work-title">
      <div className="wrap">
        <header className="section-head">
          <h2 className="section-title" id="work-title">
            {work.title}
          </h2>
          <p className="section-lede">{work.lede}</p>
        </header>
        <Cases items={work.cases} />
      </div>
    </Scene>
  );
}
