/**
 * File: D3Visualization.test.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Test for D3Visualization component
 */

import { render, screen } from '@testing-library/react';
import { D3Visualization } from '../frontend/src/components/D3Visualization';

describe('D3Visualization Component', () => {
  it('renders without crashing', () => {
    render(<D3Visualization />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('should apply custom classNames', () => {
    render(<D3Visualization className="custom-class" />);
    const container = screen.getByRole('img', { hidden: true }).parentElement;
    expect(container).toHaveClass('d3-visualization-container');
    expect(container).toHaveClass('custom-class');
  });

  it('should handle data prop changes', () => {
    const { rerender } = render(<D3Visualization />);
    
    const initialSVG = document.querySelector('svg');
    const initialHTML = initialSVG?.innerHTML || '';
    
    // Re-render with data
    rerender(<D3Visualization data={{ testData: true }} />);
    
    const updatedSVG = document.querySelector('svg');
    const updatedHTML = updatedSVG?.innerHTML || '';
    
    // SVG content should change when data is provided
    expect(updatedHTML).not.toBe(initialHTML);
  });
});
