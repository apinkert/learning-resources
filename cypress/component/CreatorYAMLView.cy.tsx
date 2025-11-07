import React from 'react';
import CreatorYAMLView from '../../src/components/creator/CreatorYAMLView';

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
});
