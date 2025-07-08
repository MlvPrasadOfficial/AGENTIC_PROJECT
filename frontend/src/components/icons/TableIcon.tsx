import * as React from 'react';
export function TableIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 9h18M3 15h18M9 5v14M15 5v14" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
export default TableIcon;
