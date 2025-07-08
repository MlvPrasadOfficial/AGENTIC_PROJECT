import * as React from 'react';
export function TrendIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="3" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
      <circle cx="13" cy="15" r="1.5" fill="currentColor"/>
      <circle cx="21" cy="7" r="1.5" fill="currentColor"/>
    </svg>
  );
}
export default TrendIcon;
