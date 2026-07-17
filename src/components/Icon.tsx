import type { SVGProps } from 'react'

type IconName =
  | 'search'
  | 'heart'
  | 'heart-filled'
  | 'home'
  | 'map'
  | 'clock'
  | 'paw'
  | 'kitchen'
  | 'external'
  | 'filter'
  | 'close'
  | 'github'
  | 'download'
  | 'upload'
  | 'chevron'
  | 'check'
  | 'warning'
  | 'list'
  | 'activity'
  | 'menu'

const paths: Record<IconName, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>,
  'heart-filled': <path fill="currentColor" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  paw: <><circle cx="7.5" cy="8" r="2"/><circle cx="16.5" cy="8" r="2"/><circle cx="5" cy="13" r="2"/><circle cx="19" cy="13" r="2"/><path d="M8 18c0-3 2-5 4-5s4 2 4 5c0 2-1.8 3-4 3s-4-1-4-3Z"/></>,
  kitchen: <><path d="M4 3v8a3 3 0 0 0 3 3h1V3M12 3v18M18 3v18M15 3v7h6V3"/></>,
  external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6H5V6h6"/></>,
  filter: <path d="M4 5h16M7 12h10M10 19h4"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  github: <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.5 5.5 0 0 0 19.3 3.7 5.1 5.1 0 0 0 19.1 0S18 0 15 1.5a13.4 13.4 0 0 0-7 0C5 0 3.9 0 3.9 0a5.1 5.1 0 0 0-.2 3.7A5.5 5.5 0 0 0 2.2 7.5c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4M8 19c-3 .9-3-1.5-4-2"/>,
  download: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
  upload: <><path d="M12 21V9M7 14l5-5 5 5"/><path d="M5 3h14"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  warning: <><path d="M12 3 2 21h20Z"/><path d="M12 9v5M12 18h.01"/></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
  activity: <><path d="M3 12h4l2-8 4 16 2-8h6"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
}

export function Icon({ name, size = 18, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
