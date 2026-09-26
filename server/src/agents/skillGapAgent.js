const skillPlanTemplates = {
  // Cybersecurity & VAPT Track
  VAPT: {
    suggestedAction: 'Practice Web Security Academy labs on PortSwigger covering OWASP Top 10 vulnerabilities, access control, and reconnaissance.',
    miniProject: 'Conduct an authorized vulnerability assessment against a test staging app and produce an executive remediation report.'
  },
  'Web Security': {
    suggestedAction: 'Study browser security models (SOP, CORS, CSP), secure header implementation, and defensive coding against injection attacks.',
    miniProject: 'Build a secure Node.js authentication service implementing helmet headers, rate limiting, and strict input sanitization.'
  },
  'Burp Suite': {
    suggestedAction: 'Master Burp Suite Community/Pro features: Proxy, Repeater, Intruder, Decoder, and Match & Replace rules for traffic interception.',
    miniProject: 'Create an automated Burp extension or script that flags insecure HTTP headers and missing CSRF tokens in HTTP responses.'
  },
  'OWASP Top 10': {
    suggestedAction: 'Deep-dive into OWASP Top 10 categories with a focus on Broken Access Control, Cryptographic Failures, and Injection.',
    miniProject: 'Create a security test harness demonstrating before-and-after fixes for each of the top 3 OWASP vulnerabilities.'
  },
  'Penetration Testing': {
    suggestedAction: 'Learn structured pentesting methodology: Reconnaissance, Scanning, Exploitation, Post-Exploitation, and Professional Reporting.',
    miniProject: 'Complete 5 TryHackMe or HackTheBox web penetration testing challenges and write thorough technical writeups.'
  },
  'SQL Injection': {
    suggestedAction: 'Analyze Union-based, Error-based, and Blind SQL injection vectors, and implement parameterized queries across relational databases.',
    miniProject: 'Build a deliberately vulnerable laboratory app alongside unit tests demonstrating that prepared statements prevent all payload variations.'
  },
  XSS: {
    suggestedAction: 'Study Reflected, Stored, and DOM-based Cross-Site Scripting; master HTML/JS context-aware encoding and strict Content Security Policy.',
    miniProject: 'Implement a zero-trust rich text preview component with DOMPurify and strict CSP nonces.'
  },
  CSRF: {
    suggestedAction: 'Understand cross-origin state-changing request attacks and implement SameSite cookie policies alongside anti-CSRF token validation.',
    miniProject: 'Build an Express middleware verifying custom anti-CSRF double-submit tokens and SameSite=Strict cookies.'
  },
  'API Security': {
    suggestedAction: 'Learn OWASP API Security Top 10: Broken Object Level Authorization (BOLA), Broken Function Level Authorization (BFLA), and unthrottled endpoints.',
    miniProject: 'Implement role-based access control (RBAC) and object ownership validation middleware on a multi-tenant REST API.'
  },
  'Network Security': {
    suggestedAction: 'Study TLS/SSL handshake analysis, Wireshark packet capture inspection, and firewall security group configuration.',
    miniProject: 'Configure a hardened reverse proxy with Nginx enforcing TLS 1.3, HSTS, and cipher suite restrictions.'
  },
  // Full Stack & Cloud Fundamentals
  Docker: {
    suggestedAction: 'Containerize a Node.js and Express API with a multi-stage Dockerfile and Docker Compose.',
    miniProject: 'Build a containerized REST service with isolated local database services.'
  },
  AWS: {
    suggestedAction: 'Deploy a serverless Express backend on AWS Lambda and host static assets on S3 with CloudFront.',
    miniProject: 'Deploy an automated cloud file upload and thumbnail processing service.'
  },
  'Tailwind CSS': {
    suggestedAction: 'Convert standard CSS components into responsive, accessible Tailwind utility classes.',
    miniProject: 'Recreate a high-fidelity SaaS analytics dashboard with dark mode and interactive components.'
  },
  PostgreSQL: {
    suggestedAction: 'Learn relational schema design, indexing, foreign keys, and write raw SQL analytical queries.',
    miniProject: 'Build an inventory management database schema with transactions and complex joins.'
  },
  TypeScript: {
    suggestedAction: 'Refactor a JavaScript utility library with strict TypeScript interfaces, generics, and union types.',
    miniProject: 'Implement a type-safe API client wrapper with runtime Zod validation.'
  },
  MongoDB: {
    suggestedAction: 'Model document relationships, compound indexes, and aggregation pipelines in Mongoose.',
    miniProject: 'Build a high-throughput social post feed with paginated comments and like counters.'
  },
  'REST APIs': {
    suggestedAction: 'Study RFC standards for HTTP verbs, status codes, query filtering, and structured error payloads.',
    miniProject: 'Develop a rate-limited RESTful service with JWT Bearer authentication.'
  },
  'Next.js': {
    suggestedAction: 'Explore Next.js App Router, Server Components, Server Actions, and incremental static regeneration.',
    miniProject: 'Build a lightweight SEO-optimized documentation site with dynamic MDX pages.'
  },
  'CI/CD': {
    suggestedAction: 'Write a GitHub Actions workflow to run linting, unit tests, and automated build verification on pull requests.',
    miniProject: 'Set up an automated continuous integration pipeline for a full-stack mono-repo.'
  },
  Redux: {
    suggestedAction: 'Master Redux Toolkit (RTK) slices, dispatch thunks, and centralized state normalization.',
    miniProject: 'Build a complex multi-step e-commerce shopping cart and checkout state manager.'
  }
};

export function buildSkillGapReport(match) {
  if (!match || !Array.isArray(match.missingSkills)) {
    return [];
  }

  const missing = match.missingSkills;
  if (missing.length === 0) {
    return [];
  }

  return missing.map((skill, index) => {
    let priority = 'LOW';
    if (index === 0) priority = 'HIGH';
    else if (index < 3) priority = 'MEDIUM';

    const template = skillPlanTemplates[skill] || {
      suggestedAction: `Complete fundamental tutorials and build practical code exercises focusing on ${skill}.`,
      miniProject: `Create a small, targeted GitHub demonstration project utilizing ${skill} in a real-world scenario.`
    };

    return {
      skill,
      priority,
      suggestedAction: template.suggestedAction,
      miniProject: template.miniProject
    };
  });
}
