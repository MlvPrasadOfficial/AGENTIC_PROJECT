/**
 * File: AgentPanelRightColumn.test.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Test for agent panel relocation to right column
 */

import { render, screen } from '@testing-library/react';
import HomePage from '../frontend/src/app/page';

describe('Agent Panel Right Column Tests', () => {
  // Test for 2-column layout
  it('should have a 2-column layout', () => {
    // Mock window.matchMedia for testing responsive design
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: true, // Simulate desktop view
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    render(<HomePage />);
    
    // Check for flex container with row direction on desktop
    const container = screen.getByRole('main').querySelector('.flex-col.md\\:flex-row');
    expect(container).not.toBeNull();
  });
  
  // Test for left column structure (upload + chat)
  it('should have upload and chat in the left column', () => {
    render(<HomePage />);
    
    // Check that the first column contains a flex container
    const leftColumn = screen.getByRole('main').querySelector('.md\\:flex-row').firstElementChild;
    expect(leftColumn).toHaveClass('flex-col');
    expect(leftColumn).toHaveClass('md:w-1/2');
    
    // Check that the flex container has two modern cards
    const cards = leftColumn.querySelectorAll('.modern-card');
    expect(cards.length).toBe(2);
    
    // Check that the first card is the upload box
    const uploadBox = cards[0];
    expect(uploadBox.querySelector('h2').textContent).toBe('Upload your Data');
    
    // Check that the second card is the chat box
    const chatBox = cards[1];
    expect(chatBox.querySelector('h2').textContent).toBe('Ask Copilot');
  });
  
  // Test for right column (agent workflow)
  it('should have agent workflow in the right column', () => {
    render(<HomePage />);
    
    // Get the right column
    const rightColumn = screen.getByRole('main').querySelector('.md\\:flex-row').lastElementChild;
    expect(rightColumn).toHaveClass('md:w-1/2');
    
    // Check that the right column contains the agent workflow card
    const agentWorkflowCard = rightColumn.querySelector('.modern-card');
    expect(agentWorkflowCard).not.toBeNull();
    
    // Check that it's the agent workflow card
    expect(agentWorkflowCard.querySelector('h2').textContent).toBe('Agent Workflow');
    
    // Check that it contains agent cards
    const agentCards = rightColumn.querySelectorAll('.agent-card');
    expect(agentCards.length).toBeGreaterThan(0);
  });
  
  // Test for vertical stacking on mobile
  it('should stack vertically on mobile', () => {
    // Mock window.matchMedia for testing responsive design
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false, // Simulate mobile view
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    render(<HomePage />);
    
    // Check for grid with 1 column on mobile
    const gridContainer = screen.getByRole('main').querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1');
  });
});
