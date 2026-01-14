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
    course_id VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Classification
    format VARCHAR(50) NOT NULL,
    curriculum VARCHAR(255),
    client VARCHAR(255),

    -- Target
    audience TEXT,
    duration_minutes INT,
    prerequisite VARCHAR(255),

    -- Status workflow
    status VARCHAR(50) NOT NULL DEFAULT 'draft',

    -- Content (stored as JSONB for flexibility)
    design_spec JSONB,
    storyboard JSONB,
    course_config JSONB,
    course_manifest JSONB,

    -- Generation metadata
    generation_request JSONB,
    generation_log JSONB[],

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

-- Course pages
CREATE TABLE course_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    page_index INT NOT NULL,
    page_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,

    page_json JSONB NOT NULL,

    section_ids TEXT[],
    objective_ids TEXT[],
    component_types TEXT[],

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(course_id, page_index)
);

-- Course objectives
CREATE TABLE course_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    objective_id VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    bloom_level VARCHAR(50),
    topic VARCHAR(255),

    section_ids TEXT[],
    question_ids TEXT[],

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(course_id, objective_id)
);

-- Course questions
CREATE TABLE course_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    question_id VARCHAR(100) NOT NULL,
    quiz_id VARCHAR(100) NOT NULL,
    question_type VARCHAR(50) NOT NULL,

    question_text TEXT NOT NULL,
    instruction_text TEXT,

    answers JSONB NOT NULL,
    correct_feedback TEXT,
    incorrect_feedback TEXT,

    objective_ids TEXT[],
    section_ids TEXT[],

    difficulty VARCHAR(20),
    discrimination_index FLOAT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(course_id, question_id)
);

-- Course sections
CREATE TABLE course_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    section_id VARCHAR(100) NOT NULL,
    page_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,

    component_type VARCHAR(50) NOT NULL,
    interaction_items JSONB,

    objective_ids TEXT[],

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(course_id, section_id)
);

-- ============================================================================
-- KNOWLEDGE BASE TABLES
-- ============================================================================

-- Example courses (gold standards for few-shot learning)
CREATE TABLE example_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    title VARCHAR(255) NOT NULL,
    format VARCHAR(50) NOT NULL,

    topics TEXT[],
    industries TEXT[],
    components_used TEXT[],

    design_spec JSONB,
    storyboard JSONB,
    course_config JSONB,
    sample_pages JSONB,

    quality_score FLOAT,
    times_used INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Corrections log
CREATE TABLE corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,

    correction_type VARCHAR(50) NOT NULL,
    location VARCHAR(255),

    original_value TEXT NOT NULL,
    corrected_value TEXT NOT NULL,
    correction_reason TEXT,

    pattern_extracted BOOLEAN DEFAULT FALSE,
    extracted_pattern_id UUID,

    corrected_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Patterns
CREATE TABLE patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    pattern_type VARCHAR(50) NOT NULL,
    condition TEXT NOT NULL,
    rule TEXT NOT NULL,

    positive_examples JSONB,
    negative_examples JSONB,

    confidence FLOAT DEFAULT 0.5,
    times_applied INT DEFAULT 0,
    times_successful INT DEFAULT 0,

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Component recipes
CREATE TABLE component_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    component_id VARCHAR(100) NOT NULL UNIQUE,
    component_name VARCHAR(255) NOT NULL,
    description TEXT,

    use_when JSONB NOT NULL,

    config_template JSONB NOT NULL,
    required_fields TEXT[],
    optional_fields TEXT[],

    example_configs JSONB[],

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    filename VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,

    s3_key VARCHAR(512) NOT NULL,
    cloudfront_url VARCHAR(512),
    file_size_bytes INT,
    mime_type VARCHAR(100),

    tags TEXT[],
    topics TEXT[],
    mood VARCHAR(50),

    times_used INT DEFAULT 0,
    last_used_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Raw xAPI statements
CREATE TABLE xapi_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    statement_id UUID UNIQUE,

    actor_name VARCHAR(255),
    actor_mbox VARCHAR(255),
    actor_account JSONB,

    verb_id VARCHAR(255) NOT NULL,
    verb_display VARCHAR(100),

    object_id VARCHAR(512) NOT NULL,
    object_type VARCHAR(100),
    object_definition JSONB,

    result_success BOOLEAN,
    result_completion BOOLEAN,
    result_score JSONB,
    result_duration VARCHAR(50),
    result_response TEXT,
    result_extensions JSONB,

    context_registration UUID,
    context_extensions JSONB,
    context_activities JSONB,

    raw_statement JSONB NOT NULL,

    statement_timestamp TIMESTAMP NOT NULL,
    stored_at TIMESTAMP DEFAULT NOW()
);

-- Processed learning events
CREATE TABLE learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    course_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    registration_id UUID,

    event_type VARCHAR(50) NOT NULL,

    object_id VARCHAR(512) NOT NULL,
    object_type VARCHAR(50),

    page_id VARCHAR(100),
    section_id VARCHAR(100),
    component_type VARCHAR(50),

    objective_ids TEXT[],
    question_id VARCHAR(100),

    success BOOLEAN,
    score FLOAT,
    duration_seconds INT,

    items_viewed INT,
    total_items INT,
    response TEXT,

    event_timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for learning_events
CREATE INDEX idx_learning_events_course ON learning_events(course_id);
CREATE INDEX idx_learning_events_user ON learning_events(user_id);
CREATE INDEX idx_learning_events_type ON learning_events(event_type);
CREATE INDEX idx_learning_events_section ON learning_events(section_id);
CREATE INDEX idx_learning_events_timestamp ON learning_events(event_timestamp);

-- Section analytics
CREATE TABLE section_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) NOT NULL,
    section_id VARCHAR(100) NOT NULL,

    total_views INT DEFAULT 0,
    unique_viewers INT DEFAULT 0,
    total_completions INT DEFAULT 0,
    completion_rate FLOAT,

    total_duration_seconds BIGINT DEFAULT 0,
    avg_duration_seconds FLOAT,
    min_duration_seconds INT,
    max_duration_seconds INT,

    avg_items_viewed FLOAT,
    full_completion_rate FLOAT,

    related_question_ids TEXT[],
    avg_related_question_score FLOAT,

    first_view_at TIMESTAMP,
    last_view_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(course_id, section_id)
);

-- Question analytics
CREATE TABLE question_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) NOT NULL,
    question_id VARCHAR(100) NOT NULL,

    total_attempts INT DEFAULT 0,
    unique_attempters INT DEFAULT 0,
    first_attempt_correct INT DEFAULT 0,
    eventually_correct INT DEFAULT 0,

    success_rate FLOAT,
    first_attempt_success_rate FLOAT,
    avg_attempts_to_correct FLOAT,

    total_duration_seconds BIGINT DEFAULT 0,
    avg_duration_seconds FLOAT,

    answer_distribution JSONB,

    discrimination_index FLOAT,
    difficulty_index FLOAT,

    related_section_ids TEXT[],
    avg_related_section_completion FLOAT,

    first_attempt_at TIMESTAMP,
    last_attempt_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(course_id, question_id)
);

-- Objective mastery
CREATE TABLE objective_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    objective_id VARCHAR(100) NOT NULL,

    content_sections_completed INT DEFAULT 0,
    content_sections_total INT DEFAULT 0,
    content_completion_rate FLOAT,
    content_duration_seconds INT DEFAULT 0,

    questions_attempted INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    assessment_score FLOAT,

    mastery_score FLOAT,
    mastery_level VARCHAR(20),

    first_interaction_at TIMESTAMP,
    last_interaction_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(course_id, user_id, objective_id)
);

-- Course analytics
CREATE TABLE course_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) UNIQUE NOT NULL,

    total_starts INT DEFAULT 0,
    total_completions INT DEFAULT 0,
    completion_rate FLOAT,

    total_passes INT DEFAULT 0,
    total_fails INT DEFAULT 0,
    pass_rate FLOAT,
    avg_score FLOAT,
    score_std_dev FLOAT,

    avg_duration_seconds FLOAT,
    median_duration_seconds INT,

    avg_content_completion FLOAT,

    recent_completion_rate FLOAT,
    recent_pass_rate FLOAT,
    recent_avg_score FLOAT,

    first_start_at TIMESTAMP,
    last_completion_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics insights
CREATE TABLE analytics_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) NOT NULL,

    insight_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    affected_elements JSONB,

    metrics JSONB NOT NULL,
    threshold_violated VARCHAR(255),

    recommendation TEXT,
    recommended_action VARCHAR(50),

    status VARCHAR(20) DEFAULT 'new',
    addressed_at TIMESTAMP,
    addressed_by VARCHAR(255),
    resolution_notes TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- VIEWS
-- ============================================================================

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
