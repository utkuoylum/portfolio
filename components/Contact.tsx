import { contact, person } from '@/lib/content';
import BerlinClock from './BerlinClock';
import ContactTitle from './ContactTitle';
import CopyEmail from './CopyEmail';
import Scene from './Scene';
import SessionLog from './SessionLog';

export default function Contact() {
  return (
    <Scene id="contact" className="contact" labelledBy="contact-title">
      <div className="wrap">
        <ContactTitle text={contact.title} />

        <div className="contact__actions">
          <a className="contact__email" href={`mailto:${person.email}`} data-track="email_click">
            {person.email}
          </a>
          <CopyEmail email={person.email} />
        </div>
        <ul className="contact__links">
          <li>
            <a className="link" href={person.linkedin} target="_blank" rel="noopener" data-track="outbound_click">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="link" href={person.github} target="_blank" rel="noopener" data-track="outbound_click">
              GitHub
            </a>
          </li>
        </ul>

        <SessionLog />

        <footer className="footer">
          <p>
            &copy; {new Date().getFullYear()} {person.name}
          </p>
          <p>
            Berlin, <BerlinClock />
          </p>
          <p>No cookies, no trackers.</p>
          <p>
            <a className="link" href="#top" data-track="nav_click">
              Back to top
            </a>
          </p>
        </footer>
      </div>
    </Scene>
  );
}
