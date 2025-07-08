/**
 * File: PageLayout.test.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Test for verifying the 2-column layout structure of the home page
 */

import { render, screen } from '@testing-library/react';
import Page from '../frontend/src/app/page';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Page Layout', () => {
  it('renders the 2-column layout correctly', () => {
    render(<Page />);
    
    // Check for main heading
    expect(screen.getByText('Enterprise Insights Copilot')).toBeInTheDocument();
    
    // Check for left column sections
    expect(screen.getByText('Upload your Data')).toBeInTheDocument();
    expect(screen.getByText('Ask Copilot')).toBeInTheDocument();
    
    // Check for right column - Agent Workflow
    expect(screen.getByText('Agent Workflow')).toBeInTheDocument();
    expect(screen.getByText('File Upload Agent')).toBeInTheDocument();
    expect(screen.getByText('Data Profile Agent')).toBeInTheDocument();
    
    // Check for visualization panel
    expect(screen.getByText('Data Visualization')).toBeInTheDocument();
  });
  
  it('has the correct responsive layout classes', () => {
    render(<Page />);
    
    // Check that we have flex-col for mobile and flex-row for medium and up
    const layoutContainer = screen.getByText('Upload your Data').closest('.flex-col.md\\:flex-row');
    expect(layoutContainer).toBeInTheDocument();
    
    // Check that left column has flex-col layout
    const leftColumn = screen.getByText('Upload your Data').closest('.flex-1.flex.flex-col');
    expect(leftColumn).toBeInTheDocument();
  });
});
