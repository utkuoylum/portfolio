// All copy on the page, as typed data. Facts come from the CV or were confirmed by Etem.

/** The canonical origin. Metadata, robots, sitemap and JSON-LD all derive from it. */
export const SITE_URL = 'https://oylum.dev';

export const person = {
  name: 'Etem Utku Oylum',
  alternateName: 'Utku Oylum',
  jobTitle: 'Senior Marketing Technology & Automation Manager',
  email: 'utkuoylum@gmail.com',
  linkedin: 'https://linkedin.com/in/utkuoylum',
  github: 'https://github.com/utkuoylum',
  url: `${SITE_URL}/`,
};

export const seo = {
  title: 'Etem Utku Oylum | Marketing Technology & Automation, Berlin',
  description:
    'Berlin-based marketing technology and automation lead. I build the CRM, data, acquisition and AI workflow systems behind measurable growth, across B2B and B2C.',
  shareTitle: 'Etem Utku Oylum | Marketing Technology & Automation',
  shareDescription:
    'I build the systems behind growth: CRM, data, acquisition and AI workflows across B2B and B2C. Based in Berlin.',
};

export const hero = {
  statement: 'I build the systems behind growth.',
  intro:
    'Marketing technology and automation lead. I turn business priorities into roadmaps, then build the CRM, data, acquisition and AI workflows that deliver them.',
  now: ['Currently Senior Marketing Automation Manager at ucm.', 'Based in Berlin. EU Blue Card holder.'],
};

export const profile =
  'I combine strategic ownership with hands-on delivery. My entrepreneurial background keeps technical decisions tied to commercial goals, whether I lead the project, work across teams or own the implementation. I bring new AI and workflow capabilities into operations and customer journeys early. The goal stays the same: less manual work, more measurable growth.';

export type SchematicKind =
  | 'website'
  | 'attribution'
  | 'geo-roadmap'
  | 'ai-visibility'
  | 'n8n'
  | 'lifecycle'
  | 'consent';

export type CaseItem = {
  id: SchematicKind;
  meta: string;
  title: string;
  body: string;
  stack: string;
  /** The n8n case sits on a dotted canvas, like the editor it was built in. */
  grid?: boolean;
};

export const work = {
  title: 'Things I build',
  lede: 'Systems that run from the first click to the lifecycle message.',
  cases: [
    {
      id: 'website',
      meta: 'ucm, 2026',
      title: 'A website and its measurement layer, built from scratch',
      body: 'I built and launched a new Webflow website together with everything that measures it: analytics, event tracking, web-to-app journeys, CRM integrations and advertising conversion events. Acquisition workflows now connect the website, HubSpot and the mobile app.',
      stack: 'Webflow, HubSpot, event tracking, conversion events',
    },
    {
      id: 'attribution',
      meta: 'ucm, 2026',
      title: 'An attribution system in Google Tag Manager',
      body: 'Every visit is classified where it starts. Tag Manager reads UTM parameters and click IDs, sorts the visit into channel, channel detail and channel group, and carries that through the lead form, so every lead is attributed before it reaches the CRM. Dashboards and budget decisions run on the same three fields.',
      stack: 'Google Tag Manager, UTM taxonomy, click IDs, HubSpot',
    },
    {
      id: 'geo-roadmap',
      meta: 'SEO and GEO, 2026',
      title: 'Roadmaps for visibility in AI answers',
      body: 'It starts with a measured baseline: prompt sets per audience, run repeatedly across ChatGPT, Gemini and Perplexity and scored for mention and citation share. Then the layers: crawl access through Google and the Bing index, a connected schema.org entity graph, answer-first pages built on the tracked prompts, and the third-party sources models cite. Every month the baseline runs again and priorities are re-ranked from the evidence.',
      stack: 'Prompt monitoring, schema.org, llms.txt, hreflang, Search Console API',
    },
    {
      id: 'ai-visibility',
      meta: 'ucm, 2026',
      title: 'From under 2% to about 20% AI visibility',
      body: 'I developed and run the SEO and Generative Engine Optimization roadmap. AI visibility rose from below 2% to approximately 20%, placing the brand ahead of 80% of tracked competitors, and organic lead volume tripled across B2B and B2C.',
      stack: 'SEO, GEO, content, organic discoverability',
    },
    {
      id: 'n8n',
      meta: 'Zenjob, 2025-2026',
      title: 'n8n workflows that qualify and route leads',
      body: 'Leads arrive through a webhook, get validated, are qualified by an AI agent and routed to Sales, Operations or Marketing. I built the workflows with n8n and Retool, connected to the rest of the stack through REST APIs, OAuth and webhooks.',
      stack: 'n8n, Retool, AI agents, REST APIs, OAuth, webhooks',
      grid: true,
    },
    {
      id: 'lifecycle',
      meta: 'Zenjob, 2025-2026',
      title: 'Lifecycle automation fed by warehouse data',
      body: 'Operational data comes in through Retool and lands in Snowflake. dbt models it into the attributes and events lifecycle messaging needs, and Braze ingests the result to trigger automated journeys, with no manual exports in between.',
      stack: 'Retool, Snowflake, dbt, Braze',
    },
    {
      id: 'consent',
      meta: 'Zenjob, 2025-2026',
      title: 'Consent-aware tracking and RAG knowledge tools',
      body: 'I implemented consent-aware tracking with Segment and mParticle, so data only flows once a user has agreed to it. I also developed RAG-based internal knowledge tools for marketing and operational workflows, and turned recurring automations into reusable modules with documentation.',
      stack: 'Segment, mParticle, consent management, RAG',
    },
  ] satisfies CaseItem[] as CaseItem[],
};

type Moment = { label: string; datetime: string };

export type Role = {
  /** Start year: drives the odometer. */
  year: number;
  start: Moment;
  end: Moment | 'now';
  title: string;
  org: string;
  desc: string;
};

export const experience = {
  title: 'Experience',
  lede: 'From football data for EA SPORTS in 2005 to marketing systems today.',
  roles: [
    {
      year: 2026,
      start: { label: 'May 2026', datetime: '2026-05' },
      end: 'now',
      title: 'Senior Marketing Automation Manager',
      org: 'ucm, Berlin',
      desc: 'New website and measurement stack, the SEO and GEO roadmap, and AI and automation across campaign execution, content and creative production, reporting and internal coordination.',
    },
    {
      year: 2025,
      start: { label: 'May 2025', datetime: '2025-05' },
      end: { label: 'May 2026', datetime: '2026-05' },
      title: 'Marketing Technology Manager',
      org: 'Zenjob, Berlin',
      desc: 'Martech infrastructure across Marketing, Sales and Operations, built with Engineering, Product and Data teams. AI-assisted lead workflows, consent-aware tracking and RAG knowledge tools.',
    },
    {
      year: 2024,
      start: { label: 'July 2024', datetime: '2024-07' },
      end: { label: 'May 2025', datetime: '2025-05' },
      title: 'Meta Ads Technical Support',
      org: 'Concentrix, Berlin',
      desc: 'Diagnosed Pixel, Conversions API, attribution and event issues for advertisers, and worked with product, engineering and operations teams on recurring tracking problems.',
    },
    {
      year: 2018,
      start: { label: 'February 2018', datetime: '2018-02' },
      end: { label: 'January 2025', datetime: '2025-01' },
      title: 'Digital Marketing Consultant',
      org: 'Freelance, Izmir and remote',
      desc: 'Websites, landing pages, paid advertising, SEO and conversion rate optimization for local businesses in Izmir and clients from online freelance projects.',
    },
    {
      year: 2016,
      start: { label: 'April 2016', datetime: '2016-04' },
      end: { label: 'March 2019', datetime: '2019-03' },
      title: 'Founding Partner, Web Developer and Marketing Manager',
      org: 'Cuiba Dance Center, Izmir',
      desc: 'Built and ran the digital side of the business: website, lead capture, analytics, SEO, paid marketing and the automation behind class sign-ups and daily operations.',
    },
    {
      year: 2013,
      start: { label: 'May 2013', datetime: '2013-05' },
      end: { label: 'June 2015', datetime: '2015-06' },
      title: 'Digital Marketing Specialist, Web Developer and Trainer',
      org: 'Danskeyfi Dance Academies, Istanbul',
      desc: 'Improved the website, SEO and conversion tracking, and built lead collection and communication workflows for digital acquisition.',
    },
    {
      year: 2005,
      start: { label: '2005', datetime: '2005' },
      end: { label: '2007', datetime: '2007' },
      title: 'Managing Editor',
      org: 'EA SPORTS, remote',
      desc: 'Managed the Turkish football data for the FIFA and Total Club Manager PC games.',
    },
  ] satisfies Role[] as Role[],
};

export type LayerId = 'acquisition' | 'data' | 'crm' | 'ai' | 'engineering';

export const toolkit = {
  title: 'Toolkit',
  lede: 'Five layers I connect into one system.',
  /** The four layers that form the pipeline; engineering is the bus underneath. */
  flow: ['acquisition', 'data', 'crm', 'ai'] as LayerId[],
  bus: 'engineering' as LayerId,
  layers: [
    {
      id: 'acquisition',
      name: 'Acquisition & web',
      tools: 'Meta Ads, Google Ads, TikTok Ads, SEO/GEO, CRO. Webflow, WordPress, JavaScript, React, Next.js, HTML/CSS.',
    },
    {
      id: 'data',
      name: 'Data & measurement',
      tools: 'Segment, mParticle, Hightouch, Snowflake, dbt, SQL. GTM, Google Analytics, Matomo, PostHog, Adjust, AppsFlyer, consent management.',
    },
    {
      id: 'crm',
      name: 'CRM & lifecycle',
      tools: 'Braze, HubSpot, Salesforce. Segmentation, personalization, journey orchestration.',
    },
    {
      id: 'ai',
      name: 'Automation & AI',
      tools: 'n8n, Zapier, Make, Retool, Langdock, Claude, Cursor. AI agents, RAG, MCP, human-in-the-loop workflows.',
    },
    {
      id: 'engineering',
      name: 'Engineering & integrations',
      tools: 'Python, REST APIs, webhooks, SDK implementation, Git, GitHub.',
    },
  ] as { id: LayerId; name: string; tools: string }[],
};

export const education = [
  { main: 'MBA', sub: 'Berlin School of Business and Innovation', aside: '2022-2024' },
  { main: 'Agricultural Engineering, Economics', sub: 'Akdeniz University', aside: '2006-2012' },
];

export const languages = [
  { main: 'Turkish', sub: 'Native' },
  { main: 'English', sub: 'Professional proficiency' },
  { main: 'German', sub: 'Intermediate, actively improving' },
];

export const contact = {
  title: 'Let’s build the next system.',
  logTitle: 'Your visit, as I would track it',
  logNote:
    'Every interaction on this page fires an event, the way I instrument products. The log lives in this tab only: no cookies, no storage, nothing sent anywhere.',
  noScript: 'JavaScript is off, so nothing is logged. A perfectly valid consent choice.',
};

export const nav = [
  { href: '#work', label: 'Work' },
  { href: '#experience', label: 'Experience' },
  { href: '#toolkit', label: 'Toolkit' },
  { href: '#contact', label: 'Contact' },
];

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: person.name,
  alternateName: person.alternateName,
  url: person.url,
  image: `${SITE_URL}/opengraph-image.png`,
  jobTitle: person.jobTitle,
  worksFor: { '@type': 'Organization', name: 'ucm' },
  address: { '@type': 'PostalAddress', addressLocality: 'Berlin', addressCountry: 'DE' },
  email: `mailto:${person.email}`,
  sameAs: [person.linkedin, person.github],
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Berlin School of Business and Innovation' },
    { '@type': 'CollegeOrUniversity', name: 'Akdeniz University' },
  ],
  knowsLanguage: ['tr', 'en', 'de'],
  knowsAbout: [
    'Marketing technology', 'Marketing automation', 'CRM', 'Lifecycle marketing',
    'Marketing attribution', 'Performance marketing', 'Conversion rate optimization',
    'Search engine optimization', 'Generative engine optimization', 'AI agents',
    'Retrieval-augmented generation', 'HubSpot', 'Braze', 'Salesforce', 'n8n',
    'Segment', 'mParticle', 'Webflow', 'Google Tag Manager', 'Snowflake', 'dbt', 'Retool',
    'Lifecycle automation',
  ],
};
