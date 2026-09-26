import { seedInternships } from './seedInternships.js';

export const curatedCatalog = [
  ...seedInternships,
  {
    title: 'Application Security & VAPT Intern',
    company: 'Cloudflare',
    description: 'Perform web application vulnerability assessment and penetration testing (VAPT) across edge worker APIs. Test for OWASP Top 10 vulnerabilities including SQL Injection, XSS, CSRF, and SSRF.',
    skillsRequired: ['VAPT', 'Web Security', 'OWASP Top 10', 'Burp Suite', 'REST APIs', 'Linux'],
    location: 'Remote',
    applyLink: 'https://cloudflare.com/careers/appsec-intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Product Security & Penetration Testing Intern',
    company: 'HackerOne',
    description: 'Work with the security operations team to triage bug bounty vulnerability disclosures, reproduce complex DOM-based XSS, Race Conditions, and API authorization bypasses.',
    skillsRequired: ['Penetration Testing', 'Web Security', 'API Security', 'Burp Suite', 'JavaScript', 'Python'],
    location: 'Remote',
    applyLink: 'https://hackerone.com/careers/security-intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Cloud Security & DevSecOps Intern',
    company: 'CrowdStrike',
    description: 'Audit cloud infrastructure, automate container vulnerability scanning in CI/CD pipelines, and evaluate identity access control policies against cloud threat vectors.',
    skillsRequired: ['AWS', 'Docker', 'Linux', 'CI/CD', 'Network Security', 'Python'],
    location: 'Remote',
    applyLink: 'https://crowdstrike.com/careers/cloudsec-intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Frontend React Developer Intern',
    company: 'Figma',
    description: 'Help engineer collaborative design canvas features, design tokens, and web interfaces using modern React, TypeScript, and HTML/CSS.',
    skillsRequired: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Git'],
    location: 'Remote',
    applyLink: 'https://figma.com/careers/frontend-intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Backend API Engineering Intern',
    company: 'Twilio',
    description: 'Build reliable communications APIs and messaging microservices with Node.js, Express, MongoDB, and AWS cloud queues.',
    skillsRequired: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'AWS', 'Git'],
    location: 'Remote',
    applyLink: 'https://twilio.com/jobs/backend-intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Full Stack Web Engineering Intern',
    company: 'Notion',
    description: 'Develop rich document editing blocks and real-time collaboration workflows with React, Next.js, and Node.js.',
    skillsRequired: ['React', 'Next.js', 'JavaScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Git'],
    location: 'San Francisco, CA',
    applyLink: 'https://notion.so/careers/fullstack-intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Python Software Engineering Intern',
    company: 'Spotify',
    description: 'Work with audio metadata processing, playlist algorithms, and recommendations telemetry using Python, Algorithms, and Linux.',
    skillsRequired: ['Python', 'Data Structures', 'Algorithms', 'SQL', 'Linux', 'Git'],
    location: 'New York, NY',
    applyLink: 'https://spotify.com/jobs/python-intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Site Reliability & Cloud Intern',
    company: 'Cloudflare',
    description: 'Operate global edge network telemetry, configure Docker environments, and build automated CI/CD observability.',
    skillsRequired: ['Linux', 'Docker', 'CI/CD', 'Git', 'REST APIs', 'Node.js'],
    location: 'Remote',
    applyLink: 'https://cloudflare.com/careers/sre-intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'React Native & Mobile Web Intern',
    company: 'Discord',
    description: 'Craft responsive chat experiences, audio status overlays, and rich media components with React, Redux, and JavaScript.',
    skillsRequired: ['React', 'Redux', 'JavaScript', 'HTML', 'CSS', 'REST APIs', 'Git'],
    location: 'Remote',
    applyLink: 'https://discord.com/careers/mobile-web-intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Data Engineering Intern',
    company: 'Snowflake',
    description: 'Build automated data extraction and transformation pipelines with SQL, Python, and cloud object storage.',
    skillsRequired: ['SQL', 'PostgreSQL', 'Python', 'Data Structures', 'Linux', 'Git'],
    location: 'Remote',
    applyLink: 'https://snowflake.com/careers/data-intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Junior Platform Developer Intern',
    company: 'Supabase',
    description: 'Build open-source database tools and developer documentation with PostgreSQL, Node.js, Express, and React.',
    skillsRequired: ['PostgreSQL', 'SQL', 'Node.js', 'Express', 'React', 'Git'],
    location: 'Remote',
    applyLink: 'https://supabase.com/careers/intern',
    source: 'catalog',
    deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000)
  }
];
