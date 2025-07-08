import * as React from 'react';
export function NarrativeIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
export default NarrativeIcon;
