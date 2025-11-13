/**
 * Application Constants
 *
 * This module contains all magic numbers and configuration values
 * used throughout the application. Centralizing these values makes
 * the codebase more maintainable and easier to configure.
 */

/**
 * Audio Generation Constants
 */
export const AUDIO = {
  // Duration limits
  MIN_EPISODE_DURATION: 300, // 5 minutes in seconds
  MAX_EPISODE_DURATION: 3600, // 1 hour in seconds
  DEFAULT_TARGET_DURATION: 1200, // 20 minutes in seconds

  // Speech parameters
  WORDS_PER_MINUTE: 150,
  CHARACTERS_PER_WORD: 5,

  // Pause durations (in seconds)
  PAUSE_BETWEEN_SPEAKERS: 0.5,
  PAUSE_BETWEEN_SECTIONS: 1.0,
  PAUSE_BETWEEN_SEGMENTS: 0.3,

  // Sample rate
  SAMPLE_RATE: 24000,
  CHANNELS: 1,

  // File formats
  MIME_TYPE: "audio/mpeg",
  FILE_EXTENSION: ".mp3",
} as const;

/**
 * OpenAI API Constants
 */
export const OPENAI = {
  // Models
  DEFAULT_MODEL: "gpt-4o",
  DEFAULT_TTS_MODEL: "tts-1-hd",

  // Retry configuration
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000, // 1 second
  MAX_RETRY_DELAY: 10000, // 10 seconds
  RETRY_BACKOFF_MULTIPLIER: 2,

  // Token limits
  MAX_COMPLETION_TOKENS: 4096,
  MAX_OUTLINE_TOKENS: 2000,
  MAX_SCRIPT_TOKENS: 4000,

  // Temperature settings
  DEFAULT_TEMPERATURE: 0.7,
  CREATIVE_TEMPERATURE: 0.9,
  PRECISE_TEMPERATURE: 0.3,
} as const;

/**
 * Rate Limiting Constants
 */
export const RATE_LIMITS = {
  // General API
  GENERAL_LIMIT: 100,
  GENERAL_WINDOW: 60000, // 1 minute

  // AI Generation
  AI_GENERATION_LIMIT: 10,
  AI_GENERATION_WINDOW: 3600000, // 1 hour

  // Authentication
  AUTH_LIMIT: 5,
  AUTH_WINDOW: 60000, // 1 minute

  // Interactions (voting, etc.)
  INTERACTION_LIMIT: 20,
  INTERACTION_WINDOW: 60000, // 1 minute
} as const;

/**
 * Episode Generation Constants
 */
export const EPISODE = {
  // Validation limits
  MIN_TOPIC_LENGTH: 1,
  MAX_TOPIC_LENGTH: 500,
  MAX_ADDITIONAL_CONTEXT_LENGTH: 1000,

  // Narrative structure
  DEFAULT_SECTIONS: 5,
  MIN_SECTIONS: 3,
  MAX_SECTIONS: 8,

  // Interview structure
  DEFAULT_QUESTIONS: 6,
  MIN_QUESTIONS: 4,
  MAX_QUESTIONS: 10,

  // Debate structure
  DEFAULT_ROUNDS: 3,
  MIN_ROUNDS: 2,
  MAX_ROUNDS: 5,

  // Adventure structure
  DEFAULT_NODES: 10,
  MIN_NODES: 5,
  MAX_NODES: 20,
  CHOICES_PER_NODE: 2,
  MAX_CHOICES_PER_NODE: 4,
} as const;

/**
 * Database Constants
 */
export const DATABASE = {
  // Batch sizes
  DEFAULT_BATCH_SIZE: 100,
  MAX_BATCH_SIZE: 1000,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Query timeouts
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  LONG_QUERY_TIMEOUT: 60000, // 1 minute
} as const;

/**
 * Email Constants
 */
export const EMAIL = {
  // Token expiration
  UNSUBSCRIBE_TOKEN_EXPIRY_DAYS: 30,
  VERIFICATION_TOKEN_EXPIRY_HOURS: 24,

  // Digest cadences
  CADENCES: {
    IMMEDIATE: "immediate",
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
  },

  // Limits
  MAX_REASONING_LENGTH: 1000,
} as const;

/**
 * File Upload Constants
 */
export const UPLOAD = {
  // Size limits (in bytes)
  MAX_AUDIO_SIZE: 100 * 1024 * 1024, // 100 MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10 MB

  // Allowed file types
  ALLOWED_AUDIO_TYPES: ["audio/mpeg", "audio/mp3", "audio/wav"],
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

/**
 * Session Constants
 */
export const SESSION = {
  // Cookie settings
  DEBATE_SESSION_COOKIE: "debate_session",
  DEBATE_SESSION_MAX_AGE: 60 * 60 * 24 * 365, // 1 year

  // Session timeouts
  DEFAULT_TIMEOUT: 60 * 60 * 24 * 7, // 7 days
  MAX_TIMEOUT: 60 * 60 * 24 * 30, // 30 days
} as const;

/**
 * Caching Constants
 */
export const CACHE = {
  // TTL (Time To Live) in seconds
  SHORT_TTL: 60, // 1 minute
  MEDIUM_TTL: 300, // 5 minutes
  LONG_TTL: 3600, // 1 hour
  DAY_TTL: 86400, // 24 hours

  // Cache keys
  KEYS: {
    RSS_FEED: "rss:feed",
    SHOW_METADATA: "show:metadata",
    EPISODE_LIST: "episode:list",
    DEBATE_VOTES: "debate:votes",
  },
} as const;

/**
 * Podcast RSS Constants
 */
export const PODCAST = {
  // Artwork requirements
  MIN_ARTWORK_SIZE: 1400,
  MAX_ARTWORK_SIZE: 3000,
  ARTWORK_ASPECT_RATIO: 1, // Square

  // Feed settings
  DEFAULT_LANGUAGE: "en-us",
  DEFAULT_CATEGORY: "History",
  DEFAULT_EXPLICIT: false,

  // Episode limits
  MAX_EPISODES_IN_FEED: 100,
} as const;

/**
 * Adventure Constants
 */
export const ADVENTURE = {
  // Node types
  NODE_TYPES: {
    START: "START",
    DECISION: "DECISION",
    STORY: "STORY",
    ENDING: "ENDING",
  },

  // Ending types
  ENDING_TYPES: {
    VICTORY: "victory",
    DEFEAT: "defeat",
    NEUTRAL: "neutral",
    BITTERSWEET: "bittersweet",
  },

  // Limits
  MAX_PATH_HISTORY_LENGTH: 50,
  MAX_CHOICE_TEXT_LENGTH: 200,
  MAX_CONSEQUENCE_LENGTH: 500,
} as const;

/**
 * HTTP Status Codes
 * Standard HTTP status codes for consistency
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Application-wide timeouts
 */
export const TIMEOUTS = {
  // API timeouts
  DEFAULT_API_TIMEOUT: 30000, // 30 seconds
  GENERATION_API_TIMEOUT: 300000, // 5 minutes
  UPLOAD_TIMEOUT: 60000, // 1 minute

  // Background job timeouts
  SHORT_JOB_TIMEOUT: 60000, // 1 minute
  MEDIUM_JOB_TIMEOUT: 300000, // 5 minutes
  LONG_JOB_TIMEOUT: 900000, // 15 minutes
} as const;

/**
 * Validation Patterns
 */
export const VALIDATION = {
  // Email pattern
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // URL pattern
  URL_PATTERN: /^https?:\/\/.+/,

  // IPv4 pattern
  IPV4_PATTERN: /^(?:\d{1,3}\.){3}\d{1,3}$/,

  // IPv6 pattern
  IPV6_PATTERN: /^[0-9a-f:]+$/i,

  // Slug pattern
  SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

/**
 * Error Messages
 * Common error messages used throughout the app
 */
export const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: "Authentication required",
  INVALID_CREDENTIALS: "Invalid email or password",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",

  // Authorization
  FORBIDDEN: "You don't have permission to access this resource",

  // Validation
  INVALID_INPUT: "Invalid input provided",
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Invalid email address",
  INVALID_URL: "Invalid URL",

  // Resources
  NOT_FOUND: "Resource not found",
  ALREADY_EXISTS: "Resource already exists",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",

  // External services
  OPENAI_ERROR: "AI service is temporarily unavailable",
  UPLOAD_ERROR: "File upload failed",
  DATABASE_ERROR: "Database operation failed",

  // Generation
  GENERATION_FAILED: "Content generation failed. Please try again.",
  INVALID_TOPIC: "Please provide a valid topic",

  // Generic
  INTERNAL_ERROR: "An unexpected error occurred. Please try again.",
  MAINTENANCE: "Service is currently under maintenance",
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  // Episode
  EPISODE_CREATED: "Episode created successfully",
  EPISODE_UPDATED: "Episode updated successfully",
  EPISODE_DELETED: "Episode deleted successfully",

  // Vote
  VOTE_RECORDED: "Vote recorded successfully",
  VOTE_UPDATED: "Vote updated successfully",

  // Subscription
  SUBSCRIBED: "You've been subscribed successfully",
  UNSUBSCRIBED: "You've been unsubscribed successfully",

  // Generic
  SUCCESS: "Operation completed successfully",
} as const;
