const skillPlanTemplates = {
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
