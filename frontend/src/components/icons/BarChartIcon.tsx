import * as React from 'react';
export function BarChartIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="10" width="3" height="8" fill="currentColor"/>
      <rect x="9" y="6" width="3" height="12" fill="currentColor"/>
      <rect x="15" y="3" width="3" height="15" fill="currentColor"/>
    </svg>
  );
}
export default BarChartIcon;
