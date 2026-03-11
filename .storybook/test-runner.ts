/**
 * Storybook Test Runner Configuration
 *
 * This configuration runs automated tests against all stories to catch
 * console errors and warnings that may indicate bugs.
 */

import type { TestRunnerConfig } from '@storybook/test-runner';

// Track errors per story
const storyErrors = new Map<string, string[]>();

/**
 * Errors/warnings to ignore (intentional test infrastructure)
 */
const IGNORED_ERROR_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // MSW mock API errors (intentional for testing error states)
  { pattern: /Failed to load resource.*status of (4\d{2}|5\d{2})/, label: 'MSW HTTP errors (intentional)' },
  { pattern: /Failed to load resource.*net::ERR_FAILED/, label: 'Network failures (MSW)' },
  { pattern: /AxiosError/, label: 'Axios errors (MSW mock)' },
  { pattern: /SyntaxError: Unexpected token.*Not Found.*is not valid JSON/, label: '404 HTML responses' },

  // Storybook/Testing Library informational warnings
  { pattern: /You are using Testing Library's `screen` object/, label: 'Testing Library screen warning' },

  // MSW informational logs
  { pattern: /MSW.*mock/i, label: 'MSW logs' },
  { pattern: /^Request \{url:/, label: 'MSW request logs' },
  { pattern: /^Handler:/, label: 'MSW handler logs' },
  { pattern: /^Response \{status:/, label: 'MSW response logs' },
  { pattern: /Worker script URL:/, label: 'MSW worker setup' },
  { pattern: /Worker scope:/, label: 'MSW worker setup' },

  // Add more patterns as needed when stories are created
];

/**
 * Critical error patterns that should fail tests
 */
const CRITICAL_ERROR_PATTERNS = [
  // React warnings that indicate real bugs
  /Warning: Failed.*type:/,
  /Warning: A props object containing a "key" prop is being spread/,
  /Warning: Encountered two children with the same key/,
  /Warning: Each child in a list should have a unique "key" prop/,
  /Warning: validateDOMNesting/,
  /Warning: Cannot update a component.*while rendering a different component/,

  // JavaScript runtime errors
  /Uncaught/,
  /TypeError/,
  /ReferenceError/,
  /Cannot read propert/,
  /is not a function/,

  // Router and i18n errors
  /No routes matched location/,
  /@formatjs\/intl Error FORMAT_ERROR/,
];

function shouldIgnoreError(errorText: string): boolean {
  return IGNORED_ERROR_PATTERNS.some(({ pattern }) => pattern.test(errorText));
}

function isCriticalError(errorText: string): boolean {
  return CRITICAL_ERROR_PATTERNS.some((pattern) => pattern.test(errorText));
}

const config: TestRunnerConfig = {
  async preVisit(page, context) {
    const { id, tags } = context;

    // Skip stories with 'test-skip' tag
    if (tags?.includes('test-skip')) {
      return;
    }

    // Set viewport size (matches Chromatic default)
    await page.setViewportSize({ width: 1200, height: 500 });

    // Initialize error collection for this story
    storyErrors.set(id, []);

    // Attach console listener to capture errors/warnings
    page.on('console', async (msg) => {
      const text = msg.text();
      const type = msg.type();

      // Only process warnings and errors
      if (type === 'warning' || type === 'error') {
        // Skip ignored patterns
        if (shouldIgnoreError(text)) {
          return;
        }

        console.log(`[BROWSER ${type.toUpperCase()}]: ${text}`);

        // Collect errors
        if (type === 'error') {
          const errors = storyErrors.get(id) || [];
          errors.push(text);
          storyErrors.set(id, errors);
        }

        // Collect critical warnings
        if (type === 'warning' && isCriticalError(text)) {
          const errors = storyErrors.get(id) || [];
          errors.push(text);
          storyErrors.set(id, errors);
        }
      }
    });
  },

  async postVisit(page, context) {
    const { id, title, name, tags } = context;

    // Skip stories with 'test-skip' tag
    if (tags?.includes('test-skip')) {
      return;
    }

    const errors = storyErrors.get(id) || [];
    storyErrors.delete(id);

    // Fail the test if critical errors were found
    if (errors.length > 0) {
      const errorSummary = errors
        .map((err, i) => `  ${i + 1}. ${err.substring(0, 200)}${err.length > 200 ? '...' : ''}`)
        .join('\n');

      throw new Error(
        `Story "${title} > ${name}" failed due to ${errors.length} critical console error(s):\n\n${errorSummary}\n\n` +
          `These errors may indicate bugs that need to be fixed.\n` +
          `If these are intentional/expected errors, add them to IGNORED_ERROR_PATTERNS in test-runner.ts`
      );
    }
  },

  tags: {
    skip: ['test-skip'],
  },
};

export default config;
