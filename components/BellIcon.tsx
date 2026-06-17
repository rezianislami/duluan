import type { SVGProps } from 'react';

/** Bell SVG — used inside BellButton */
export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      {/* Bell body */}
      <path d="M32 6a4 4 0 0 0-4 4c0 .18.02.35.05.52C18.74 12.9 12 21.1 12 31v13H8a2 2 0 0 0 0 4h48a2 2 0 0 0 0-4h-4V31c0-9.9-6.74-18.1-16.05-20.48.03-.17.05-.34.05-.52a4 4 0 0 0-4-4z" />
      {/* Clapper */}
      <path d="M26 50a6 6 0 0 0 12 0H26z" />
    </svg>
  );
}

/** Lock icon for locked/disabled state */
export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/** Checkmark for winner state */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
