import * as React from 'react';
export function QuestionIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 16v-1a3 3 0 1 0-3-3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="18" r="1" fill="currentColor"/>
    </svg>
  );
}
export default QuestionIcon;
