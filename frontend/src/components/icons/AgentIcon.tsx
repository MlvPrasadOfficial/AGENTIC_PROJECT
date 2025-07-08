import * as React from 'react';
export function AgentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <rect x="6" y="14" width="12" height="6" rx="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
export default AgentIcon;
