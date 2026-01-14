/**
 * Type definitions for LCAS agents
 */

// ============================================================================
// Research Types
// ============================================================================

export interface ResearchTopic {
  title: string;
  keyPoints: string[];
  details: string;
  sources: string[];
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface Misconception {
  misconception: string;
  truth: string;
}

export interface Statistic {
  stat: string;
  source: string;
}

export interface RegulatoryRequirement {
  requirement: string;
  source: string;
}

export interface ResearchResult {
  topic: string;
  summary: string;
  mainTopics: ResearchTopic[];
  keyTerms: KeyTerm[];
  commonMisconceptions: Misconception[];
  statistics: Statistic[];
  regulatoryRequirements: RegulatoryRequirement[];
}

// ============================================================================
// Design Spec Types
// ============================================================================

export interface CourseMetadata {
  title: string;
  curriculum: string;
  prerequisite: string | null;
  duration: number;
  audience: string;
  assessmentFormat: string;
}

export interface LearningObjective {
  id: string;
  text: string;
  bloomLevel: string;
}

export interface DesignTopic {
  title: string;
  objectives: LearningObjective[];
  sources: string[];
}

export interface DesignSpec {
  metadata: CourseMetadata;
  topics: DesignTopic[];
  keyTerms: string[];
  misconceptions: string[];
}

// ============================================================================
// Storyboard Types
// ============================================================================

export interface InteractionItem {
  itemId: string;
  label: string;
  content: string;
}

export interface QuizAnswer {
  label: string;
  correct: boolean;
}

export interface StoryboardSection {
  sectionId: string;
  type: 'intro' | 'header' | 'content' | 'practice' | 'summary';
  title: string;
  content?: string;
  interactionType?: string;
  interactionItems?: InteractionItem[];
  objectiveIds?: string[];
  notes?: string;
  // For practice questions
  questionText?: string;
  questionType?: 'single' | 'multiple' | 'true_false';
  answers?: QuizAnswer[];
  correctFeedback?: string;
  incorrectFeedback?: string;
}

export interface QuizQuestion {
  questionId: string;
  questionText: string;
  questionType: 'single' | 'multiple' | 'true_false';
  instruction: string;
  answers: QuizAnswer[];
  correctFeedback: string;
  incorrectFeedback: string;
  objectiveIds: string[];
  sectionIds: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface FinalQuiz {
  questions: QuizQuestion[];
  passPercentage: number;
}

export interface Storyboard {
  sections: StoryboardSection[];
  finalQuiz: FinalQuiz;
}

// ============================================================================
// Generation Request Types
// ============================================================================

export interface GenerationRequest {
  topic: string;
  format: 'elearning' | 'workshop' | 'scenario';
  audience: string;
  durationMinutes: number;
  curriculum?: string;
  prerequisite?: string;
  additionalContext?: string;
  sourceUrls?: string[];
}

export interface GenerationLogEntry {
  timestamp: string;
  phase: string;
  message: string;
  durationMs?: number;
}

export type GenerationPhase = 'research' | 'design' | 'storyboard' | 'build' | 'complete';
export type GenerationStatus = 'pending' | 'researching' | 'designing' | 'building' | 'review' | 'complete' | 'failed';

// ============================================================================
// Course Output Types
// ============================================================================

export interface CourseConfig {
  xyData: Record<string, unknown>;
  pages: PageJson[];
  tincanXml: string;
  manifest: CourseManifest;
}

export interface PageJson {
  pageId: string;
  title: string;
  components: Record<string, unknown>[];
}

export interface CourseManifest {
  courseId: string;
  title: string;
  version: string;
  objectives: {
    id: string;
    text: string;
    sectionIds: string[];
    questionIds: string[];
  }[];
  sections: {
    id: string;
    pageId: string;
    objectiveIds: string[];
  }[];
  questions: {
    id: string;
    objectiveIds: string[];
  }[];
}
