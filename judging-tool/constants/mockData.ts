export type JudgeProfile = {
  id: string;
  name: string;
  title: string;
  organization: string;
  avatarColor: string;
};

export type RubricCriterion = {
  id: string;
  label: string;
  description: string;
  maxScore: number;
};

export type ReflectionQuestion = {
  id: string;
  prompt: string;
  helperText?: string;
};

export type TeamProfile = {
  id: string;
  name: string;
  alias: string;
  track: string;
  summary: string;
  avatarColor: string;
  highlight: string;
  tags: string[];
  lastUpdated: string;
  progress: number;
  mentors: string[];
  focusQuestion: string;
};

export type EventOverview = {
  id: string;
  name: string;
  theme: string;
  status: 'Upcoming' | 'Live' | 'Closed';
  dates: string;
  location: string;
  description: string;
  judges: JudgeProfile[];
  teams: TeamProfile[];
  rubric: RubricCriterion[];
  reflectionQuestions: ReflectionQuestion[];
  resources: Array<{ label: string; link: string }>;
};

export type LeaderboardRow = {
  teamId: string;
  teamName: string;
  averageScore: number;
  ranking: number;
  trend: 'up' | 'down' | 'steady';
  judgeBreakdown: Array<{ judgeId: string; judgeName: string; score: number }>;
  rubricBreakdown: Array<{ criterionId: string; criterion: string; score: number }>;
};

export type LeaderboardSnapshot = {
  eventId: string;
  updatedAt: string;
  rows: LeaderboardRow[];
  highlight: string;
};

export type AdminMetric = {
  label: string;
  value: string;
  delta?: string;
};

export type AdminEventSummary = {
  id: string;
  name: string;
  dates: string;
  status: 'Draft' | 'Open' | 'Judging' | 'Archived';
  teams: number;
  judges: number;
  deliverablesDue: string;
};

const judges: JudgeProfile[] = [
  {
    id: 'judge-maria',
    name: 'Dr. Maria Lopez',
    title: 'Faculty Lead, Mechanical Engineering',
    organization: 'Texas A&M Engineering',
    avatarColor: '#F97316',
  },
  {
    id: 'judge-aaron',
    name: 'Aaron Patel',
    title: 'Product Manager',
    organization: 'Chevron Technology Ventures',
    avatarColor: '#14B8A6',
  },
  {
    id: 'judge-sydney',
    name: 'Sydney Harper',
    title: 'Innovation Strategist',
    organization: 'Aggies Invent Alumni',
    avatarColor: '#6366F1',
  },
];

const sharedRubric: RubricCriterion[] = [
  {
    id: 'effective_communication',
    label: 'Effective communication',
    description: 'Problem clarity, quality of solution, and near- and long-term impact.',
    maxScore: 25,
  },
  {
    id: 'would_fund_buy',
    label: 'Would fund / buy solution',
    description: 'Technical feasibility, commercial viability, and innovation.',
    maxScore: 25,
  },
  {
    id: 'presentation',
    label: 'Presentation',
    description: 'Quality of video, prototype, and slides; organization and engagement.',
    maxScore: 25,
  },
  {
    id: 'overall',
    label: 'Overall',
    description: 'Overall pitch strength and Q&A performance.',
    maxScore: 25,
  },
];

const reflectionQuestions: ReflectionQuestion[] = [
  {
    id: 'communication_feedback',
    prompt: 'How effectively did the team communicate their problem, solution, and impact?',
    helperText: 'Comment on clarity, storytelling, or how compelling their message was.',
  },
  {
    id: 'funding_feedback',
    prompt: 'Would you fund or support this solution? Why or why not?',
    helperText: 'Consider technical feasibility, commercial potential, and innovation.',
  },
  {
    id: 'presentation_feedback',
    prompt: 'What stood out most about their presentation?',
    helperText: 'Mention video quality, prototype, slides, or audience engagement.',
  },
  {
    id: 'overall_feedback',
    prompt: 'What final feedback or encouragement would you give this team?',
    helperText: 'Share advice on next steps or areas to improve.',
  },
];


export const events: EventOverview[] = [
  {
    id: 'aggies-invent-smart-campuses',
    name: 'Aggies Invent',
    theme: 'Smart Campuses & Resilient Communities',
    status: 'Live',
    dates: 'Oct 4 – Oct 6, 2024',
    location: 'Zachry Engineering Education Complex',
    description:
      '36-hour design sprint focused on human-centered solutions to improve safety, sustainability, and accessibility across Texas A&M campuses.',
    judges,
    teams: [
      {
        id: 'team-atlas',
        name: 'Project Atlas',
        alias: 'ATLAS',
        track: 'Safety & Security',
        summary: 'Rapid indoor triage kit with augmented-reality guidance for first responders.',
        avatarColor: '#0EA5E9',
        highlight: 'Live demo scheduled during final showcase.',
        tags: ['Prototype Ready', 'Hardware', 'Emergency Response'],
        lastUpdated: 'Today • 3:45 PM',
        progress: 0.82,
        mentors: ['Major Chris Smith', 'Laura Chen'],
        focusQuestion: 'How might we help responders triage faster during campus incidents?',
      },
      {
        id: 'team-lumina',
        name: 'Lumina Grid',
        alias: 'LUMINA',
        track: 'Energy & Sustainability',
        summary: 'AI-driven lighting retrofit that cuts energy waste in legacy campus buildings.',
        avatarColor: '#F59E0B',
        highlight: 'Secured pilot with the Memorial Student Center.',
        tags: ['AI / ML', 'Energy', 'Pilot Ready'],
        lastUpdated: 'Today • 2:20 PM',
        progress: 0.74,
        mentors: ['Dr. Emily Rogers'],
        focusQuestion: 'How might we reduce energy waste without major infrastructure changes?',
      },
      {
        id: 'team-maroon',
        name: 'Maroon Loop',
        alias: 'LOOP',
        track: 'Mobility & Wayfinding',
        summary: 'Adaptive shuttle scheduling informed by real-time event traffic.',
        avatarColor: '#7C3AED',
        highlight: 'Validated with 142 student ride logs.',
        tags: ['Data Science', 'UX Research'],
        lastUpdated: 'Today • 1:05 PM',
        progress: 0.68,
        mentors: ['David Morales', 'Prof. Nina Gupta'],
        focusQuestion: 'How might we give students reliable late-night transit coverage?',
      },
    ],
    rubric: sharedRubric,
    reflectionQuestions,
    resources: [
      {
        label: 'Judging Brief',
        link: 'https://tx.ag/aggiesinvent/judging-brief',
      },
      {
        label: 'Event Schedule',
        link: 'https://tx.ag/aggiesinvent/schedule',
      },
    ],
  },
  {
    id: 'aggies-invent-veterans',
    name: 'Aggies Invent',
    theme: 'Supporting Veterans & First Responders',
    status: 'Upcoming',
    dates: 'Jan 24 – Jan 26, 2025',
    location: 'McFerrin Center for Entrepreneurship',
    description:
      'A focused weekend to co-create solutions that elevate health, wellness, and workforce readiness for veterans transitioning into civilian life.',
    judges,
    teams: [],
    rubric: sharedRubric,
    reflectionQuestions,
    resources: [
      {
        label: 'Sponsor Overview',
        link: 'https://tx.ag/aggiesinvent/veterans',
      },
    ],
  },
];

export const teamIndex = events.reduce<Record<string, { team: TeamProfile; eventId: string }>>(
  (acc, event) => {
    event.teams.forEach((team) => {
      acc[team.id] = {
        team,
        eventId: event.id,
      };
    });
    return acc;
  },
  {},
);

export const leaderboard: LeaderboardSnapshot = {
  eventId: 'aggies-invent-smart-campuses',
  updatedAt: 'Updated 12 minutes ago',
  highlight: 'Average team score climbed by 6% since morning stand-ups.',
  rows: [
    {
      teamId: 'team-atlas',
      teamName: 'Project Atlas',
      ranking: 1,
      averageScore: 91,
      trend: 'up',
      judgeBreakdown: [
        { judgeId: 'judge-maria', judgeName: 'Dr. Lopez', score: 92 },
        { judgeId: 'judge-aaron', judgeName: 'A. Patel', score: 89 },
        { judgeId: 'judge-sydney', judgeName: 'S. Harper', score: 93 },
      ],
      rubricBreakdown: [
        { criterionId: 'problem', criterion: 'Problem', score: 23 },
        { criterionId: 'innovation', criterion: 'Innovation', score: 24 },
        { criterionId: 'impact', criterion: 'Impact', score: 22 },
        { criterionId: 'presentation', criterion: 'Presentation', score: 22 },
      ],
    },
    {
      teamId: 'team-lumina',
      teamName: 'Lumina Grid',
      ranking: 2,
      averageScore: 86,
      trend: 'steady',
      judgeBreakdown: [
        { judgeId: 'judge-maria', judgeName: 'Dr. Lopez', score: 85 },
        { judgeId: 'judge-aaron', judgeName: 'A. Patel', score: 87 },
        { judgeId: 'judge-sydney', judgeName: 'S. Harper', score: 86 },
      ],
      rubricBreakdown: [
        { criterionId: 'problem', criterion: 'Problem', score: 21 },
        { criterionId: 'innovation', criterion: 'Innovation', score: 22 },
        { criterionId: 'impact', criterion: 'Impact', score: 22 },
        { criterionId: 'presentation', criterion: 'Presentation', score: 21 },
      ],
    },
    {
      teamId: 'team-maroon',
      teamName: 'Maroon Loop',
      ranking: 3,
      averageScore: 83,
      trend: 'up',
      judgeBreakdown: [
        { judgeId: 'judge-maria', judgeName: 'Dr. Lopez', score: 82 },
        { judgeId: 'judge-aaron', judgeName: 'A. Patel', score: 84 },
        { judgeId: 'judge-sydney', judgeName: 'S. Harper', score: 83 },
      ],
      rubricBreakdown: [
        { criterionId: 'problem', criterion: 'Problem', score: 20 },
        { criterionId: 'innovation', criterion: 'Innovation', score: 21 },
        { criterionId: 'impact', criterion: 'Impact', score: 21 },
        { criterionId: 'presentation', criterion: 'Presentation', score: 21 },
      ],
    },
  ],
};

export const adminMetrics: AdminMetric[] = [
  { label: 'Active Judges', value: '48', delta: '+6 new this month' },
  { label: 'Teams This Cycle', value: '112', delta: '+9% vs. 2023' },
  { label: 'Average Review Time', value: '13m', delta: '-3m faster' },
];

export const adminEvents: AdminEventSummary[] = [
  {
    id: 'evt-001',
    name: 'Aggies Invent: Smart Campuses',
    dates: 'Oct 4 – Oct 6, 2024',
    status: 'Judging',
    teams: 28,
    judges: 18,
    deliverablesDue: 'Final pitches • Oct 6, 4:00 PM',
  },
  {
    id: 'evt-002',
    name: 'Aggies Invent: Veterans',
    dates: 'Jan 24 – Jan 26, 2025',
    status: 'Open',
    teams: 9,
    judges: 5,
    deliverablesDue: 'Sponsor rubric review • Jan 15',
  },
  {
    id: 'evt-003',
    name: 'Aggies Invent: Inclusive Mobility',
    dates: 'Apr 11 – Apr 13, 2025',
    status: 'Draft',
    teams: 0,
    judges: 2,
    deliverablesDue: 'Finalize challenge tracks • Feb 28',
  },
];

export function getEventById(eventId: string) {
  return events.find((event) => event.id === eventId);
}

export function getTeamWithEvent(teamId: string) {
  return teamIndex[teamId];
}
