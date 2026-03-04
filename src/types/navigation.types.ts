import { Passage } from './bible.types';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Planner: undefined;
  Bible: undefined;
  Settings: undefined;
};

export type PlannerStackParamList = {
  SchedulerHome: undefined;
  TaskDetail: { taskId: string };
  AddTask: { date?: string; startTime?: string } | undefined;
};

export type BibleStackParamList = {
  BibleHome: undefined;
  PlanSelect: undefined;
  PassageView: { passage: Passage; dayNumber: number };
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  BiblePlanSetup: undefined;
};
