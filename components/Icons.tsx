/**
 * Inline SVG ikonkalar — server component.
 * Nega inline: rasm/sprite so'rovi yo'q, LCP'ga ta'sir qilmaydi,
 * `currentColor` bilan mavzuga moslashadi.
 */

type P = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export function Star({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5-5.8-3.05-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95L12 2.6z" />
    </svg>
  );
}

export function Telegram({ size = 20, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M21.6 4.1L2.9 11.3c-1 .4-1 1 .1 1.3l4.7 1.5 1.8 5.5c.2.6.5.7 1 .3l2.6-2.1 4.6 3.4c.8.5 1.3.2 1.5-.7l3-14.1c.2-1-.4-1.5-1.6-1.2zM9.7 14.3l8.1-5.1c.4-.2.7-.1.4.2l-6.6 6-.2 2.7c-.1.2-.2.2-.3 0l-1.4-3.8z" />
    </svg>
  );
}

export function Bolt({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M13 2L4.5 13.5H11l-1 8.5L18.5 10H12l1-8z" />
    </svg>
  );
}

export function Card({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M2.5 10h19M6 15h3" />
    </svg>
  );
}

export function Shield({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 2.8l7.5 3v5.4c0 4.4-3 8.3-7.5 9.9-4.5-1.6-7.5-5.5-7.5-9.9V5.8l7.5-3z" />
      <path d="M9 12.2l2.1 2.1L15.2 10" />
    </svg>
  );
}

export function Tag({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12.6 2.9H21v8.4l-9.3 9.3a2 2 0 01-2.8 0l-5.6-5.6a2 2 0 010-2.8l9.3-9.3z" />
      <circle cx="17" cy="7" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Chat({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M21 11.6a7.6 7.6 0 01-8.2 7.6 8.9 8.9 0 01-2.9-.5L4 21l1.4-4.2A7.5 7.5 0 013 11.6C3 7.3 6.9 4 11.6 4a7.7 7.7 0 019.4 7.6z" />
    </svg>
  );
}

export function Users({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M15.5 20v-1.8a3.6 3.6 0 00-3.6-3.6H6.1A3.6 3.6 0 002.5 18.2V20" />
      <circle cx="9" cy="7.6" r="3.6" />
      <path d="M21.5 20v-1.8a3.6 3.6 0 00-2.7-3.5M16.2 4.2a3.6 3.6 0 010 6.9" />
    </svg>
  );
}

export function Check({ size = 16, className }: P) {
  return (
    <svg {...base(size)} strokeWidth={2.4} className={className}>
      <path d="M4.5 12.5l4.5 4.5L19.5 6.5" />
    </svg>
  );
}

export function Crown({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M2.8 7.5l3.9 3.2L12 4l5.3 6.7 3.9-3.2-1.7 11H4.5l-1.7-11z" />
    </svg>
  );
}

export function Vote({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 8.5h8M8 12h5" />
      <path d="M8.5 17.5l2 2 5.5-5.5" />
    </svg>
  );
}

export function Package({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4l8-4.6z" />
      <path d="M12 22V12M4.2 7.5L12 12l7.8-4.5" />
    </svg>
  );
}

export const ADV_ICONS = { bolt: Bolt, card: Card, shield: Shield, tag: Tag, chat: Chat, users: Users };
