// Setup file for tests
// Basic setup for Vitest

// Mock window object for tests that need it
if (typeof window !== 'undefined') {
  // Window is available
}

// Mock console methods if needed
global.console = {
  ...console,
  // Uncomment to silence console in tests
  // log: vi.fn(),
  // error: vi.fn(),
  // warn: vi.fn(),
}

