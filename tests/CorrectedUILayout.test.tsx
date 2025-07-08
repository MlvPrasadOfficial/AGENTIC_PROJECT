/**
 * File: CorrectedUILayout.test.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Test for corrected UI layout implementation
 */

import { render, screen } from '@testing-library/react';
import HomePage from '../frontend/src/app/page';

describe('Corrected UI Layout Tests', () => {
  // Test for upload box above everything
  it('should have upload box above everything else', () => {
    render(<HomePage />);
    
    // Get all main containers
    const containers = screen.getByRole('main').querySelectorAll('.modern-card');
    
    // First container should be the upload box
    const uploadBox = containers[0];
    expect(uploadBox.querySelector('h2').textContent).toBe('Upload your Data');
    
    // Check if upload box is at the top (not inside the grid)
    expect(uploadBox.parentElement.classList.contains('grid')).toBe(false);
    
    // The upload box should be above the grid (check DOM order)
    const grid = screen.getByRole('main').querySelector('.grid');
    const uploadBoxIndex = Array.from(uploadBox.parentElement.children).indexOf(uploadBox);
    const gridIndex = Array.from(uploadBox.parentElement.children).indexOf(grid);
    expect(uploadBoxIndex).toBeLessThan(gridIndex);
  });
  
  // Test for 2-column layout below upload box
  it('should have a 2-column layout below the upload box', () => {
    render(<HomePage />);
    
    // Check for grid with 2 columns
    const grid = screen.getByRole('main').querySelector('.grid');
    expect(grid).toHaveClass('md:grid-cols-2');
    
    // The grid should be a direct child of the container, not nested in another div
    expect(grid.parentElement.classList.contains('container')).toBe(true);
  });
  
  // Test for chat box in left column
  it('should have chat box in the left column', () => {
    render(<HomePage />);
    
    // Get the grid containers (excluding the upload box)
    const gridContainers = screen.getByRole('main').querySelector('.grid').querySelectorAll('.modern-card');
    
    // First container in the grid should be the chat box
    const chatBox = gridContainers[0];
    expect(chatBox.querySelector('h2').textContent).toBe('Ask Copilot');
  });
  
  // Test for agent workflow in right column
  it('should have agent workflow in the right column', () => {
    render(<HomePage />);
    
    // Get the grid containers (excluding the upload box)
    const gridContainers = screen.getByRole('main').querySelector('.grid').querySelectorAll('.modern-card');
    
    // Second container in the grid should be the agent workflow
    const agentWorkflow = gridContainers[1];
    expect(agentWorkflow.querySelector('h2').textContent).toBe('Agent Workflow');
  });
});
