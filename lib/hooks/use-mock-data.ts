'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import {
  Task,
  UserStory,
  Epic,
  Sprint,
  TeamMember,
  Dependency,
  Project,
} from '@/lib/api/types';

/**
 * Mock data based on example_project_scrum_aligned.ttl
 * This represents the Alpha Platform Development project
 */

// Team Members (ex:U1-U5)
const mockTeamMembers: TeamMember[] = [
  {
    id: 'U1',
    name: 'Alice Chen',
    email: 'alice.chen@example.org',
    role: 'product-owner',
    projectIds: ['ProjectAlpha'],
  },
  {
    id: 'U2',
    name: 'Ben Singh',
    email: 'ben.singh@example.org',
    role: 'scrum-master',
    projectIds: ['ProjectAlpha'],
  },
  {
    id: 'U3',
    name: 'Cara Lopez',
    email: 'cara.lopez@example.org',
    role: 'developer',
    projectIds: ['ProjectAlpha'],
  },
  {
    id: 'U4',
    name: 'Diego Patel',
    email: 'diego.patel@example.org',
    role: 'developer',
    projectIds: ['ProjectAlpha'],
  },
  {
    id: 'U5',
    name: 'Evan Wu',
    email: 'evan.wu@example.org',
    role: 'qa-engineer',
    projectIds: ['ProjectAlpha'],
  },
];

// Sprints
const mockSprints: Sprint[] = [
  {
    id: 'Sprint1',
    name: 'Sprint 1 - User Onboarding',
    sprintNumber: 1,
    goal: 'Complete core user onboarding flow with signup and profile creation',
    startDate: '2025-11-03',
    endDate: '2025-11-17',
    actualStart: '2025-11-03',
    duration: 'P14D',
    projectId: 'ProjectAlpha',
    createdAt: '2025-11-03T00:00:00Z',
    updatedAt: '2025-11-03T00:00:00Z',
  },
  {
    id: 'Sprint2',
    name: 'Sprint 2 - Reporting Dashboard',
    sprintNumber: 2,
    goal: 'Deliver functional reporting dashboard with data ingestion and visualization',
    startDate: '2025-11-18',
    endDate: '2025-12-01',
    duration: 'P14D',
    projectId: 'ProjectAlpha',
    createdAt: '2025-11-18T00:00:00Z',
    updatedAt: '2025-11-18T00:00:00Z',
  },
  {
    id: 'Sprint3',
    name: 'Sprint 3 - Payments Integration',
    sprintNumber: 3,
    goal: 'Implement secure payment processing with provider integration',
    startDate: '2025-12-02',
    endDate: '2025-12-15',
    duration: 'P14D',
    projectId: 'ProjectAlpha',
    createdAt: '2025-12-02T00:00:00Z',
    updatedAt: '2025-12-02T00:00:00Z',
  },
];

// Epics (ex:E1-E3)
const mockEpics: Epic[] = [
  {
    id: 'E1',
    title: 'User Onboarding',
    description: 'Complete user registration and onboarding experience',
    priority: 1,
    businessValue: 85,
    startDate: '2025-11-03',
    endDate: '2025-11-24',
    assignee: 'U1',
    createdAt: '2025-11-03T00:00:00Z',
    updatedAt: '2025-11-03T00:00:00Z',
  },
  {
    id: 'E2',
    title: 'Reporting Dashboard',
    description: 'Analytics and reporting capabilities for business insights',
    priority: 2,
    businessValue: 75,
    startDate: '2025-11-03',
    endDate: '2025-12-01',
    assignee: 'U1',
    createdAt: '2025-11-03T00:00:00Z',
    updatedAt: '2025-11-03T00:00:00Z',
  },
  {
    id: 'E3',
    title: 'Payments Integration',
    description: 'Secure payment processing with third-party provider',
    priority: 3,
    businessValue: 90,
    startDate: '2025-11-03',
    endDate: '2025-12-08',
    assignee: 'U1',
    createdAt: '2025-11-03T00:00:00Z',
    updatedAt: '2025-11-03T00:00:00Z',
  },
];

// User Stories (ex:S1-S9)
const mockStories: UserStory[] = [
  // Sprint 1 Stories
  {
    id: 'S1',
    title: 'Signup with Email',
    storyText: 'As a new user, I want to sign up with my email address so that I can create an account',
    acceptanceCriteria: [
      'Email validation is performed',
      'Duplicate email detection works',
      'Confirmation email is sent',
    ],
    storyPoints: 5,
    priority: 1,
    state: 'done',
    startDate: '2025-11-03',
    endDate: '2025-11-10',
    actualStart: '2025-11-03',
    actualEnd: '2025-11-09',
    assignee: 'U2',
    parentEpicId: 'E1',
    sprintId: 'Sprint1',
    createdAt: '2025-11-03T00:00:00Z',
    updatedAt: '2025-11-09T00:00:00Z',
  },
  {
    id: 'S2',
    title: 'Profile Creation',
    storyText: 'As a registered user, I want to create my profile with personal information so that I can personalize my account',
    acceptanceCriteria: [
      'Profile form has required fields',
      'Data is persisted to database',
      'Profile can be edited later',
    ],
    storyPoints: 8,
    priority: 2,
    state: 'done',
    startDate: '2025-11-08',
    endDate: '2025-11-15',
    actualStart: '2025-11-08',
    actualEnd: '2025-11-15',
    assignee: 'U2',
    parentEpicId: 'E1',
    sprintId: 'Sprint1',
    createdAt: '2025-11-08T00:00:00Z',
    updatedAt: '2025-11-15T00:00:00Z',
  },
  {
    id: 'S3',
    title: 'Welcome Tour',
    storyText: 'As a first-time user, I want to see a guided tour of key features so that I can learn how to use the platform',
    acceptanceCriteria: [
      'Tour shows 5 key screens',
      'User can skip or dismiss tour',
      "Tour doesn't repeat after completion",
    ],
    storyPoints: 3,
    priority: 3,
    state: 'in-progress',
    startDate: '2025-11-10',
    endDate: '2025-11-17',
    actualStart: '2025-11-10',
    assignee: 'U2',
    parentEpicId: 'E1',
    sprintId: 'Sprint1',
    createdAt: '2025-11-10T00:00:00Z',
    updatedAt: '2025-11-17T00:00:00Z',
  },
  // Sprint 2 Stories
  {
    id: 'S4',
    title: 'Metrics Ingestion',
    storyText: 'As a system administrator, I want automated data ingestion from external sources so that reports are always current',
    acceptanceCriteria: [
      'ETL pipeline runs on schedule',
      'Error handling logs failures',
      'Data validation prevents corrupt imports',
    ],
    storyPoints: 13,
    priority: 1,
    state: 'done',
    startDate: '2025-11-03',
    endDate: '2025-11-13',
    actualStart: '2025-11-03',
    actualEnd: '2025-11-13',
    assignee: 'U2',
    parentEpicId: 'E2',
    sprintId: 'Sprint2',
    createdAt: '2025-11-03T00:00:00Z',
    updatedAt: '2025-11-13T00:00:00Z',
  },
  {
    id: 'S5',
    title: 'Chart Components',
    storyText: 'As a business user, I want interactive charts so that I can visualize trends and patterns',
    acceptanceCriteria: [
      'Line and bar charts are available',
      'Charts are responsive',
      'Charts support theming',
    ],
    storyPoints: 8,
    priority: 2,
    state: 'done',
    startDate: '2025-11-08',
    endDate: '2025-11-18',
    actualStart: '2025-11-08',
    actualEnd: '2025-11-18',
    assignee: 'U2',
    parentEpicId: 'E2',
    sprintId: 'Sprint2',
    createdAt: '2025-11-08T00:00:00Z',
    updatedAt: '2025-11-18T00:00:00Z',
  },
  {
    id: 'S6',
    title: 'Export to CSV',
    storyText: 'As a business analyst, I want to export data to CSV so that I can perform offline analysis',
    acceptanceCriteria: [
      'Export button is accessible',
      'CSV format is correct',
      'Large datasets are handled efficiently',
    ],
    storyPoints: 5,
    priority: 3,
    state: 'to-do',
    startDate: '2025-11-15',
    endDate: '2025-11-21',
    assignee: 'U2',
    parentEpicId: 'E2',
    sprintId: 'Sprint2',
    createdAt: '2025-11-15T00:00:00Z',
    updatedAt: '2025-11-15T00:00:00Z',
  },
  // Sprint 3 Stories
  {
    id: 'S7',
    title: 'Payment Provider Selection',
    storyText: 'As a product owner, I want to evaluate payment providers so that we can select the best option',
    acceptanceCriteria: [
      '3 providers are reviewed',
      'Security assessment is completed',
      'Final recommendation is documented',
    ],
    storyPoints: 5,
    priority: 1,
    state: 'done',
    startDate: '2025-11-03',
    endDate: '2025-11-10',
    actualStart: '2025-11-03',
    actualEnd: '2025-11-10',
    assignee: 'U2',
    parentEpicId: 'E3',
    sprintId: 'Sprint3',
    createdAt: '2025-11-03T00:00:00Z',
    updatedAt: '2025-11-10T00:00:00Z',
  },
  {
    id: 'S8',
    title: 'Checkout Flow',
    storyText: 'As a customer, I want a seamless checkout experience so that I can complete purchases easily',
    acceptanceCriteria: [
      'Payment UI is intuitive',
      '3D Secure authentication works',
      'Payment confirmation is displayed',
    ],
    storyPoints: 13,
    priority: 2,
    state: 'in-progress',
    startDate: '2025-11-10',
    endDate: '2025-11-23',
    actualStart: '2025-11-10',
    assignee: 'U2',
    parentEpicId: 'E3',
    sprintId: 'Sprint3',
    createdAt: '2025-11-10T00:00:00Z',
    updatedAt: '2025-11-23T00:00:00Z',
  },
  {
    id: 'S9',
    title: 'Refunds and Webhooks',
    storyText: 'As a customer service agent, I want to process refunds so that we can handle returns',
    acceptanceCriteria: [
      'Refund API is functional',
      'Webhook handlers are reliable',
      'Events are logged properly',
    ],
    storyPoints: 8,
    priority: 3,
    state: 'to-do',
    startDate: '2025-11-21',
    endDate: '2025-12-08',
    assignee: 'U2',
    parentEpicId: 'E3',
    sprintId: 'Sprint3',
    createdAt: '2025-11-21T00:00:00Z',
    updatedAt: '2025-12-08T00:00:00Z',
  },
];

// Tasks (ex:T1-T23) - Abbreviated sample
const mockTasks: Task[] = [
  // S1 Tasks
  {
    id: 'T1',
    title: 'Design signup API',
    description: 'Create API specification for user registration endpoint',
    status: 'completed',
    assignee: 'U3',
    startDate: '2025-11-03',
    endDate: '2025-11-06',
    actualStart: '2025-11-03',
    actualEnd: '2025-11-06',
    estimatedEffort: 'P3D',
    actualEffort: 'P3D',
    parentId: 'S1',
    createdAt: '2025-11-03T00:00:00Z',
    updatedAt: '2025-11-06T00:00:00Z',
  },
  {
    id: 'T2',
    title: 'Implement signup API',
    description: 'Build backend registration logic with email validation',
    status: 'completed',
    assignee: 'U3',
    startDate: '2025-11-06',
    endDate: '2025-11-10',
    actualStart: '2025-11-06',
    actualEnd: '2025-11-09',
    estimatedEffort: 'P4D',
    actualEffort: 'P3D',
    parentId: 'S1',
    dependencies: ['T1'],
    createdAt: '2025-11-06T00:00:00Z',
    updatedAt: '2025-11-09T00:00:00Z',
  },
  {
    id: 'T3',
    title: 'QA signup API',
    description: 'Test registration flow and edge cases',
    status: 'completed',
    assignee: 'U5',
    startDate: '2025-11-10',
    endDate: '2025-11-12',
    actualStart: '2025-11-09',
    actualEnd: '2025-11-10',
    estimatedEffort: 'P2D',
    actualEffort: 'P1D',
    parentId: 'S1',
    dependencies: ['T2'],
    createdAt: '2025-11-10T00:00:00Z',
    updatedAt: '2025-11-10T00:00:00Z',
  },
  // S2 Tasks
  {
    id: 'T4',
    title: 'Profile DB schema',
    description: 'Design and implement user profile database schema',
    status: 'completed',
    assignee: 'U3',
    startDate: '2025-11-07',
    endDate: '2025-11-11',
    actualStart: '2025-11-08',
    actualEnd: '2025-11-11',
    estimatedEffort: 'P4D',
    parentId: 'S2',
    createdAt: '2025-11-07T00:00:00Z',
    updatedAt: '2025-11-11T00:00:00Z',
  },
  {
    id: 'T5',
    title: 'Profile UI',
    description: 'Build profile creation and editing interface',
    status: 'completed',
    assignee: 'U4',
    startDate: '2025-11-09',
    endDate: '2025-11-14',
    actualStart: '2025-11-09',
    actualEnd: '2025-11-14',
    estimatedEffort: 'P5D',
    parentId: 'S2',
    dependencies: ['T4'],
    createdAt: '2025-11-09T00:00:00Z',
    updatedAt: '2025-11-14T00:00:00Z',
  },
  {
    id: 'T6',
    title: 'Profile end-to-end test',
    description: 'Create comprehensive E2E tests for profile flow',
    status: 'completed',
    assignee: 'U5',
    startDate: '2025-11-14',
    endDate: '2025-11-15',
    actualStart: '2025-11-14',
    actualEnd: '2025-11-15',
    estimatedEffort: 'P1D',
    parentId: 'S2',
    dependencies: ['T5'],
    createdAt: '2025-11-14T00:00:00Z',
    updatedAt: '2025-11-15T00:00:00Z',
  },
  // S3 Tasks
  {
    id: 'T7',
    title: 'Build tour steps',
    description: 'Create interactive tour component with step definitions',
    status: 'in-progress',
    assignee: 'U4',
    startDate: '2025-11-10',
    endDate: '2025-11-14',
    actualStart: '2025-11-10',
    estimatedEffort: 'P4D',
    parentId: 'S3',
    dependencies: ['T2'],
    createdAt: '2025-11-10T00:00:00Z',
    updatedAt: '2025-11-14T00:00:00Z',
  },
  {
    id: 'T8',
    title: 'Integrate tour trigger',
    description: 'Add logic to show tour on first login',
    status: 'not-started',
    assignee: 'U4',
    startDate: '2025-11-12',
    endDate: '2025-11-17',
    estimatedEffort: 'P5D',
    parentId: 'S3',
    dependencies: ['T7'],
    createdAt: '2025-11-12T00:00:00Z',
    updatedAt: '2025-11-12T00:00:00Z',
  },
  // S8 Tasks
  {
    id: 'T18',
    title: 'Checkout UI',
    description: 'Build checkout interface with payment form',
    status: 'in-progress',
    assignee: 'U4',
    startDate: '2025-11-10',
    endDate: '2025-11-17',
    actualStart: '2025-11-10',
    estimatedEffort: 'P7D',
    parentId: 'S8',
    createdAt: '2025-11-10T00:00:00Z',
    updatedAt: '2025-11-17T00:00:00Z',
  },
  {
    id: 'T19',
    title: 'Payment intents backend',
    description: 'Implement payment processing backend logic',
    status: 'not-started',
    assignee: 'U3',
    startDate: '2025-11-12',
    endDate: '2025-11-20',
    estimatedEffort: 'P8D',
    parentId: 'S8',
    dependencies: ['T18'],
    createdAt: '2025-11-12T00:00:00Z',
    updatedAt: '2025-11-12T00:00:00Z',
  },
];

// Dependencies
const mockDependencies: Dependency[] = [
  {
    id: 'dep_S1_S2',
    predecessorId: 'S1',
    successorId: 'S2',
    linkType: 'finish-to-start',
    lagDuration: 'P0D',
  },
  {
    id: 'dep_S2_S3',
    predecessorId: 'S2',
    successorId: 'S3',
    linkType: 'start-to-start',
    lagDuration: 'P0D',
  },
  {
    id: 'dep_S4_S5',
    predecessorId: 'S4',
    successorId: 'S5',
    linkType: 'start-to-start',
    lagDuration: 'P0D',
  },
  {
    id: 'dep_T1_T2',
    predecessorId: 'T1',
    successorId: 'T2',
    linkType: 'finish-to-start',
    lagDuration: 'P0D',
  },
  {
    id: 'dep_T2_T3',
    predecessorId: 'T2',
    successorId: 'T3',
    linkType: 'finish-to-finish',
    lagDuration: 'P0D',
  },
];

// Project
const mockProject: Project = {
  id: 'ProjectAlpha',
  name: 'Alpha Platform Development',
  description: 'Scrum project for developing the Alpha customer platform',
  startDate: '2025-11-03',
  endDate: '2025-12-15',
  actualStart: '2025-11-03',
  createdAt: '2025-11-01T00:00:00Z',
  updatedAt: '2025-11-18T00:00:00Z',
};

/**
 * Hook to initialize mock data
 * Later, replace this with API data fetching
 */
export function useMockData() {
  const setCurrentProject = useAppStore((state) => state.setCurrentProject);
  const setEpics = useAppStore((state) => state.setEpics);
  const setStories = useAppStore((state) => state.setStories);
  const setTasks = useAppStore((state) => state.setTasks);
  const setSprints = useAppStore((state) => state.setSprints);
  const setTeamMembers = useAppStore((state) => state.setTeamMembers);
  const setDependencies = useAppStore((state) => state.setDependencies);

  const epics = useAppStore((state) => state.epics);

  useEffect(() => {
    // Only populate if data is empty
    if (epics.length === 0) {
      setCurrentProject(mockProject);
      setEpics(mockEpics);
      setStories(mockStories);
      setTasks(mockTasks);
      setSprints(mockSprints);
      setTeamMembers(mockTeamMembers);
      setDependencies(mockDependencies);
    }
  }, [
    setCurrentProject,
    setEpics,
    setStories,
    setTasks,
    setSprints,
    setTeamMembers,
    setDependencies,
    epics.length,
  ]);
}
