import { education, languages } from '@/lib/content';
import Field from './Field';

export default function Background() {
  return (
    <section className="background" id="background" aria-label="Education and languages" data-section="background">
      <Field variant="quiet" />
      <div className="wrap background__grid">
        <div className="background__col">
          <h2 className="small-title">Education</h2>
          <ul className="facts">
            {education.map((item) => (
              <li key={item.main}>
                <span className="facts__main">{item.main}</span>
                <span className="facts__sub">{item.sub}</span>
                <span className="facts__aside">{item.aside}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="background__col">
          <h2 className="small-title">Languages</h2>
          <ul className="facts">
            {languages.map((item) => (
              <li key={item.main}>
                <span className="facts__main">{item.main}</span>
                <span className="facts__sub">{item.sub}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
