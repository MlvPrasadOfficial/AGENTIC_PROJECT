/**
 * File: PageLayout.test.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Test file for verifying the 2-column layout implementation
 */

import { render, screen } from '@testing-library/react';
import Page from '../frontend/src/app/page';

describe('Page Layout', () => {
  test('renders the 2-column layout correctly', () => {
    render(<Page />);
    
    // Check main heading
    expect(screen.getByText('Enterprise Insights Copilot')).toBeInTheDocument();
    
    // Check left column components
    expect(screen.getByText('Upload your Data')).toBeInTheDocument();
    expect(screen.getByText('Ask Copilot')).toBeInTheDocument();
    
    // Check right column components
    expect(screen.getByText('Agent Workflow')).toBeInTheDocument();
    expect(screen.getByText('File Upload Agent')).toBeInTheDocument();
    
    // Check bottom visualization panel
    expect(screen.getByText('Data Visualization')).toBeInTheDocument();
    expect(screen.getByText('Visualization Area')).toBeInTheDocument();
  });
  
  test('layout has correct column proportions', () => {
    render(<Page />);
    
    // Get the main container elements
    const leftColumn = screen.getByText('Upload your Data').closest('div').parentElement;
    const rightColumn = screen.getByText('Agent Workflow').closest('div').parentElement;
    
    // Check if they have the correct width classes
    expect(leftColumn).toHaveClass('md:w-2/5'); // 40% width
    expect(rightColumn).toHaveClass('md:w-3/5'); // 60% width
  });
});
