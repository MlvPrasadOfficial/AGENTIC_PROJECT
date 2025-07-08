import * as React from 'react';
export function SqlIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <ellipse cx="12" cy="7" rx="8" ry="3" stroke="currentColor" strokeWidth="2"/>
      <rect x="4" y="7" width="16" height="10" rx="5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
export default SqlIcon;
