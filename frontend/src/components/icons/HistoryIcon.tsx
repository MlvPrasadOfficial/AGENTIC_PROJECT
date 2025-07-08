import * as React from 'react';
export function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 12a9 9 0 1 1 9 9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export default HistoryIcon;
