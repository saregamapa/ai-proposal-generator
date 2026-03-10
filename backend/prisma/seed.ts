import { PrismaClient, TemplateCategory } from '@prisma/client';

const prisma = new PrismaClient();

const systemTemplates = [
  {
    title: 'Marketing Agency Proposal',
    description: 'Full-service marketing proposal covering strategy, content, social, and paid ads.',
    category: TemplateCategory.MARKETING,
    isSystem: true,
    isPublic: true,
    content: {
      sections: ['executiveSummary', 'clientProblem', 'proposedSolution', 'scopeOfWork', 'deliverables', 'timeline', 'pricingTable', 'terms', 'nextSteps'],
      defaultServices: ['Brand Strategy', 'Content Marketing', 'Social Media Management', 'Paid Advertising', 'Analytics & Reporting'],
    },
  },
  {
    title: 'SEO Services Proposal',
    description: 'Comprehensive SEO proposal covering technical audit, content, and link building.',
    category: TemplateCategory.SEO,
    isSystem: true,
    isPublic: true,
    content: {
      sections: ['executiveSummary', 'clientProblem', 'proposedSolution', 'scopeOfWork', 'deliverables', 'timeline', 'pricingTable', 'terms', 'nextSteps'],
      defaultServices: ['Technical SEO Audit', 'On-Page Optimization', 'Content Strategy', 'Link Building', 'Monthly Reporting'],
    },
  },
  {
    title: 'Web Development Proposal',
    description: 'Professional web development proposal for custom websites and web applications.',
    category: TemplateCategory.WEB_DEVELOPMENT,
    isSystem: true,
    isPublic: true,
    content: {
      sections: ['executiveSummary', 'clientProblem', 'proposedSolution', 'scopeOfWork', 'deliverables', 'timeline', 'pricingTable', 'terms', 'nextSteps'],
      defaultServices: ['Discovery & Planning', 'UI/UX Design', 'Frontend Development', 'Backend Development', 'Testing & QA', 'Deployment'],
    },
  },
  {
    title: 'Business Consulting Proposal',
    description: 'Strategic consulting proposal for business transformation and growth.',
    category: TemplateCategory.CONSULTING,
    isSystem: true,
    isPublic: true,
    content: {
      sections: ['executiveSummary', 'clientProblem', 'proposedSolution', 'scopeOfWork', 'deliverables', 'timeline', 'pricingTable', 'terms', 'nextSteps'],
      defaultServices: ['Business Assessment', 'Strategy Development', 'Implementation Planning', 'Executive Coaching', 'Progress Reviews'],
    },
  },
  {
    title: 'AI Automation Proposal',
    description: 'AI automation and workflow optimization proposal for modern businesses.',
    category: TemplateCategory.AI_AUTOMATION,
    isSystem: true,
    isPublic: true,
    content: {
      sections: ['executiveSummary', 'clientProblem', 'proposedSolution', 'scopeOfWork', 'deliverables', 'timeline', 'pricingTable', 'terms', 'nextSteps'],
      defaultServices: ['Process Audit', 'AI Strategy', 'Workflow Automation', 'AI Integration', 'Training & Support'],
    },
  },
];

async function main() {
  console.log('Seeding database...');

  for (const template of systemTemplates) {
    await prisma.proposalTemplate.upsert({
      where: { id: `system_${template.category.toLowerCase()}` },
      update: template,
      create: { id: `system_${template.category.toLowerCase()}`, ...template },
    });
  }

  console.log(`✅ Seeded ${systemTemplates.length} system templates`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
