import { Page } from '@playwright/test';
import {
  openHelpPanel as openHelpPanelBase,
  switchToHelpPanelTab,
  waitForSupportTabLoaded,
  SUPPORT_API_LOAD_TIMEOUT,
} from './test-utils';

/**
 * Support Case Test Helpers
 *
 * Page object helpers for support case tests that encapsulate common interactions
 * with the help panel's Support tab. This reduces duplication across test files.
 */

// Re-export timeout constant for backward compatibility
export { SUPPORT_API_LOAD_TIMEOUT };

/**
 * Opens help panel and navigates to Support tab
 * Convenience method that combines openHelpPanel() and switchToHelpPanelTab('Support')
 */
export async function openSupportPanel(page: Page): Promise<void> {
  await openHelpPanelBase(page);
  await switchToHelpPanelTab(page, 'Support');
  await waitForSupportTabLoaded(page);
}

/**
 * Checks if the support panel is showing the empty state (no cases)
 * Returns true if empty state is visible, false if cases table is visible
 */
export async function isEmptyState(page: Page): Promise<boolean> {
  const emptyState = page.locator('[data-ouia-component-id="help-panel-support-empty-state"]');
  return await emptyState.isVisible().catch(() => false);
}

/**
 * Gets locators for common support panel elements
 */
export function getSupportPanelLocators(page: Page) {
  return {
    emptyState: page.locator('[data-ouia-component-id="help-panel-support-empty-state"]'),
    supportTable: page.locator('[data-ouia-component-id="help-panel-support-cases-table"]'),
    pagination: page.locator('[data-ouia-component-id="help-panel-support-pagination"]'),
    openCaseButton: page.getByRole('button', { name: 'Open a support case' }),
  };
}
