// Jest setup file for @epoch/web

// Mock environment variables for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.OPENAI_API_KEY = 'sk-test-key-for-testing-purposes-only';
process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_test_token';
process.env.RESEND_API_KEY = 're_test_key';
process.env.NEXTAUTH_SECRET = 'test-secret-at-least-32-characters-long';
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_APP_NAME = 'Epoch Pod Test';

// Extend Jest matchers
require('@testing-library/jest-dom');

// Mock console.log to reduce noise in tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
// };
