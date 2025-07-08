/**
 * File: UILayout.test.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Test for 2-column UI layout implementation
 */

import { render, screen } from '@testing-library/react';
import HomePage from '../frontend/src/app/page';

describe('UI Layout Tests', () => {
  // Test for 2-column layout
  it('should have a 2-column layout on desktop', () => {
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
    
    // Check for grid with 2 columns
    const gridContainer = screen.getByRole('main').querySelector('.grid');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
  });
  
  // Test for left column structure (upload on top, chat below)
  it('should have upload above chat in the left column', () => {
    render(<HomePage />);
    
    // Get the left column
    const leftColumn = screen.getByRole('main').querySelector('.flex-col');
    
    // Check that the first child is the upload card
    const firstCard = leftColumn.children[0];
    expect(firstCard.querySelector('h2').textContent).toBe('Upload your Data');
    
    // Check that the second child is the chat card
    const secondCard = leftColumn.children[1];
    expect(secondCard.querySelector('h2').textContent).toBe('Ask Copilot');
    
    // Verify the vertical order (upload above chat)
    const uploadCardTop = firstCard.getBoundingClientRect().top;
    const chatCardTop = secondCard.getBoundingClientRect().top;
    expect(uploadCardTop).toBeLessThan(chatCardTop);
  });
  
  // Test for right column (agent workflow)
  it('should have agent workflow in the right column', () => {
    render(<HomePage />);
    
    // Get all cards in the grid
    const cards = screen.getByRole('main').querySelectorAll('.modern-card');
    
    // The third card (index 2) should be the agent workflow card
    const agentWorkflowCard = cards[2];
    expect(agentWorkflowCard.querySelector('h2').textContent).toBe('Agent Workflow');
    
    // Check that it contains agent cards
    const agentCards = agentWorkflowCard.querySelectorAll('.agent-card');
    expect(agentCards.length).toBeGreaterThan(0);
  });
});
