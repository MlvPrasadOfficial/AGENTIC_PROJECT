import * as React from 'react';
export function ReportIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 4v16M16 4v16" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
export default ReportIcon;
