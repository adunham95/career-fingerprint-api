import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const goalSkills = [
  {
    id: 'public_speaking',
    name: 'Public Speaking',
    category: 'communication',
    description:
      'Build confidence speaking in front of others and presenting ideas clearly.',
    keywords: ['presentation', 'public speaking', 'speech', 'communication'],
    actions: ['presented', 'explained', 'reported', 'spoke'],
  },
  {
    id: 'leadership',
    name: 'Leadership',
    category: 'leadership',
    description:
      'Grow your ability to lead projects, guide others, and take initiative.',
    keywords: ['leadership', 'team', 'ownership', 'initiative'],
    actions: ['led', 'organized', 'coordinated', 'initiated'],
  },
  {
    id: 'problem_solving',
    name: 'Problem Solving',
    category: 'problem_solving',
    description:
      'Break down problems, troubleshoot issues, and find solutions.',
    keywords: ['problem solving', 'troubleshoot', 'analysis', 'root cause'],
    actions: ['debugged', 'resolved', 'investigated', 'fixed'],
  },
  {
    id: 'organization',
    name: 'Organization',
    category: 'productivity',
    description: 'Improve how you plan, prioritize, and keep work organized.',
    keywords: ['planning', 'organization', 'prioritization', 'documentation'],
    actions: ['planned', 'organized', 'documented', 'prioritized'],
  },
  {
    id: 'teamwork',
    name: 'Teamwork',
    category: 'collaboration',
    description:
      'Strengthen your collaboration and ability to work well with others.',
    keywords: ['collaboration', 'teamwork', 'support', 'paired'],
    actions: ['collaborated', 'supported', 'reviewed', 'paired'],
  },
  {
    id: 'creativity',
    name: 'Creativity',
    category: 'creativity',
    description:
      'Generate ideas, think creatively, and explore new approaches.',
    keywords: ['creativity', 'innovation', 'ideas', 'brainstorming'],
    actions: ['designed', 'conceptualized', 'created', 'brainstormed'],
  },
  {
    id: 'project_management',
    name: 'Project Management',
    category: 'project_management',
    description: 'Plan projects, track progress, and keep work moving forward.',
    keywords: ['project', 'timeline', 'milestone', 'requirements'],
    actions: ['planned', 'tracked', 'coordinated', 'delivered'],
  },
  {
    id: 'customer_focus',
    name: 'Customer Focus',
    category: 'customer',
    description:
      'Support customers and communicate clearly to meet their needs.',
    keywords: ['customer', 'client', 'feedback', 'support'],
    actions: ['supported', 'guided', 'assisted', 'advised'],
  },
  {
    id: 'learning',
    name: 'Learning',
    category: 'growth',
    description: 'Stay intentional about building new skills and improving.',
    keywords: ['learning', 'skills', 'training', 'improvement'],
    actions: ['studied', 'practiced', 'researched', 'learned'],
  },
  {
    id: 'writing',
    name: 'Writing',
    category: 'documentation',
    description:
      'Improve clarity in writing, documentation, and communication.',
    keywords: ['writing', 'documentation', 'clarity', 'instructions'],
    actions: ['wrote', 'documented', 'outlined', 'summarized'],
  },

  /* === NEW SHORT-TITLE SKILLS === */

  {
    id: 'data_analysis',
    name: 'Data Analysis',
    category: 'analysis',
    description: 'Interpret data, find insights, and support decisions.',
    keywords: ['data', 'analysis', 'metrics', 'research'],
    actions: ['analyzed', 'evaluated', 'modeled', 'interpreted'],
  },
  {
    id: 'critical_thinking',
    name: 'Critical Think',
    category: 'analysis',
    description:
      'Evaluate information, challenge assumptions, and think logically.',
    keywords: ['critical thinking', 'logic', 'evaluation'],
    actions: ['evaluated', 'reasoned', 'questioned', 'analyzed'],
  },
  {
    id: 'time_management',
    name: 'Time Manage',
    category: 'productivity',
    description: 'Manage time, deadlines, and priorities effectively.',
    keywords: ['time', 'deadlines', 'efficiency'],
    actions: ['scheduled', 'planned', 'optimized', 'prioritized'],
  },
  {
    id: 'detail_focus',
    name: 'Detail Focus',
    category: 'quality',
    description: 'Improve accuracy and reduce errors with attention to detail.',
    keywords: ['accuracy', 'detail', 'quality'],
    actions: ['checked', 'verified', 'reviewed', 'refined'],
  },
  {
    id: 'technical',
    name: 'Technical',
    category: 'technical',
    description:
      'Strengthen your ability to work with tools, systems, or software.',
    keywords: ['technical', 'systems', 'tools'],
    actions: ['configured', 'built', 'updated', 'implemented'],
  },
  {
    id: 'adaptability',
    name: 'Adaptability',
    category: 'mindset',
    description: 'Adjust to change, learn new processes, and stay flexible.',
    keywords: ['adaptability', 'resilience', 'change'],
    actions: ['adapted', 'adjusted', 'responded', 'improvised'],
  },
  {
    id: 'stakeholders',
    name: 'Stakeholders',
    category: 'communication',
    description: 'Communicate with and manage expectations across groups.',
    keywords: ['stakeholder', 'alignment'],
    actions: ['aligned', 'communicated', 'coordinated', 'informed'],
  },
  {
    id: 'conflict',
    name: 'Conflict',
    category: 'communication',
    description: 'Resolve disagreements and help teams find common ground.',
    keywords: ['conflict', 'resolution', 'negotiation'],
    actions: ['resolved', 'mediated', 'negotiated', 'facilitated'],
  },
  {
    id: 'empathy',
    name: 'Empathy',
    category: 'mindset',
    description: 'Improve awareness, listening, and understanding of others.',
    keywords: ['empathy', 'awareness'],
    actions: ['supported', 'listened', 'recognized', 'understood'],
  },
  {
    id: 'decision',
    name: 'Decision',
    category: 'leadership',
    description: 'Evaluate options and make confident, informed decisions.',
    keywords: ['decision', 'strategy'],
    actions: ['decided', 'evaluated', 'selected', 'recommended'],
  },
  {
    id: 'mentoring',
    name: 'Mentoring',
    category: 'leadership',
    description: 'Support others through guidance, feedback, and coaching.',
    keywords: ['mentor', 'coaching'],
    actions: ['coached', 'mentored', 'guided', 'supported'],
  },
  {
    id: 'research',
    name: 'Research',
    category: 'analysis',
    description: 'Gather information, analyze findings, and create insights.',
    keywords: ['research', 'investigation'],
    actions: ['investigated', 'gathered', 'explored', 'verified'],
  },
  {
    id: 'strategy',
    name: 'Strategy',
    category: 'leadership',
    description: 'Think long-term, set direction, and create plans.',
    keywords: ['strategy', 'planning'],
    actions: ['strategized', 'planned', 'anticipated', 'framed'],
  },
  {
    id: 'process',
    name: 'Process',
    category: 'operations',
    description:
      'Improve workflows, reduce inefficiencies, and streamline work.',
    keywords: ['process', 'workflow'],
    actions: ['optimized', 'streamlined', 'refined', 'improved'],
  },
  {
    id: 'communication',
    name: 'Communication',
    category: 'communication',
    description: 'Communicate clearly in written and verbal formats.',
    keywords: ['communication', 'clarity'],
    actions: ['shared', 'explained', 'clarified', 'communicated'],
  },
  {
    id: 'initiative',
    name: 'Initiative',
    category: 'mindset',
    description: 'Act early, solve problems, and take ownership.',
    keywords: ['initiative', 'proactive'],
    actions: ['initiated', 'proposed', 'took action', 'identified'],
  },
  {
    id: 'quality',
    name: 'Quality',
    category: 'quality',
    description:
      'Improve your approach to testing and ensuring work meets standards.',
    keywords: ['quality', 'testing'],
    actions: ['tested', 'validated', 'reviewed', 'checked'],
  },
  {
    id: 'risk',
    name: 'Risk',
    category: 'operations',
    description: 'Identify risks, mitigate issues, and plan for uncertainty.',
    keywords: ['risk', 'mitigation'],
    actions: ['identified', 'mitigated', 'planned', 'assessed'],
  },
  {
    id: 'relationships',
    name: 'Relations',
    category: 'collaboration',
    description: 'Build trust and nurture strong relationships with others.',
    keywords: ['relationships', 'trust'],
    actions: ['connected', 'supported', 'engaged', 'built'],
  },
  {
    id: 'presenting',
    name: 'Presenting',
    category: 'communication',
    description: 'Deliver clear, engaging presentations to others.',
    keywords: ['presentation', 'delivery'],
    actions: ['presented', 'prepared', 'delivered', 'explained'],
  },
];
async function main() {
  console.log('Seeding skills…');

  for (const skill of goalSkills) {
    await prisma.goalSkill.upsert({
      where: { id: skill.id }, // must have unique constraint on "key"
      update: {
        id: skill.id,
        name: skill.name,
        description: skill.description,
        keywords: skill.keywords,
        actions: skill.actions,
        category: skill.category,
      },
      create: skill,
    });
  }

  console.log('✅ Plans loaded / updated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
