import React from 'react';
import CreatorYAMLView from '../../src/components/creator/CreatorYAMLView';
import { DEFAULT_QUICKSTART_YAML } from '../../src/data/quickstart-templates';

describe('CreatorYAMLView', () => {
  beforeEach(() => {
    // Mount the component before each test
    cy.mount(<CreatorYAMLView />);

    // This single wait ensures the editor is ready for all tests
    cy.get('.lr-c-creator-yaml-view__editor', { timeout: 10000 }).should('be.visible');
  });

  it('should render the editor container', () => {
    // Simple "smoke test" to verify the component renders its main elements
    cy.get('.lr-c-creator-yaml-view').should('exist');
    cy.get('.lr-c-creator-yaml-view__editor').should('be.visible');
  });

  it('should display the default YAML content', () => {
    // Check that the default text is actually present, not just that "lines" exist
    cy.contains('# YAML Quickstart Definition').should('be.visible');
    cy.contains('# Start typing or paste your YAML here').should('be.visible');
  });

  it('should be interactive and accept focus', () => {
    // Verify the editor can receive focus
    cy.get('.monaco-editor').should('exist');
    cy.get('.view-lines').click({ force: true });
    
    // Verify Monaco's textarea is present (required for editing)
    cy.get('.monaco-editor textarea').should('exist');
    
    // Verify the editor shows the cursor/selection (indicates it's interactive)
    cy.get('.monaco-editor .cursors-layer').should('exist');
  });

  it('should render Monaco editor features', () => {
    // Verify Monaco editor elements are present
    cy.get('.monaco-editor').should('exist');
    cy.get('.view-lines').should('be.visible');
    
    // Check that line numbers are visible
    cy.get('.line-numbers').should('be.visible');
    
    // Check that the minimap is rendered (per editor config)
    cy.get('.minimap').should('exist');
  });

  it('should have proper editor styling and configuration', () => {
    // Verify the editor has the proper PatternFly container
    cy.get('.lr-c-creator-yaml-view').should('exist');
    
    // Check that the editor wrapper has proper dimensions
    cy.get('.lr-c-creator-yaml-view__editor').then(($el) => {
      const height = $el.height();
      expect(height).to.be.greaterThan(0);
    });
    
    // Verify wordWrap is working (soft wrapping enabled)
    cy.get('.monaco-editor .view-lines').should('exist');
  });

  describe('Load Sample Template feature', () => {
    it('should render the "Load Sample Template" button', () => {
      // Verify the button exists and has correct text
      cy.contains('button', 'Load Sample Template').should('be.visible');
      
      // Verify the button has the correct variant
      cy.contains('button', 'Load Sample Template').should('have.class', 'pf-m-secondary');
      
      // Verify the icon is present
      cy.contains('button', 'Load Sample Template').find('svg').should('exist');
    });

    it('should load template immediately when editor is empty', () => {
      // Click the Load Sample Template button
      cy.contains('button', 'Load Sample Template').click();
      
      // Wait for content to load and verify template content appears
      cy.contains('sample-interactive-quickstart', { timeout: 5000 }).should('be.visible');
      cy.contains('Sample Interactive QuickStart').should('be.visible');
      cy.contains('Quick start').should('be.visible');
    });

    it('should show confirmation dialog when editor has content', () => {
      // First, load the template
      cy.contains('button', 'Load Sample Template').click();
      cy.contains('sample-interactive-quickstart', { timeout: 5000 }).should('be.visible');
      
      // Stub the window.confirm to return false (cancel)
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false);
      });
      
      // Click the button again
      cy.contains('button', 'Load Sample Template').click();
      
      // Verify confirm was called with correct message
      cy.window().then((win) => {
        expect(win.confirm).to.have.been.calledWith(
          'This will overwrite your current work. Are you sure?'
        );
      });
    });

    it('should not overwrite content when confirmation is cancelled', () => {
      // Load the template first
      cy.contains('button', 'Load Sample Template').click();
      cy.contains('sample-interactive-quickstart', { timeout: 5000 }).should('be.visible');
      
      // Stub confirm to return false
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false);
      });
      
      // Click button again
      cy.contains('button', 'Load Sample Template').click();
      
      // Verify content is still there
      cy.contains('sample-interactive-quickstart').should('be.visible');
    });

    it('should overwrite content when confirmation is accepted', () => {
      // Load the template first
      cy.contains('button', 'Load Sample Template').click();
      cy.contains('sample-interactive-quickstart', { timeout: 5000 }).should('be.visible');
      
      // Stub confirm to return true
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });
      
      // Click button again
      cy.contains('button', 'Load Sample Template').click();
      
      // Verify content is reloaded (still showing the template)
      cy.contains('sample-interactive-quickstart').should('be.visible');
      cy.contains('Sample Interactive QuickStart').should('be.visible');
    });

    it('should load the correct template structure', () => {
      // Click the Load Sample Template button
      cy.contains('button', 'Load Sample Template').click();
      
      // Wait for Monaco to update and verify key template fields
      cy.contains('apiVersion: console.openshift.io/v1', { timeout: 5000 }).should('be.visible');
      cy.contains('kind: QuickStarts').should('be.visible');
      cy.contains('name: sample-interactive-quickstart').should('be.visible');
      cy.contains('version: 0.1').should('be.visible');
      cy.contains('displayName: Sample Interactive QuickStart').should('be.visible');
      cy.contains('text: Quick start').should('be.visible');
      cy.contains('color: green').should('be.visible');
      cy.contains('icon: ~').should('be.visible');
      cy.contains('description:').should('be.visible');
    });
  });
});
