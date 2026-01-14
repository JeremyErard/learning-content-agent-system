# Learning Content Agent System (LCAS)
## Complete Project Specification

---

# PART 1: MISSION, VISION & PRINCIPLES

## 1.1 Mission Statement

Build an AI-powered instructional design agent system that transforms topic requests into production-ready learning content (eLearning courses, workshops, interactive scenarios) matching the quality and structure of professionally-designed training materials, while capturing analytics that enable continuous improvement of both the content and the generation system itself.

## 1.2 Vision

A system where:
1. An instructional designer provides a topic and format
2. The agent researches, designs, and produces complete training assets
3. Human review occurs at strategic checkpoints (design doc, storyboard)
4. Final output is deployment-ready with full xAPI/SCORM tracking
5. Learner analytics flow back to improve both content and generation quality
6. Each course generated makes the next one better

## 1.3 Core Principles

### Content Quality
- Generated content must match the quality of the provided gold-standard examples
- Instructional design best practices (Bloom's taxonomy, chunking, active learning)
- Consistent component usage patterns learned from examples

### Continuous Learning
- The system improves with each course generated
- Human corrections are captured and patterns extracted
- Example library grows with each approved course

### Analytics-Driven
- Every interaction is trackable back to learning objectives
- Content effectiveness is measurable and actionable
- Insights feed back into course improvement recommendations

### Integration-First
- Deploys to existing infrastructure (Render, Neon, CloudFront)
- Uses existing course player architecture
- Extends existing Thrive platform capabilities

---

# PART 2: SYSTEM ARCHITECTURE

## 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LEARNING CONTENT AGENT SYSTEM                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│  │   WEB INTERFACE  │     │   AGENT SERVICE  │     │  KNOWLEDGE BASE  │     │
│  │   (Next.js)      │◄───►│   (Express.js)   │◄───►│  (PostgreSQL)    │     │
│  │                  │     │                  │     │                  │     │
│  │  • Request form  │     │  • Orchestrator  │     │  • Examples      │     │
│  │  • Review UI     │     │  • Researcher    │     │  • Corrections   │     │
│  │  • Feedback      │     │  • Designer      │     │  • Patterns      │     │
│  │  • Analytics     │     │  • Builder       │     │  • Components    │     │
│  └──────────────────┘     └────────┬─────────┘     └──────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│                          ┌──────────────────┐                                │
│                          │   ANTHROPIC API  │                                │
│                          │   (Claude)       │                                │
│                          └──────────────────┘                                │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                              OUTPUT PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│  │  DESIGN DOC      │────►│   STORYBOARD     │────►│  COURSE PACKAGE  │     │
│  │  (.docx)         │     │   (.docx)        │     │  (.zip)          │     │
│  │                  │     │                  │     │                  │     │
│  │  Human Review ✓  │     │  Human Review ✓  │     │  • xy_data.json  │     │
│  │                  │     │                  │     │  • page_*.json   │     │
│  │                  │     │                  │     │  • tincan.xml    │     │
│  │                  │     │                  │     │  • manifest.json │     │
│  └──────────────────┘     └──────────────────┘     └────────┬─────────┘     │
│                                                              │               │
│                                                              ▼               │
│                                                    ┌──────────────────┐     │
│                                                    │   CLOUDFRONT     │     │
│                                                    │   (Deployment)   │     │
│                                                    └──────────────────┘     │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                             ANALYTICS PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│  │  COURSE PLAYER   │────►│  xAPI ENDPOINT   │────►│  ANALYTICS DB    │     │
│  │  (React)         │     │  (Express.js)    │     │  (PostgreSQL)    │     │
│  │                  │     │                  │     │                  │     │
│  │  • Interactions  │     │  • Process       │     │  • Raw events    │     │
│  │  • Questions     │     │  • Correlate     │     │  • Aggregates    │     │
│  │  • Completion    │     │  • Store         │     │  • Insights      │     │
│  └──────────────────┘     └──────────────────┘     └────────┬─────────┘     │
│                                                              │               │
│                                                              ▼               │
│                                                    ┌──────────────────┐     │
│                                                    │  FEEDBACK LOOP   │     │
│                                                    │  (Agent Learning)│     │
│                                                    └──────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Service Architecture (Render Deployment)

```
RENDER SERVICES
├── lcas-api (Web Service)
│   ├── Port: 10000
│   ├── Health check: /health
│   ├── Environment: Node.js 20
│   └── Instance: Standard (can scale)
│
├── lcas-worker (Background Worker) [Optional - Phase 2]
│   ├── For long-running generation tasks
│   └── Queue-based processing
│
└── Connected Services
    ├── Neon PostgreSQL (existing or new DB)
    ├── Anthropic API (external)
    └── AWS S3/CloudFront (existing)
```

## 2.3 Directory Structure

```
lcas/
├── README.md
├── package.json
├── tsconfig.json
├── render.yaml
├── .env.example
│
├── src/
│   ├── index.ts                      # Application entry point
│   ├── config/
│   │   ├── index.ts                  # Configuration management
│   │   ├── database.ts               # Database connection
│   │   └── anthropic.ts              # Anthropic client setup
│   │
│   ├── api/
│   │   ├── routes/
│   │   │   ├── index.ts              # Route aggregator
│   │   │   ├── generation.ts         # /api/generation/*
│   │   │   ├── review.ts             # /api/review/*
│   │   │   ├── publish.ts            # /api/publish/*
│   │   │   ├── analytics.ts          # /api/analytics/*
│   │   │   ├── knowledge.ts          # /api/knowledge/*
│   │   │   └── xapi.ts               # /api/xapi/*
│   │   │
│   │   └── middleware/
│   │       ├── auth.ts               # Authentication
│   │       ├── validation.ts         # Request validation
│   │       └── error-handler.ts      # Error handling
│   │
│   ├── agents/
│   │   ├── orchestrator.ts           # Main agent coordinator
│   │   ├── researcher.ts             # Topic research agent
│   │   ├── designer.ts               # Design doc/storyboard agent
│   │   ├── builder.ts                # Course JSON builder agent
│   │   └── prompts/
│   │       ├── research.ts           # Research prompts
│   │       ├── design-spec.ts        # Design spec generation prompts
│   │       ├── storyboard.ts         # Storyboard generation prompts
│   │       ├── course-json.ts        # JSON generation prompts
│   │       └── quiz.ts               # Quiz generation prompts
│   │
│   ├── generators/
│   │   ├── design-doc.ts             # Design doc generator (DOCX)
│   │   ├── storyboard.ts             # Storyboard generator (DOCX)
│   │   ├── course-package.ts         # Course package generator
│   │   ├── xy-data.ts                # xy_data.json generator
│   │   ├── page-json.ts              # Page JSON generator
│   │   ├── tincan.ts                 # tincan.xml generator
│   │   └── manifest.ts               # Course manifest generator
│   │
│   ├── components/
│   │   ├── registry.ts               # Component registry
│   │   ├── mapper.ts                 # Content-to-component mapper
│   │   ├── templates/
│   │   │   ├── ImgSingle2col.ts      # Header/intro component
│   │   │   ├── H1ALeft.ts            # Heading component
│   │   │   ├── CR3A.ts               # Click-reveal fullscreen
│   │   │   ├── ClickRevealGrid.ts    # Click-reveal grid
│   │   │   ├── SS2ACarousel.ts       # Slideshow carousel
│   │   │   ├── KcCheckboxAnswerable.ts # Quiz component
│   │   │   ├── CourseComplete.ts     # Completion component
│   │   │   ├── P1Col1Left.ts         # Paragraph component
│   │   │   └── MultipleButtons.ts    # Button navigation
│   │   │
│   │   └── schemas/
│   │       └── component-schemas.ts  # JSON schemas for validation
│   │
│   ├── knowledge/
│   │   ├── examples.ts               # Example course retrieval
│   │   ├── corrections.ts            # Correction pattern storage
│   │   ├── patterns.ts               # Pattern extraction/application
│   │   └── assets.ts                 # Asset library management
│   │
│   ├── analytics/
│   │   ├── processor.ts              # xAPI statement processor
│   │   ├── correlator.ts             # Content-question correlator
│   │   ├── aggregator.ts             # Metrics aggregation
│   │   ├── insights.ts               # Automated insight generation
│   │   └── queries/
│   │       ├── effectiveness.ts      # Course effectiveness queries
│   │       ├── engagement.ts         # Content engagement queries
│   │       └── objectives.ts         # Objective mastery queries
│   │
│   ├── services/
│   │   ├── anthropic.ts              # Anthropic API wrapper
│   │   ├── web-search.ts             # Web search for research
│   │   ├── document.ts               # DOCX generation service
│   │   ├── storage.ts                # S3/file storage service
│   │   └── deployment.ts             # CloudFront deployment service
│   │
│   ├── db/
│   │   ├── schema.sql                # Database schema
│   │   ├── migrations/               # Database migrations
│   │   └── queries/
│   │       ├── courses.ts            # Course queries
│   │       ├── analytics.ts          # Analytics queries
│   │       └── knowledge.ts          # Knowledge base queries
│   │
│   ├── types/
│   │   ├── index.ts                  # Type exports
│   │   ├── course.ts                 # Course types
│   │   ├── component.ts              # Component types
│   │   ├── analytics.ts              # Analytics types
│   │   └── xapi.ts                   # xAPI types
│   │
│   └── utils/
│       ├── id-generator.ts           # Unique ID generation
│       ├── slug.ts                   # URL slug generation
│       ├── validation.ts             # Data validation utilities
│       └── formatting.ts             # Content formatting utilities
│
├── prompts/
│   ├── system/
│   │   ├── researcher.md             # Researcher agent system prompt
│   │   ├── designer.md               # Designer agent system prompt
│   │   └── builder.md                # Builder agent system prompt
│   │
│   └── templates/
│       ├── design-spec.md            # Design spec template
│       ├── storyboard.md             # Storyboard template
│       └── component-selection.md    # Component selection rules
│
├── examples/
│   ├── anti-bullying/
│   │   ├── design-spec.json          # Parsed design spec
│   │   ├── storyboard.json           # Parsed storyboard
│   │   ├── xy_data.json              # Course config
│   │   ├── pages/                    # Page JSONs
│   │   └── manifest.json             # Analytics manifest
│   │
│   └── respiratory-protection/
│       └── design-spec.json          # Parsed design spec (input example)
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
└── scripts/
    ├── setup-db.ts                   # Database setup
    ├── seed-examples.ts              # Seed example courses
    └── deploy.ts                     # Deployment script
```

---

# PART 3: DATABASE SCHEMA

## 3.1 Complete Schema

```sql
-- ============================================================================
-- LEARNING CONTENT AGENT SYSTEM - DATABASE SCHEMA
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES: Course Generation
-- ============================================================================

-- Generated courses and their lifecycle status
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    course_id VARCHAR(255) UNIQUE NOT NULL,  -- e.g., "http://XY/EHS_Respiratory"
    slug VARCHAR(255) UNIQUE NOT NULL,        -- e.g., "respiratory-protection"
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Classification
    format VARCHAR(50) NOT NULL,              -- 'elearning', 'workshop', 'scenario'
    curriculum VARCHAR(255),                   -- e.g., "OTS EHS Curriculum"
    client VARCHAR(255),                       -- e.g., "HR Compliance"
    
    -- Target
    audience TEXT,
    duration_minutes INT,
    prerequisite VARCHAR(255),
    
    -- Status workflow
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- Statuses: draft, design_review, design_approved, storyboard_review, 
    --           storyboard_approved, generating, generated, published, archived
    
    -- Content (stored as JSONB for flexibility)
    design_spec JSONB,                        -- Parsed design specification
    storyboard JSONB,                         -- Parsed storyboard content
    course_config JSONB,                      -- xy_data.json content
    course_manifest JSONB,                    -- Analytics manifest
    
    -- Generation metadata
    generation_request JSONB,                 -- Original request parameters
    generation_log JSONB[],                   -- Log of generation steps
    
    -- Review tracking
    design_reviewed_at TIMESTAMP,
    design_reviewed_by VARCHAR(255),
    design_review_notes TEXT,
    storyboard_reviewed_at TIMESTAMP,
    storyboard_reviewed_by VARCHAR(255),
    storyboard_review_notes TEXT,
    
    -- Deployment
    cloudfront_url VARCHAR(512),
    published_at TIMESTAMP,
    published_version VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Course pages (individual page JSONs)
CREATE TABLE course_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    page_index INT NOT NULL,
    page_id VARCHAR(100) NOT NULL,            -- e.g., "page_knixfdgc"
    title VARCHAR(255) NOT NULL,
    
    page_json JSONB NOT NULL,                 -- Full page JSON content
    
    -- Analytics mapping
    section_ids TEXT[],                        -- Sections in this page
    objective_ids TEXT[],                      -- Objectives covered
    component_types TEXT[],                    -- Components used
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(course_id, page_index)
);

-- Course objectives (learning/performance objectives)
CREATE TABLE course_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    objective_id VARCHAR(100) NOT NULL,       -- e.g., "obj-1"
    text TEXT NOT NULL,                        -- The objective statement
    bloom_level VARCHAR(50),                   -- 'remember', 'understand', 'apply', etc.
    topic VARCHAR(255),                        -- Parent topic
    
    -- Correlation tracking
    section_ids TEXT[],                        -- Content sections addressing this
    question_ids TEXT[],                       -- Questions assessing this
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(course_id, objective_id)
);

-- Course questions (practice + final quiz)
CREATE TABLE course_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    question_id VARCHAR(100) NOT NULL,        -- e.g., "q1", "practice-1.4"
    quiz_id VARCHAR(100) NOT NULL,            -- e.g., "finalQuiz", "practiceQuiz"
    question_type VARCHAR(50) NOT NULL,       -- 'single', 'multiple', 'true_false'
    
    question_text TEXT NOT NULL,
    instruction_text TEXT,
    
    answers JSONB NOT NULL,                   -- Array of {label, correctAnswer, feedback}
    correct_feedback TEXT,
    incorrect_feedback TEXT,
    
    -- Correlation
    objective_ids TEXT[],                      -- Objectives this assesses
    section_ids TEXT[],                        -- Sections this relates to
    
    -- Analytics metadata
    difficulty VARCHAR(20),                    -- 'easy', 'medium', 'hard'
    discrimination_index FLOAT,                -- Updated by analytics
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(course_id, question_id)
);

-- Course sections (content sections for analytics)
CREATE TABLE course_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    section_id VARCHAR(100) NOT NULL,         -- e.g., "section-1.2"
    page_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    
    component_type VARCHAR(50) NOT NULL,      -- e.g., "CR3A", "SS2ACarousel"
    interaction_items JSONB,                  -- Items within the interaction
    
    objective_ids TEXT[],                      -- Objectives this covers
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(course_id, section_id)
);

-- ============================================================================
-- KNOWLEDGE BASE TABLES: Learning System
-- ============================================================================

-- Example courses (gold standards for few-shot learning)
CREATE TABLE example_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    title VARCHAR(255) NOT NULL,
    format VARCHAR(50) NOT NULL,
    
    -- Classification for retrieval
    topics TEXT[],                             -- Topic tags
    industries TEXT[],                         -- Industry tags
    components_used TEXT[],                    -- Component types in this example
    
    -- Content
    design_spec JSONB,                         -- The design specification
    storyboard JSONB,                          -- The storyboard
    course_config JSONB,                       -- xy_data.json
    sample_pages JSONB,                        -- Representative page JSONs
    
    -- Quality indicators
    quality_score FLOAT,                       -- Manual quality rating 1-5
    times_used INT DEFAULT 0,                  -- How often used as example
    
    -- Embeddings for semantic search (optional, Phase 2)
    embedding VECTOR(1536),                    -- OpenAI embedding
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Corrections log (for learning from human feedback)
CREATE TABLE corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    
    -- What was corrected
    correction_type VARCHAR(50) NOT NULL,     -- 'content', 'component', 'structure', 'quiz', 'styling'
    location VARCHAR(255),                     -- Where in the course (page, section, etc.)
    
    -- The correction
    original_value TEXT NOT NULL,
    corrected_value TEXT NOT NULL,
    correction_reason TEXT,
    
    -- Pattern extraction
    pattern_extracted BOOLEAN DEFAULT FALSE,
    extracted_pattern_id UUID,
    
    -- Metadata
    corrected_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Extracted patterns (rules learned from corrections)
CREATE TABLE patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Pattern definition
    pattern_type VARCHAR(50) NOT NULL,        -- 'content_rule', 'component_selection', 'quiz_format', etc.
    condition TEXT NOT NULL,                   -- When this pattern applies
    rule TEXT NOT NULL,                        -- What to do
    
    -- Examples
    positive_examples JSONB,                   -- Examples where this applies
    negative_examples JSONB,                   -- Counter-examples
    
    -- Confidence
    confidence FLOAT DEFAULT 0.5,             -- 0-1, updated with usage
    times_applied INT DEFAULT 0,
    times_successful INT DEFAULT 0,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Component recipes (rules for component selection)
CREATE TABLE component_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    component_id VARCHAR(100) NOT NULL UNIQUE, -- e.g., "CR3A", "SS2ACarousel"
    component_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Selection criteria
    use_when JSONB NOT NULL,                  -- Conditions for using this component
    -- Example: {"itemCount": {"min": 3, "max": 6}, "contentType": ["concepts", "definitions"]}
    
    -- Configuration template
    config_template JSONB NOT NULL,           -- Base configuration
    required_fields TEXT[],
    optional_fields TEXT[],
    
    -- Examples
    example_configs JSONB[],
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Asset library (images, icons for courses)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    filename VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,          -- 'header', 'icon', 'background', 'photo'
    
    -- Storage
    s3_key VARCHAR(512) NOT NULL,
    cloudfront_url VARCHAR(512),
    file_size_bytes INT,
    mime_type VARCHAR(100),
    
    -- Classification for matching
    tags TEXT[],
    topics TEXT[],
    mood VARCHAR(50),                          -- 'professional', 'casual', 'serious', etc.
    
    -- Usage tracking
    times_used INT DEFAULT 0,
    last_used_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS TABLES: Learning Tracking
-- ============================================================================

-- Raw xAPI statements (for audit and reprocessing)
CREATE TABLE xapi_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Statement identification
    statement_id UUID UNIQUE,
    
    -- Actor
    actor_name VARCHAR(255),
    actor_mbox VARCHAR(255),
    actor_account JSONB,
    
    -- Verb
    verb_id VARCHAR(255) NOT NULL,
    verb_display VARCHAR(100),
    
    -- Object
    object_id VARCHAR(512) NOT NULL,
    object_type VARCHAR(100),
    object_definition JSONB,
    
    -- Result
    result_success BOOLEAN,
    result_completion BOOLEAN,
    result_score JSONB,
    result_duration VARCHAR(50),              -- ISO 8601 duration
    result_response TEXT,
    result_extensions JSONB,
    
    -- Context
    context_registration UUID,
    context_extensions JSONB,
    context_activities JSONB,
    
    -- Raw
    raw_statement JSONB NOT NULL,
    
    -- Timestamps
    statement_timestamp TIMESTAMP NOT NULL,
    stored_at TIMESTAMP DEFAULT NOW()
);

-- Processed learning events (optimized for analytics)
CREATE TABLE learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Course and user
    course_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,            -- From actor mbox or account
    session_id VARCHAR(255),
    registration_id UUID,
    
    -- Event classification
    event_type VARCHAR(50) NOT NULL,          -- 'page_view', 'interaction_start', 'interaction_complete', 
                                              -- 'item_reveal', 'question_attempt', 'course_complete'
    
    -- Object
    object_id VARCHAR(512) NOT NULL,
    object_type VARCHAR(50),
    
    -- Location in course
    page_id VARCHAR(100),
    section_id VARCHAR(100),
    component_type VARCHAR(50),
    
    -- Correlation
    objective_ids TEXT[],
    question_id VARCHAR(100),
    
    -- Results
    success BOOLEAN,
    score FLOAT,
    duration_seconds INT,
    
    -- Interaction specifics
    items_viewed INT,
    total_items INT,
    response TEXT,
    
    -- Timestamp
    event_timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for learning_events
CREATE INDEX idx_learning_events_course ON learning_events(course_id);
CREATE INDEX idx_learning_events_user ON learning_events(user_id);
CREATE INDEX idx_learning_events_type ON learning_events(event_type);
CREATE INDEX idx_learning_events_section ON learning_events(section_id);
CREATE INDEX idx_learning_events_timestamp ON learning_events(event_timestamp);
CREATE INDEX idx_learning_events_course_user ON learning_events(course_id, user_id);

-- Section analytics (aggregated)
CREATE TABLE section_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) NOT NULL,
    section_id VARCHAR(100) NOT NULL,
    
    -- Engagement metrics
    total_views INT DEFAULT 0,
    unique_viewers INT DEFAULT 0,
    total_completions INT DEFAULT 0,
    completion_rate FLOAT,
    
    -- Time metrics
    total_duration_seconds BIGINT DEFAULT 0,
    avg_duration_seconds FLOAT,
    min_duration_seconds INT,
    max_duration_seconds INT,
    
    -- Interaction metrics
    avg_items_viewed FLOAT,
    full_completion_rate FLOAT,              -- Viewed all items
    
    -- Correlated question performance
    related_question_ids TEXT[],
    avg_related_question_score FLOAT,
    
    -- Timestamps
    first_view_at TIMESTAMP,
    last_view_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(course_id, section_id)
);

-- Question analytics (aggregated)
CREATE TABLE question_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) NOT NULL,
    question_id VARCHAR(100) NOT NULL,
    
    -- Attempt metrics
    total_attempts INT DEFAULT 0,
    unique_attempters INT DEFAULT 0,
    first_attempt_correct INT DEFAULT 0,
    eventually_correct INT DEFAULT 0,
    
    -- Performance metrics
    success_rate FLOAT,
    first_attempt_success_rate FLOAT,
    avg_attempts_to_correct FLOAT,
    
    -- Time metrics
    total_duration_seconds BIGINT DEFAULT 0,
    avg_duration_seconds FLOAT,
    
    -- Answer distribution
    answer_distribution JSONB,               -- {answer: count}
    
    -- Quality indicators
    discrimination_index FLOAT,               -- Correlation with overall score
    difficulty_index FLOAT,                   -- % correct
    
    -- Correlated content
    related_section_ids TEXT[],
    avg_related_section_completion FLOAT,
    
    -- Timestamps
    first_attempt_at TIMESTAMP,
    last_attempt_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(course_id, question_id)
);

-- Objective mastery (per user per objective)
CREATE TABLE objective_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    objective_id VARCHAR(100) NOT NULL,
    
    -- Content engagement
    content_sections_completed INT DEFAULT 0,
    content_sections_total INT DEFAULT 0,
    content_completion_rate FLOAT,
    content_duration_seconds INT DEFAULT 0,
    
    -- Assessment performance
    questions_attempted INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    assessment_score FLOAT,
    
    -- Overall mastery
    mastery_score FLOAT,                      -- Weighted combination
    mastery_level VARCHAR(20),                -- 'not_started', 'developing', 'proficient', 'mastered'
    
    -- Timestamps
    first_interaction_at TIMESTAMP,
    last_interaction_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(course_id, user_id, objective_id)
);

-- Course analytics (overall course metrics)
CREATE TABLE course_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Enrollment metrics
    total_starts INT DEFAULT 0,
    total_completions INT DEFAULT 0,
    completion_rate FLOAT,
    
    -- Score metrics
    total_passes INT DEFAULT 0,
    total_fails INT DEFAULT 0,
    pass_rate FLOAT,
    avg_score FLOAT,
    score_std_dev FLOAT,
    
    -- Time metrics
    avg_duration_seconds FLOAT,
    median_duration_seconds INT,
    
    -- Engagement
    avg_content_completion FLOAT,             -- Avg % of interactions completed
    
    -- Trends (last 30 days)
    recent_completion_rate FLOAT,
    recent_pass_rate FLOAT,
    recent_avg_score FLOAT,
    
    -- Timestamps
    first_start_at TIMESTAMP,
    last_completion_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics insights (automated recommendations)
CREATE TABLE analytics_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) NOT NULL,
    
    -- Insight classification
    insight_type VARCHAR(50) NOT NULL,        -- 'low_engagement', 'difficult_question', 'content_gap', etc.
    severity VARCHAR(20) NOT NULL,            -- 'info', 'warning', 'critical'
    
    -- Details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    affected_elements JSONB,                  -- {sections: [], questions: [], objectives: []}
    
    -- Evidence
    metrics JSONB NOT NULL,                   -- The data supporting this insight
    threshold_violated VARCHAR(255),          -- What threshold triggered this
    
    -- Recommendation
    recommendation TEXT,
    recommended_action VARCHAR(50),           -- 'review', 'enhance', 'simplify', 'split', etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'new',         -- 'new', 'acknowledged', 'addressed', 'dismissed'
    addressed_at TIMESTAMP,
    addressed_by VARCHAR(255),
    resolution_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- VIEWS: Convenience Views for Common Queries
-- ============================================================================

-- Course effectiveness summary
CREATE VIEW v_course_effectiveness AS
SELECT 
    c.id,
    c.course_id,
    c.title,
    c.status,
    ca.total_starts,
    ca.total_completions,
    ca.completion_rate,
    ca.pass_rate,
    ca.avg_score,
    ca.avg_duration_seconds,
    ca.avg_content_completion,
    (SELECT COUNT(*) FROM analytics_insights ai 
     WHERE ai.course_id = c.course_id AND ai.status = 'new') AS pending_insights
FROM courses c
LEFT JOIN course_analytics ca ON ca.course_id = c.course_id;

-- Section-question correlation
CREATE VIEW v_section_question_correlation AS
SELECT 
    cs.course_id,
    cs.section_id,
    cs.title AS section_title,
    cs.component_type,
    sa.completion_rate AS section_completion_rate,
    sa.avg_duration_seconds AS section_avg_duration,
    cq.question_id,
    cq.question_text,
    qa.success_rate AS question_success_rate,
    qa.discrimination_index
FROM course_sections cs
JOIN section_analytics sa ON sa.course_id = cs.course_id AND sa.section_id = cs.section_id
JOIN course_questions cq ON cq.course_id = cs.course_id AND cs.section_id = ANY(cq.section_ids)
JOIN question_analytics qa ON qa.course_id = cq.course_id AND qa.question_id = cq.question_id;

-- ============================================================================
-- FUNCTIONS: Analytics Processing
-- ============================================================================

-- Function to process xAPI statement into learning event
CREATE OR REPLACE FUNCTION process_xapi_statement(statement JSONB)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
    course_id_val VARCHAR(255);
    user_id_val VARCHAR(255);
    event_type_val VARCHAR(50);
    -- ... additional variables
BEGIN
    -- Extract course ID from context
    course_id_val := statement->'context'->'extensions'->>'http://xapi.lcas.com/courseId';
    
    -- Extract user ID from actor
    user_id_val := COALESCE(
        statement->'actor'->>'mbox',
        statement->'actor'->'account'->>'name'
    );
    
    -- Determine event type from verb
    event_type_val := CASE statement->'verb'->>'id'
        WHEN 'http://adlnet.gov/expapi/verbs/experienced' THEN 'page_view'
        WHEN 'http://adlnet.gov/expapi/verbs/interacted' THEN 'item_reveal'
        WHEN 'http://adlnet.gov/expapi/verbs/completed' THEN 
            CASE 
                WHEN statement->'object'->'definition'->>'type' LIKE '%interaction%' THEN 'interaction_complete'
                ELSE 'course_complete'
            END
        WHEN 'http://adlnet.gov/expapi/verbs/answered' THEN 'question_attempt'
        ELSE 'other'
    END;
    
    -- Insert learning event
    INSERT INTO learning_events (
        course_id, user_id, session_id, registration_id,
        event_type, object_id, object_type,
        page_id, section_id, component_type,
        objective_ids, question_id,
        success, score, duration_seconds,
        items_viewed, total_items, response,
        event_timestamp
    ) VALUES (
        course_id_val,
        user_id_val,
        statement->'context'->>'registration',
        (statement->'context'->>'registration')::UUID,
        event_type_val,
        statement->'object'->>'id',
        statement->'object'->'definition'->>'type',
        statement->'context'->'extensions'->>'http://xapi.lcas.com/pageId',
        statement->'context'->'extensions'->>'http://xapi.lcas.com/sectionId',
        statement->'context'->'extensions'->>'http://xapi.lcas.com/componentType',
        ARRAY(SELECT jsonb_array_elements_text(
            statement->'context'->'extensions'->'http://xapi.lcas.com/objectiveIds'
        )),
        statement->'context'->'extensions'->>'http://xapi.lcas.com/questionId',
        (statement->'result'->>'success')::BOOLEAN,
        (statement->'result'->'score'->>'scaled')::FLOAT,
        EXTRACT(EPOCH FROM (statement->'result'->>'duration')::INTERVAL)::INT,
        (statement->'result'->'extensions'->>'http://xapi.lcas.com/itemsViewed')::INT,
        (statement->'result'->'extensions'->>'http://xapi.lcas.com/totalItems')::INT,
        statement->'result'->>'response',
        (statement->>'timestamp')::TIMESTAMP
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update section analytics
CREATE OR REPLACE FUNCTION update_section_analytics(p_course_id VARCHAR, p_section_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO section_analytics (course_id, section_id)
    VALUES (p_course_id, p_section_id)
    ON CONFLICT (course_id, section_id) DO NOTHING;
    
    UPDATE section_analytics sa
    SET 
        total_views = sub.total_views,
        unique_viewers = sub.unique_viewers,
        total_completions = sub.total_completions,
        completion_rate = sub.completion_rate,
        avg_duration_seconds = sub.avg_duration,
        avg_items_viewed = sub.avg_items,
        full_completion_rate = sub.full_completion,
        first_view_at = sub.first_view,
        last_view_at = sub.last_view,
        updated_at = NOW()
    FROM (
        SELECT 
            COUNT(*) AS total_views,
            COUNT(DISTINCT user_id) AS unique_viewers,
            COUNT(*) FILTER (WHERE items_viewed >= total_items) AS total_completions,
            AVG(CASE WHEN items_viewed >= total_items THEN 1.0 ELSE 0.0 END) AS completion_rate,
            AVG(duration_seconds) AS avg_duration,
            AVG(items_viewed::FLOAT) AS avg_items,
            AVG(CASE WHEN items_viewed = total_items THEN 1.0 ELSE 0.0 END) AS full_completion,
            MIN(event_timestamp) AS first_view,
            MAX(event_timestamp) AS last_view
        FROM learning_events
        WHERE course_id = p_course_id 
          AND section_id = p_section_id
          AND event_type IN ('interaction_complete', 'item_reveal')
    ) sub
    WHERE sa.course_id = p_course_id AND sa.section_id = p_section_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update question analytics
CREATE OR REPLACE FUNCTION update_question_analytics(p_course_id VARCHAR, p_question_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO question_analytics (course_id, question_id)
    VALUES (p_course_id, p_question_id)
    ON CONFLICT (course_id, question_id) DO NOTHING;
    
    UPDATE question_analytics qa
    SET 
        total_attempts = sub.total_attempts,
        unique_attempters = sub.unique_attempters,
        first_attempt_correct = sub.first_correct,
        success_rate = sub.success_rate,
        avg_duration_seconds = sub.avg_duration,
        answer_distribution = sub.answer_dist,
        difficulty_index = sub.success_rate,
        first_attempt_at = sub.first_attempt,
        last_attempt_at = sub.last_attempt,
        updated_at = NOW()
    FROM (
        SELECT 
            COUNT(*) AS total_attempts,
            COUNT(DISTINCT user_id) AS unique_attempters,
            COUNT(*) FILTER (WHERE success = TRUE) AS first_correct,
            AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) AS success_rate,
            AVG(duration_seconds) AS avg_duration,
            jsonb_object_agg(COALESCE(response, 'no_response'), response_count) AS answer_dist,
            MIN(event_timestamp) AS first_attempt,
            MAX(event_timestamp) AS last_attempt
        FROM learning_events le
        LEFT JOIN (
            SELECT response, COUNT(*) AS response_count 
            FROM learning_events 
            WHERE course_id = p_course_id AND question_id = p_question_id
            GROUP BY response
        ) rc ON le.response = rc.response
        WHERE le.course_id = p_course_id 
          AND le.question_id = p_question_id
          AND le.event_type = 'question_attempt'
    ) sub
    WHERE qa.course_id = p_course_id AND qa.question_id = p_question_id;
END;
$$ LANGUAGE plpgsql;
```

---

# PART 4: API SPECIFICATION

## 4.1 API Endpoints

### Generation API

```typescript
// POST /api/generation/start
// Start a new course generation
interface StartGenerationRequest {
  topic: string;
  format: 'elearning' | 'workshop' | 'scenario';
  audience: string;
  durationMinutes: number;
  curriculum?: string;
  prerequisite?: string;
  additionalContext?: string;
  sourceUrls?: string[];
}

interface StartGenerationResponse {
  courseId: string;
  status: 'researching';
  estimatedCompletionMinutes: number;
}

// GET /api/generation/:courseId/status
// Check generation status
interface GenerationStatusResponse {
  courseId: string;
  status: string;
  currentPhase: 'research' | 'design' | 'storyboard' | 'build';
  progress: number; // 0-100
  log: GenerationLogEntry[];
}

// POST /api/generation/:courseId/design-spec
// Generate design spec (Phase 1)
interface GenerateDesignSpecResponse {
  courseId: string;
  designSpec: DesignSpec;
  downloadUrl: string; // DOCX download
}

// POST /api/generation/:courseId/storyboard
// Generate storyboard (Phase 2, requires approved design spec)
interface GenerateStoryboardResponse {
  courseId: string;
  storyboard: Storyboard;
  downloadUrl: string; // DOCX download
}

// POST /api/generation/:courseId/build
// Build course package (Phase 3, requires approved storyboard)
interface BuildCourseResponse {
  courseId: string;
  courseConfig: XYData;
  pages: PageJson[];
  manifest: CourseManifest;
  packageUrl: string; // ZIP download
}
```

### Review API

```typescript
// POST /api/review/:courseId/design
// Submit design spec review
interface DesignReviewRequest {
  approved: boolean;
  notes?: string;
  corrections?: Correction[];
}

// POST /api/review/:courseId/storyboard
// Submit storyboard review
interface StoryboardReviewRequest {
  approved: boolean;
  notes?: string;
  corrections?: Correction[];
}

// POST /api/review/:courseId/course
// Submit final course review
interface CourseReviewRequest {
  approved: boolean;
  notes?: string;
  corrections?: Correction[];
}

interface Correction {
  type: 'content' | 'component' | 'structure' | 'quiz' | 'styling';
  location: string;
  originalValue: string;
  correctedValue: string;
  reason?: string;
}
```

### Publishing API

```typescript
// POST /api/publish/:courseId
// Publish course to CloudFront
interface PublishRequest {
  version?: string;
}

interface PublishResponse {
  courseId: string;
  cloudfrontUrl: string;
  tincanXml: string;
  version: string;
  publishedAt: string;
}

// POST /api/publish/:courseId/unpublish
// Unpublish (archive) a course
```

### Analytics API

```typescript
// GET /api/analytics/courses
// List all courses with analytics summary
interface CoursesAnalyticsResponse {
  courses: CourseAnalyticsSummary[];
}

// GET /api/analytics/courses/:courseId
// Detailed course analytics
interface CourseAnalyticsResponse {
  overview: CourseOverview;
  sections: SectionAnalytics[];
  questions: QuestionAnalytics[];
  objectives: ObjectiveAnalytics[];
  insights: AnalyticsInsight[];
}

// GET /api/analytics/courses/:courseId/effectiveness
// Course effectiveness report
interface EffectivenessReportResponse {
  correlations: ContentQuestionCorrelation[];
  recommendations: Recommendation[];
  trends: TrendData;
}

// GET /api/analytics/courses/:courseId/learners
// Learner-level analytics
interface LearnersAnalyticsResponse {
  learners: LearnerProgress[];
  segments: LearnerSegment[];
}

// POST /api/analytics/insights/:insightId/acknowledge
// Acknowledge an insight
// POST /api/analytics/insights/:insightId/address
// Mark insight as addressed
```

### xAPI Endpoint

```typescript
// POST /api/xapi/statements
// Receive xAPI statements from course player
interface XAPIStatementRequest {
  // Standard xAPI statement format
  actor: Actor;
  verb: Verb;
  object: ActivityObject;
  result?: Result;
  context?: Context;
  timestamp: string;
}

// POST /api/xapi/statements/batch
// Receive batch of xAPI statements
interface XAPIBatchRequest {
  statements: XAPIStatementRequest[];
}
```

### Knowledge Base API

```typescript
// GET /api/knowledge/examples
// List example courses
interface ExamplesListResponse {
  examples: ExampleCourse[];
}

// POST /api/knowledge/examples
// Add new example (from approved course)
interface AddExampleRequest {
  courseId: string;
  qualityScore: number;
  topics: string[];
  industries: string[];
}

// GET /api/knowledge/patterns
// List learned patterns
interface PatternsListResponse {
  patterns: Pattern[];
}

// GET /api/knowledge/components
// List component recipes
interface ComponentsListResponse {
  components: ComponentRecipe[];
}

// PUT /api/knowledge/components/:componentId
// Update component recipe
```

## 4.2 API Authentication

```typescript
// Simple API key authentication for Phase 1
// Header: X-API-Key: <api_key>

// API keys stored in environment or database
interface ApiKey {
  key: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  lastUsedAt: Date;
}
```

---

# PART 5: AGENT SYSTEM DESIGN

## 5.1 Agent Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ORCHESTRATOR AGENT                                 │
│                                                                              │
│  Responsibilities:                                                           │
│  • Receive generation requests                                               │
│  • Coordinate sub-agents                                                     │
│  • Manage workflow state                                                     │
│  • Handle errors and retries                                                 │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐               │
│  │  RESEARCHER   │    │   DESIGNER    │    │   BUILDER     │               │
│  │   AGENT       │───►│    AGENT      │───►│    AGENT      │               │
│  │               │    │               │    │               │               │
│  │ • Web search  │    │ • Design spec │    │ • JSON gen    │               │
│  │ • Source fetch│    │ • Storyboard  │    │ • Component   │               │
│  │ • Synthesize  │    │ • Objectives  │    │   mapping     │               │
│  │               │    │ • Quiz design │    │ • Packaging   │               │
│  └───────────────┘    └───────────────┘    └───────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Agent Prompts

### Researcher Agent System Prompt

```markdown
# RESEARCHER AGENT

You are an expert instructional design researcher. Your job is to research topics
for eLearning course development, gathering accurate, authoritative information
that will be used to create training content.

## Your Responsibilities

1. **Search for authoritative sources** on the given topic
   - Prioritize: Government sources (OSHA, CDC, etc.), industry standards, peer-reviewed content
   - Avoid: Forums, blogs without citations, outdated content (>5 years unless historical)

2. **Extract key information**:
   - Core concepts and definitions
   - Best practices and procedures
   - Common mistakes and misconceptions
   - Statistics and facts (with citations)
   - Regulatory requirements (if applicable)

3. **Organize findings** into a structured format:
   - Main topics (2-4 for a 15-minute course)
   - Key points per topic
   - Supporting details
   - Source citations

## Output Format

Return your research as structured JSON:

```json
{
  "topic": "string",
  "summary": "string",
  "mainTopics": [
    {
      "title": "string",
      "keyPoints": ["string"],
      "details": "string",
      "sources": ["url"]
    }
  ],
  "keyTerms": [
    {"term": "string", "definition": "string"}
  ],
  "commonMisconceptions": [
    {"misconception": "string", "truth": "string"}
  ],
  "statistics": [
    {"stat": "string", "source": "url"}
  ],
  "regulatoryRequirements": [
    {"requirement": "string", "source": "url"}
  ]
}
```

## Guidelines

- Be thorough but focused on what's needed for training
- Always cite sources
- Flag any areas where information is uncertain or conflicting
- Note if the topic requires subject matter expert review
```

### Designer Agent System Prompt

```markdown
# DESIGNER AGENT

You are an expert instructional designer specializing in eLearning course design.
Your job is to transform research into structured learning experiences.

## Your Responsibilities

### Phase A: Design Specification

Create a design spec that includes:

1. **Course Metadata**
   - Title, curriculum association, prerequisites
   - Duration, audience, assessment format

2. **Learning Objectives** (using Bloom's Taxonomy verbs)
   - Use: Define, Recall, Recognize, Identify, Explain, Apply, Demonstrate
   - Each objective must be measurable
   - Group objectives under topics

3. **Content Sources**
   - Link objectives to research sources

4. **Key Terms & Misconceptions**
   - Terms to define
   - Misconceptions to address

### Phase B: Storyboard

Create a detailed storyboard that includes:

1. **Course Introduction**
   - Hook/attention getter
   - Course overview
   - Section preview

2. **For Each Topic Section**
   - Section header content
   - Instructional content with interaction recommendations
   - Practice question(s)

3. **Course Summary**
   - Key takeaways
   - Transition to quiz

4. **Final Quiz**
   - 5 questions minimum
   - Mix of question types
   - Feedback for correct and incorrect
   - 80% pass threshold

## Interaction Selection Rules

Based on content type, recommend:

| Content Type | Item Count | Recommended Component |
|--------------|------------|----------------------|
| Related concepts | 3-4 items | CR3A (Click-Reveal Fullscreen) |
| Related concepts | 5-8 items | ClickRevealGrid |
| Sequential process | 3-6 steps | SS2ACarousel (Slideshow) |
| Single concept with visual | 1 item | ImgSingle2col |
| Definition or explanation | 1 item | H1ALeft |
| Question | 1 item | KcCheckboxAnswerableBuilder |

## Output Format

### Design Spec Output
```json
{
  "metadata": {
    "title": "string",
    "curriculum": "string",
    "prerequisite": "string",
    "duration": "number",
    "audience": "string",
    "assessmentFormat": "string"
  },
  "topics": [
    {
      "title": "string",
      "objectives": [
        {
          "id": "obj-1",
          "text": "string",
          "bloomLevel": "string"
        }
      ],
      "sources": ["url"]
    }
  ],
  "keyTerms": ["string"],
  "misconceptions": ["string"]
}
```

### Storyboard Output
```json
{
  "sections": [
    {
      "sectionId": "section-0.0",
      "type": "intro",
      "title": "Course Introduction",
      "content": "string (HTML)",
      "interactionType": "ImgSingle2col",
      "notes": "string"
    },
    {
      "sectionId": "section-1.1",
      "type": "header",
      "title": "string",
      "content": "string (HTML)",
      "interactionType": "ImgSingle2col",
      "objectiveIds": ["obj-1"]
    },
    {
      "sectionId": "section-1.2",
      "type": "content",
      "title": "string",
      "content": "string (HTML)",
      "interactionType": "CR3A",
      "interactionItems": [
        {
          "itemId": "item-1",
          "label": "string",
          "content": "string (HTML)"
        }
      ],
      "objectiveIds": ["obj-1"]
    },
    {
      "sectionId": "section-1.3",
      "type": "practice",
      "title": "Practice",
      "questionText": "string",
      "questionType": "multiple",
      "answers": [
        {"label": "string", "correct": true},
        {"label": "string", "correct": false}
      ],
      "correctFeedback": "string",
      "incorrectFeedback": "string",
      "objectiveIds": ["obj-1"]
    }
  ],
  "finalQuiz": {
    "questions": [
      {
        "questionId": "q1",
        "questionText": "string",
        "questionType": "single|multiple|true_false",
        "instruction": "string",
        "answers": [
          {"label": "string", "correct": boolean}
        ],
        "correctFeedback": "string",
        "incorrectFeedback": "string",
        "objectiveIds": ["obj-1"],
        "sectionIds": ["section-1.2"],
        "difficulty": "easy|medium|hard"
      }
    ],
    "passPercentage": 80
  }
}
```

## Guidelines

- Every objective must be covered by content AND assessed by at least one question
- Every quiz question must map back to an objective and content section
- Use active, engaging language
- Address misconceptions explicitly in content
- Practice questions prepare for final quiz questions
```

### Builder Agent System Prompt

```markdown
# BUILDER AGENT

You are an expert eLearning developer. Your job is to transform storyboards into
production-ready course JSON that works with the XY course player.

## Your Responsibilities

1. **Generate xy_data.json** - Master course configuration
2. **Generate page_*.json files** - Individual page content
3. **Generate tincan.xml** - xAPI manifest
4. **Generate course-manifest.json** - Analytics mapping

## Component Library

You have access to these components:

### ImgSingle2col
- Use for: Section headers, intro screens
- Key fields: bgImage, content (HTML), allowButton, buttonText, minHeight

### H1ALeft
- Use for: Section introductions, explanations
- Key fields: content (HTML), bgColor, textColor

### CR3A (CR3ABuilder)
- Use for: Click-reveal interactions (3-6 items)
- Key fields: componentBlocks[] with clickTxt, revealTxt, clickBgImg, revealBgImg

### ClickRevealGrid
- Use for: Grid of clickable items (6-12 items)
- Key fields: componentBlocks[] with header, description, img

### SS2ACarousel
- Use for: Slideshow/carousel (3-6 slides)
- Key fields: componentBlocks[] with content, desktopImage, mobileImage

### KcCheckboxAnswerableBuilder
- Use for: Quiz questions
- Key fields: 
  - idQuiz, idQuestion
  - QuestionText, InstructionText
  - answers[] with label, correctAnswer
  - CorrectResponse, InCorrectResponse
  - selectOne (true for single answer)

### CourseCompleteProxy
- Use for: Final results display
- Key fields: sID (quiz reference), passPercentage, bCourseCompleteOnPass

## Output Format

### xy_data.json
```json
{
  "LRS": true,
  "author": "LCAS",
  "client": "string",
  "colorTheme": {
    "theme_group": "string",
    "theme_name": "string",
    "colors": {
      "bodyWrapper": "66,66,66,1",
      "white": "255,255,255,1",
      "grey": "54,54,54,1",
      "black": "40,40,40,1",
      "primary1": "244,244,244,1",
      "primary2": "223,223,223,1",
      "secondary1": "0,102,204,1",
      "secondary2": "0,82,163,1",
      "correct": "50,239,145,1",
      "incorrect": "255,26,79,1"
    }
  },
  "displayNavigation": true,
  "folder": "string",
  "font": [
    {
      "fontName": "Roboto",
      "variants": ["regular", "700", "italic"]
    }
  ],
  "id": "http://XY/COURSE_ID",
  "linear": true,
  "menu": [
    {
      "i": 1,
      "id": "0",
      "json": "page_intro.json",
      "title": "Course Intro"
    }
  ],
  "resume": true,
  "title": "string"
}
```

### Page JSON Structure
```json
{
  "aRows": [
    {
      "InitialRowState": "NORMAL",
      "aCols": [
        {
          "aBlocks": [
            {
              "id": "ComponentId",
              "idPermUnique": "_unique_id",
              "jsonComponent": {
                "component": "ComponentName",
                // component-specific fields
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### tincan.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<tincan xmlns="http://projecttincan.com/tincan.xsd">
  <activities>
    <activity id="http://XY/COURSE_ID" type="http://adlnet.gov/expapi/activities/course">
      <name lang="und">Course Title</name>
      <description lang="und">Course description</description>
      <launch lang="und">build/index.html</launch>
    </activity>
  </activities>
</tincan>
```

### course-manifest.json
```json
{
  "courseId": "http://XY/COURSE_ID",
  "title": "string",
  "version": "1.0",
  "objectives": [
    {
      "id": "obj-1",
      "text": "string",
      "bloomLevel": "string"
    }
  ],
  "contentMap": [
    {
      "sectionId": "section-1.2",
      "pageId": "page_content.json",
      "title": "string",
      "component": "CR3A",
      "objectiveIds": ["obj-1"],
      "interactionItems": [
        {"itemId": "item-1", "label": "string"}
      ]
    }
  ],
  "assessmentMap": {
    "practiceQuestions": [],
    "finalQuiz": [
      {
        "questionId": "q1",
        "objectiveIds": ["obj-1"],
        "sectionIds": ["section-1.2"],
        "difficulty": "medium"
      }
    ]
  }
}
```

## Guidelines

- Generate unique IDs for all components (use timestamp-based: _ko4cgsxh_1)
- Include tracking IDs (idQuiz, idQuestion) for all quiz components
- Map every question to objectives and sections in the manifest
- Use consistent theming throughout
- Include mobile-responsive settings where applicable
- Always include InitialRowState for quiz rows (NORMAL for first, HIDDEN for rest)
```

## 5.3 Component Mapping Rules

```typescript
// src/components/mapper.ts

interface ContentAnalysis {
  type: 'concepts' | 'process' | 'single' | 'comparison' | 'quiz';
  itemCount: number;
  hasVisuals: boolean;
  isSequential: boolean;
}

interface ComponentRecommendation {
  component: string;
  confidence: number;
  reasoning: string;
}

const componentRules: ComponentRule[] = [
  {
    condition: (analysis) => 
      analysis.type === 'concepts' && 
      analysis.itemCount >= 3 && 
      analysis.itemCount <= 4,
    component: 'CR3A',
    confidence: 0.9,
    reasoning: '3-4 related concepts work well with fullscreen click-reveal'
  },
  {
    condition: (analysis) => 
      analysis.type === 'concepts' && 
      analysis.itemCount >= 5 && 
      analysis.itemCount <= 12,
    component: 'ClickRevealGrid',
    confidence: 0.9,
    reasoning: '5-12 items fit well in a grid layout'
  },
  {
    condition: (analysis) => 
      analysis.type === 'process' || 
      (analysis.type === 'concepts' && analysis.isSequential),
    component: 'SS2ACarousel',
    confidence: 0.85,
    reasoning: 'Sequential content benefits from carousel navigation'
  },
  {
    condition: (analysis) => 
      analysis.type === 'single' && 
      analysis.hasVisuals,
    component: 'ImgSingle2col',
    confidence: 0.9,
    reasoning: 'Single concept with visual uses two-column image layout'
  },
  {
    condition: (analysis) => 
      analysis.type === 'single' && 
      !analysis.hasVisuals,
    component: 'H1ALeft',
    confidence: 0.85,
    reasoning: 'Text-only single concept uses heading block'
  },
  {
    condition: (analysis) => 
      analysis.type === 'quiz',
    component: 'KcCheckboxAnswerableBuilder',
    confidence: 1.0,
    reasoning: 'Quiz questions always use checkbox answerable component'
  }
];
```

---

# PART 6: IMPLEMENTATION PLAN

## 6.1 Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: FOUNDATION (Weeks 1-2)                                             │
│ • Project setup, database, basic API                                        │
│ • Seed with Anti-Bullying example                                           │
│ • Manual testing of generation flow                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: AGENT CORE (Weeks 3-4)                                             │
│ • Implement researcher, designer, builder agents                            │
│ • Document generation (DOCX)                                                │
│ • Course JSON generation                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: REVIEW WORKFLOW (Weeks 5-6)                                        │
│ • Review/approval API                                                       │
│ • Corrections capture                                                       │
│ • Simple web UI for review                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: ANALYTICS (Weeks 7-8)                                              │
│ • xAPI endpoint                                                             │
│ • Event processing                                                          │
│ • Analytics aggregation                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: LEARNING SYSTEM (Weeks 9-10)                                       │
│ • Pattern extraction from corrections                                       │
│ • Example library growth                                                    │
│ • Automated insights                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 6: POLISH & DEPLOY (Weeks 11-12)                                      │
│ • Full web interface                                                        │
│ • CloudFront deployment integration                                         │
│ • Documentation and testing                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Phase 1: Foundation

### Week 1: Project Setup

```bash
# Tasks
1. Initialize project structure
2. Set up TypeScript configuration
3. Configure ESLint and Prettier
4. Set up database connection (Neon)
5. Create initial schema migration
6. Set up Render deployment config

# Deliverables
- [ ] Project repository initialized
- [ ] Database schema created
- [ ] Health check endpoint working
- [ ] Deployed to Render (dev environment)
```

### Week 2: Core Infrastructure

```bash
# Tasks
1. Implement Anthropic client wrapper
2. Create base API routes structure
3. Implement authentication middleware
4. Seed database with Anti-Bullying example
5. Create example retrieval service

# Deliverables
- [ ] API framework functional
- [ ] Anti-Bullying example in database
- [ ] Can retrieve example via API
- [ ] Basic error handling in place
```

### Phase 1 Checklist

```typescript
// Verification tests
describe('Phase 1: Foundation', () => {
  it('should connect to database', async () => {
    const result = await db.query('SELECT 1');
    expect(result).toBeDefined();
  });

  it('should return health check', async () => {
    const response = await fetch('/health');
    expect(response.status).toBe(200);
  });

  it('should authenticate API requests', async () => {
    const response = await fetch('/api/test', {
      headers: { 'X-API-Key': 'valid-key' }
    });
    expect(response.status).toBe(200);
  });

  it('should retrieve Anti-Bullying example', async () => {
    const example = await exampleService.getByTitle('Anti-Bullying');
    expect(example).toBeDefined();
    expect(example.storyboard).toBeDefined();
  });
});
```

## 6.3 Phase 2: Agent Core

### Week 3: Research & Design Agents

```bash
# Tasks
1. Implement web search service
2. Implement researcher agent
3. Implement designer agent (design spec generation)
4. Create design spec DOCX template
5. Test with Respiratory Protection input

# Deliverables
- [ ] Researcher agent produces structured research
- [ ] Designer agent produces design spec JSON
- [ ] DOCX generation working
- [ ] Quality comparable to manual design spec
```

### Week 4: Builder Agent

```bash
# Tasks
1. Implement builder agent
2. Create component templates
3. Implement JSON generation for all components
4. Generate tincan.xml
5. Generate course manifest
6. Test full generation pipeline

# Deliverables
- [ ] Builder produces valid xy_data.json
- [ ] Builder produces valid page JSONs
- [ ] Generated course loads in player
- [ ] Manifest includes all correlations
```

### Phase 2 Checklist

```typescript
describe('Phase 2: Agent Core', () => {
  it('should research a topic', async () => {
    const research = await researcherAgent.research('Respiratory Protection');
    expect(research.mainTopics.length).toBeGreaterThan(0);
    expect(research.sources.length).toBeGreaterThan(0);
  });

  it('should generate design spec', async () => {
    const designSpec = await designerAgent.generateDesignSpec(research);
    expect(designSpec.topics.length).toBeGreaterThan(0);
    expect(designSpec.topics[0].objectives.length).toBeGreaterThan(0);
  });

  it('should generate storyboard', async () => {
    const storyboard = await designerAgent.generateStoryboard(designSpec);
    expect(storyboard.sections.length).toBeGreaterThan(0);
    expect(storyboard.finalQuiz.questions.length).toBeGreaterEqual(5);
  });

  it('should build course JSON', async () => {
    const course = await builderAgent.build(storyboard);
    expect(course.xyData).toBeDefined();
    expect(course.pages.length).toBeGreaterThan(0);
    expect(course.tincanXml).toContain('tincan');
  });

  it('should produce valid component JSON', async () => {
    const page = course.pages[0];
    const validation = validatePageJson(page);
    expect(validation.valid).toBe(true);
  });
});
```

## 6.4 Phase 3: Review Workflow

### Week 5: Review API

```bash
# Tasks
1. Implement review endpoints
2. Implement corrections storage
3. Build approval state machine
4. Create correction categorization

# Deliverables
- [ ] Can submit design review via API
- [ ] Can submit storyboard review via API
- [ ] Corrections stored with categorization
- [ ] State transitions work correctly
```

### Week 6: Review Interface

```bash
# Tasks
1. Create simple web UI for review
2. Display generated content
3. Allow inline corrections
4. Show approval/rejection flow

# Deliverables
- [ ] Can view design spec in browser
- [ ] Can view storyboard in browser
- [ ] Can submit corrections via UI
- [ ] Can approve/reject via UI
```

## 6.5 Phase 4: Analytics

### Week 7: xAPI Processing

```bash
# Tasks
1. Implement xAPI endpoint
2. Implement statement validation
3. Implement event processing
4. Store raw and processed events

# Deliverables
- [ ] xAPI endpoint receives statements
- [ ] Statements validated and stored
- [ ] Events processed into learning_events
- [ ] Can query events by course/user
```

### Week 8: Analytics Aggregation

```bash
# Tasks
1. Implement section analytics aggregation
2. Implement question analytics aggregation
3. Implement objective mastery tracking
4. Create analytics API endpoints

# Deliverables
- [ ] Section metrics calculated
- [ ] Question metrics calculated
- [ ] Objective mastery tracked
- [ ] Analytics queryable via API
```

## 6.6 Phase 5: Learning System

### Week 9: Pattern Extraction

```bash
# Tasks
1. Implement correction pattern analysis
2. Extract rules from repeated corrections
3. Apply patterns to new generations
4. Track pattern effectiveness

# Deliverables
- [ ] Patterns extracted from corrections
- [ ] Patterns applied during generation
- [ ] Pattern confidence updated
- [ ] Can view/manage patterns via API
```

### Week 10: Automated Insights

```bash
# Tasks
1. Implement insight detection rules
2. Generate insights from analytics
3. Create insight recommendations
4. Build insight management flow

# Deliverables
- [ ] Low engagement detected
- [ ] Difficult questions flagged
- [ ] Content gaps identified
- [ ] Insights queryable via API
```

## 6.7 Phase 6: Polish & Deploy

### Week 11: Full Interface

```bash
# Tasks
1. Complete web interface
2. Add course listing/management
3. Add analytics dashboard
4. Add generation request form

# Deliverables
- [ ] Full course management UI
- [ ] Analytics dashboard
- [ ] Generation workflow UI
- [ ] Responsive design
```

### Week 12: Deployment & Documentation

```bash
# Tasks
1. CloudFront deployment integration
2. Production environment setup
3. Documentation
4. Final testing

# Deliverables
- [ ] Courses deploy to CloudFront
- [ ] Production environment stable
- [ ] API documentation complete
- [ ] User guide created
```

---

# PART 7: CONFIGURATION & DEPLOYMENT

## 7.1 Environment Variables

```bash
# .env.example

# Database
DATABASE_URL=postgresql://user:password@host:5432/lcas

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Authentication
API_KEY_SECRET=your-secret-for-hashing-api-keys

# AWS (for CloudFront deployment)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET=lcas-courses
CLOUDFRONT_DISTRIBUTION_ID=...

# External Services
THRIVE_API_URL=https://thrive-backend-57nj.onrender.com

# Application
NODE_ENV=development
PORT=10000
LOG_LEVEL=debug
```

## 7.2 Render Configuration

```yaml
# render.yaml

services:
  - type: web
    name: lcas-api
    env: node
    region: ohio
    plan: standard
    buildCommand: npm ci && npm run build
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: lcas-db
          property: connectionString
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: API_KEY_SECRET
        generateValue: true
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: AWS_REGION
        value: us-east-1
      - key: S3_BUCKET
        sync: false
      - key: CLOUDFRONT_DISTRIBUTION_ID
        sync: false

databases:
  - name: lcas-db
    databaseName: lcas
    user: lcas
    plan: starter
```

## 7.3 Package.json

```json
{
  "name": "lcas",
  "version": "1.0.0",
  "description": "Learning Content Agent System",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:seed": "tsx scripts/seed-examples.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "@aws-sdk/client-s3": "^3.400.0",
    "@aws-sdk/client-cloudfront": "^3.400.0",
    "archiver": "^6.0.0",
    "docx": "^8.2.0",
    "express": "^5.0.0",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "pg": "^8.11.0",
    "uuid": "^9.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/archiver": "^6.0.0",
    "@types/express": "^4.17.20",
    "@types/morgan": "^1.9.0",
    "@types/node": "^20.0.0",
    "@types/pg": "^8.10.0",
    "@types/uuid": "^9.0.0",
    "eslint": "^8.50.0",
    "tsx": "^4.0.0",
    "typescript": "^5.2.0",
    "vitest": "^1.0.0"
  }
}
```

## 7.4 TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

# PART 8: EXAMPLE DATA

## 8.1 Anti-Bullying Gold Standard

The Anti-Bullying course serves as the primary example. The following JSON structures
are derived from the actual course package and should be seeded into the database.

### Parsed Design Spec

```json
{
  "metadata": {
    "title": "Anti-Bullying",
    "curriculum": "Embark Onboarding",
    "prerequisite": null,
    "duration": 15,
    "audience": "Employees, managers",
    "assessmentFormat": "Multiple Choice In-Course Assessment",
    "client": "HR Compliance",
    "designer": "Aric Davis"
  },
  "performanceStatement": "Employees and managers will understand how to recognize and prevent bullying in the workplace.",
  "topics": [
    {
      "id": "topic-1",
      "title": "Defining Bullying",
      "objectives": [
        {"id": "obj-1", "text": "Define bullying", "bloomLevel": "remember"},
        {"id": "obj-2", "text": "Recognize the differences between bullying, aggression, and passive aggression", "bloomLevel": "understand"},
        {"id": "obj-3", "text": "Recall why bullying occurs", "bloomLevel": "remember"},
        {"id": "obj-4", "text": "Recognize types of bullying", "bloomLevel": "understand"},
        {"id": "obj-5", "text": "Recognize who is most likely to be bullied", "bloomLevel": "understand"}
      ],
      "sources": [
        "https://www.healthline.com/health/workplace-bullying",
        "https://www.themuse.com/advice/how-to-deal-with-workplace-bullies",
        "https://www.thebalancecareers.com/types-of-bullying-2164322"
      ]
    },
    {
      "id": "topic-2",
      "title": "Preventing Bullying",
      "objectives": [
        {"id": "obj-6", "text": "Recall the negative effects of bullying", "bloomLevel": "remember"},
        {"id": "obj-7", "text": "Recall basic bullying prevention techniques for employees", "bloomLevel": "remember"},
        {"id": "obj-8", "text": "Recall basic bullying prevention techniques for managers/HR", "bloomLevel": "remember"},
        {"id": "obj-9", "text": "Recognize strategies to prevent escalation", "bloomLevel": "understand"}
      ],
      "sources": [
        "https://www.crisisprevention.com/Blog/Strategies-to-Stop-Workplace-Bullying",
        "https://www.worksafe.vic.gov.au/preventing-workplace-bullying",
        "https://hrdailyadvisor.blr.com/2019/10/10/strategies-to-reduce-workplace-bullying/"
      ]
    }
  ],
  "keyTerms": ["Respirator", "PPE"],
  "misconceptions": [
    "Respirators are uncomfortable",
    "You don't always need a respirator in a posted area",
    "You don't need to be trained to wear a respirator",
    "You can't/can have a beard while wearing a respirator"
  ]
}
```

### Component Usage Examples

```json
{
  "componentExamples": {
    "ImgSingle2col": {
      "useCase": "Course introduction with background image",
      "example": {
        "component": "ImgSingle2col",
        "bgImage": "../xy/AssetLibrary/anti-bully_intro_a.jpg",
        "content": "<h1><strong style=\"color: rgb(255, 196, 0);\">Anti-Bullying</strong></h1><p>Bullying in the workforce is toxic behavior...</p>",
        "allowButton": true,
        "buttonText": "Begin",
        "minHeight": "r-1-10"
      }
    },
    "CR3A": {
      "useCase": "4 related concepts with click-reveal",
      "example": {
        "component": "CR3ABuilder",
        "componentBlocks": [
          {
            "clickTxt": {"value": "<h3><strong>Bullying</strong></h3>"},
            "revealTxt": {"value": "<h3><strong>Bullying</strong></h3><p>Bullying is a repeated act meant to intimidate...</p>"},
            "clickBgImg": {"value": "../xy/AssetLibrary/click_2.jpg"},
            "revealBgImg": {"value": "../xy/AssetLibrary/click2a.jpg"}
          }
        ]
      }
    },
    "SS2ACarousel": {
      "useCase": "Sequential slides for 'Why Bullying Happens'",
      "example": {
        "component": "SS2ACarousel",
        "componentBlocks": [
          {
            "content": "<h3><strong>Skill Disparities</strong></h3><p>Sometimes, employees will exhibit a skillset...</p>",
            "desktopImage": {"value": "../xy/AssetLibrary/ss1c.jpg"}
          }
        ]
      }
    },
    "ClickRevealGrid": {
      "useCase": "12 types of bullying in grid format",
      "example": {
        "component": "ClickRevealGrid",
        "componentBlocks": [
          {
            "header": {"value": "<h3><strong>Threatening</strong></h3>"},
            "description": {"value": "<p>Making threats or behaving in an intimidating manner.</p>"},
            "img": "../xy/AssetLibrary/cr_down_7.png",
            "columns": {"value": "3"}
          }
        ]
      }
    },
    "KcCheckboxAnswerableBuilder": {
      "useCase": "Final quiz question",
      "example": {
        "component": "KcCheckboxAnswerableBuilder",
        "idQuiz": "finalQuiz",
        "idQuestion": "q1",
        "QuestionText": "<p>Question 1 of 5</p><h3>Marlo was tired of dealing with HR issues...</h3>",
        "answers": [
          {"label": "Set a good example", "correctAnswer": true},
          {"label": "Take complaints seriously", "correctAnswer": true},
          {"label": "Engage with a third party", "correctAnswer": true},
          {"label": "Fire any employee who is bullying others", "correctAnswer": false}
        ],
        "selectOne": false,
        "CorrectResponse": "<h1><span style=\"color: rgb(50, 239, 145);\">That's correct!</span></h1>...",
        "InCorrectResponse": "<h1><span style=\"color: rgb(255, 26, 79);\">Not quite.</span></h1>..."
      }
    }
  }
}
```

---

# PART 9: TESTING STRATEGY

## 9.1 Unit Tests

```typescript
// tests/unit/agents/designer.test.ts
describe('Designer Agent', () => {
  describe('generateObjectives', () => {
    it('should use Bloom taxonomy verbs', () => {
      const objectives = generateObjectives(topic);
      objectives.forEach(obj => {
        expect(BLOOM_VERBS).toContain(obj.text.split(' ')[0]);
      });
    });

    it('should cover all content points', () => {
      const objectives = generateObjectives(topic);
      expect(objectives.length).toBeGreaterThanOrEqual(topic.keyPoints.length);
    });
  });

  describe('selectComponent', () => {
    it('should select CR3A for 3-4 concepts', () => {
      const result = selectComponent({ type: 'concepts', itemCount: 4 });
      expect(result.component).toBe('CR3A');
    });

    it('should select ClickRevealGrid for 5+ concepts', () => {
      const result = selectComponent({ type: 'concepts', itemCount: 8 });
      expect(result.component).toBe('ClickRevealGrid');
    });

    it('should select SS2ACarousel for sequential content', () => {
      const result = selectComponent({ type: 'process', itemCount: 5 });
      expect(result.component).toBe('SS2ACarousel');
    });
  });
});
```

## 9.2 Integration Tests

```typescript
// tests/integration/generation.test.ts
describe('Course Generation', () => {
  it('should generate complete course from topic', async () => {
    const result = await generateCourse({
      topic: 'Fire Safety',
      format: 'elearning',
      audience: 'All employees',
      durationMinutes: 15
    });

    expect(result.designSpec).toBeDefined();
    expect(result.storyboard).toBeDefined();
    expect(result.coursePackage).toBeDefined();
    expect(result.coursePackage.xyData.menu.length).toBeGreaterThan(0);
  });

  it('should produce valid JSON for player', async () => {
    const result = await generateCourse({ /* ... */ });
    
    // Validate xy_data.json
    const xyValidation = validateXYData(result.coursePackage.xyData);
    expect(xyValidation.valid).toBe(true);
    
    // Validate each page
    result.coursePackage.pages.forEach(page => {
      const pageValidation = validatePageJson(page.json);
      expect(pageValidation.valid).toBe(true);
    });
  });

  it('should include all objective-question correlations', async () => {
    const result = await generateCourse({ /* ... */ });
    const manifest = result.coursePackage.manifest;
    
    // Every objective should have at least one question
    manifest.objectives.forEach(obj => {
      const hasQuestion = manifest.assessmentMap.finalQuiz.some(
        q => q.objectiveIds.includes(obj.id)
      );
      expect(hasQuestion).toBe(true);
    });
  });
});
```

## 9.3 End-to-End Tests

```typescript
// tests/e2e/workflow.test.ts
describe('Full Workflow', () => {
  it('should complete generation and review workflow', async () => {
    // 1. Start generation
    const startResponse = await api.post('/api/generation/start', {
      topic: 'Respiratory Protection',
      format: 'elearning',
      audience: 'Production personnel',
      durationMinutes: 15
    });
    expect(startResponse.status).toBe(201);
    const { courseId } = startResponse.data;

    // 2. Generate design spec
    const designResponse = await api.post(`/api/generation/${courseId}/design-spec`);
    expect(designResponse.status).toBe(200);
    expect(designResponse.data.designSpec).toBeDefined();

    // 3. Approve design spec
    const designApproval = await api.post(`/api/review/${courseId}/design`, {
      approved: true
    });
    expect(designApproval.status).toBe(200);

    // 4. Generate storyboard
    const storyboardResponse = await api.post(`/api/generation/${courseId}/storyboard`);
    expect(storyboardResponse.status).toBe(200);

    // 5. Approve storyboard
    const storyboardApproval = await api.post(`/api/review/${courseId}/storyboard`, {
      approved: true
    });
    expect(storyboardApproval.status).toBe(200);

    // 6. Build course
    const buildResponse = await api.post(`/api/generation/${courseId}/build`);
    expect(buildResponse.status).toBe(200);
    expect(buildResponse.data.packageUrl).toBeDefined();

    // 7. Publish
    const publishResponse = await api.post(`/api/publish/${courseId}`);
    expect(publishResponse.status).toBe(200);
    expect(publishResponse.data.cloudfrontUrl).toBeDefined();
  });
});
```

---

# PART 10: SUCCESS CRITERIA

## 10.1 Phase Completion Criteria

### Phase 1: Foundation
- [ ] Database schema deployed and verified
- [ ] API health check returns 200
- [ ] Anti-Bullying example seeded and retrievable
- [ ] Deployed to Render successfully

### Phase 2: Agent Core
- [ ] Generate design spec for Respiratory Protection
- [ ] Design spec quality matches manual example
- [ ] Generate storyboard with proper structure
- [ ] Generate course JSON that loads in player
- [ ] All components render correctly

### Phase 3: Review Workflow
- [ ] Submit and retrieve corrections via API
- [ ] State transitions work correctly
- [ ] Review UI displays generated content
- [ ] Corrections stored with categorization

### Phase 4: Analytics
- [ ] xAPI statements received and stored
- [ ] Events processed correctly
- [ ] Section/question metrics calculated
- [ ] Analytics API returns correct data

### Phase 5: Learning System
- [ ] Patterns extracted from corrections
- [ ] Patterns applied to new generations
- [ ] Insights generated from analytics
- [ ] Insights queryable via API

### Phase 6: Polish
- [ ] Full UI functional
- [ ] CloudFront deployment works
- [ ] Documentation complete
- [ ] All tests passing

## 10.2 Quality Metrics

### Generation Quality
- Design spec matches template structure: 100%
- Objectives use correct Bloom verbs: 100%
- All objectives covered by content: 100%
- All objectives assessed by questions: 100%
- Component selection accuracy: >80%
- Quiz question quality (human rating): >4/5

### Technical Quality
- API response time: <2s for simple queries
- Generation time: <5 minutes for full course
- Test coverage: >80%
- Zero critical security vulnerabilities

### Analytics Accuracy
- Event processing accuracy: >99%
- Metric calculations verified: 100%
- Correlation accuracy: >95%

---

# APPENDIX A: GLOSSARY

| Term | Definition |
|------|------------|
| **LCAS** | Learning Content Agent System - this project |
| **xy_data.json** | Master course configuration file for XY player |
| **xAPI** | Experience API (Tin Can) - learning tracking standard |
| **SCORM** | Sharable Content Object Reference Model - legacy LMS standard |
| **LRS** | Learning Record Store - xAPI statement storage |
| **Bloom's Taxonomy** | Framework for categorizing educational objectives |
| **Component** | Reusable UI element in the course player |
| **Design Spec** | High-level course blueprint with objectives |
| **Storyboard** | Detailed content script for course development |

---

# APPENDIX B: REFERENCE LINKS

- Anthropic API Documentation: https://docs.anthropic.com
- xAPI Specification: https://xapi.com/specification
- SCORM Reference: https://scorm.com/scorm-explained
- Bloom's Taxonomy: https://www.bloomstaxonomy.net
- Neon Documentation: https://neon.tech/docs
- Render Documentation: https://render.com/docs

---

# APPENDIX C: CONTACT & SUPPORT

**Project Owner:** Jeremy Erard
**Infrastructure:** Render, Neon, CloudFront (existing accounts)
**LLM Provider:** Anthropic (existing API key)

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Generated for Claude Code implementation*
