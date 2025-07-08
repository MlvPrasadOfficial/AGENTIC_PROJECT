import * as React from 'react';
export function PieChartIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 2v10l8.66 5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
export default PieChartIcon;
