import * as React from 'react';
export function CleanIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="10" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 10V6a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
export default CleanIcon;
