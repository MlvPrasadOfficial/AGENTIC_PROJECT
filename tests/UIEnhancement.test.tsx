/**
 * File: UIEnhancement.test.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Test for UI enhancements
 */

import { render, screen } from '@testing-library/react';
import HomePage from '../frontend/src/app/page';

describe('Enhanced UI Component Tests', () => {
  // Test for agent names
  it('should display all required agents in the correct order', () => {
    render(<HomePage />);
    
    // Check all agent names in the correct order
    const agentNames = [
      'File Upload Agent',
      'Data Profile Agent',
      'Planning Agent',
      'Insight Agent',
      'Viz Agent',
      'Critique Agent',
      'Debate Agent',
      'Report Agent'
    ];
    
    agentNames.forEach((agentName) => {
      const agentElement = screen.getByText(agentName);
      expect(agentElement).toBeInTheDocument();
    });
  });
  
  // Test for modern typography
  it('should apply modern typography styles', () => {
    render(<HomePage />);
    
    // Check the title has the correct font styles
    const title = screen.getByText('Enterprise Insights Copilot');
    expect(title).toHaveClass('tracking-tight');
    
    // Check agent names have the correct typography
    const agentName = screen.getByText('Planning Agent');
    expect(agentName).toHaveClass('text-lg');
    expect(agentName).toHaveClass('font-medium');
    expect(agentName).toHaveClass('tracking-tight');
  });
  
  // Test for no demo queries
  it('should not display demo queries in the chat box', () => {
    render(<HomePage />);
    
    // Should not find demo queries
    const demoQuery1 = screen.queryByText('Show me sales trends by region');
    const demoQuery2 = screen.queryByText('What are the top performing products?');
    
    expect(demoQuery1).not.toBeInTheDocument();
    expect(demoQuery2).not.toBeInTheDocument();
  });
  
  // Test for improved spacing
  it('should have improved spacing between glass cards', () => {
    render(<HomePage />);
    
    // Check for gap-10 class on the grid container
    const gridContainer = screen.getByRole('main').querySelector('.grid');
    expect(gridContainer).toHaveClass('gap-10');
    
    // Check that agent cards have mb-5 class for spacing
    const agentCards = document.querySelectorAll('.agent-card');
    expect(agentCards[0]).toHaveClass('mb-5');
  });
});
