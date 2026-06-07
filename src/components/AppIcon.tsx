"use client";

import { ReactNode } from "react";

type IconName =
  | "dashboard"
  | "birth"
  | "death"
  | "notification"
  | "certificate"
  | "review"
  | "reports"
  | "users"
  | "settings"
  | "logout"
  | "bank"
  | "shield"
  | "pension"
  | "clock"
  | "check"
  | "building"
  | "file"
  | "trend"
  | "vault";

export function AppIcon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    className,
  };

  const icons: Record<IconName, ReactNode> = {
    dashboard: (
      <svg {...common}>
        <path d="M4 13h7V4H4zM13 20h7v-9h-7zM13 4v7h7V4zM4 20h7v-5H4z" />
      </svg>
    ),
    birth: (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
    death: (
      <svg {...common}>
        <path d="M12 3c3.2 2.8 5 5.6 5 8.6A5 5 0 0 1 12 16.6a5 5 0 0 1-5-5C7 8.6 8.8 5.8 12 3Z" />
        <path d="M12 16.6V21M9 21h6" />
      </svg>
    ),
    notification: (
      <svg {...common}>
        <path d="M12 4a4 4 0 0 0-4 4v2.6c0 .7-.2 1.4-.7 1.9L6 14h12l-1.3-1.5c-.5-.5-.7-1.2-.7-1.9V8a4 4 0 0 0-4-4Z" />
        <path d="M10 18a2 2 0 0 0 4 0" />
      </svg>
    ),
    certificate: (
      <svg {...common}>
        <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </svg>
    ),
    review: (
      <svg {...common}>
        <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
    reports: (
      <svg {...common}>
        <path d="M5 19V9M12 19V5M19 19v-8" />
        <path d="M3 19h18" />
      </svg>
    ),
    users: (
      <svg {...common}>
        <path d="M16 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
        <circle cx="9.5" cy="8" r="3" />
        <path d="M20 21v-1a4 4 0 0 0-3-3.9" />
        <path d="M16.5 5.2a3 3 0 0 1 0 5.6" />
      </svg>
    ),
    settings: (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z" />
      </svg>
    ),
    logout: (
      <svg {...common}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    ),
    bank: (
      <svg {...common}>
        <path d="M3 10 12 4l9 6" />
        <path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" />
      </svg>
    ),
    shield: (
      <svg {...common}>
        <path d="M12 3 5 6v5c0 5 3.4 8 7 10 3.6-2 7-5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    pension: (
      <svg {...common}>
        <path d="M4 20h16M6 18V8a6 6 0 1 1 12 0v10" />
        <path d="M9 11h6" />
      </svg>
    ),
    clock: (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </svg>
    ),
    check: (
      <svg {...common}>
        <path d="m5 12 4.2 4.2L19 6.5" />
      </svg>
    ),
    building: (
      <svg {...common}>
        <path d="M4 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16" />
        <path d="M16 9h3a1 1 0 0 1 1 1v11" />
        <path d="M8 8h4M8 12h4M8 16h4M12 21v-3H8v3" />
      </svg>
    ),
    file: (
      <svg {...common}>
        <path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M15 3v5h5M9 13h6M9 17h6" />
      </svg>
    ),
    trend: (
      <svg {...common}>
        <path d="M4 16 10 10l4 4 6-7" />
        <path d="M20 7v4h-4" />
      </svg>
    ),
    vault: (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 9.5v5M9.5 12h5" />
      </svg>
    ),
  };

  return <>{icons[name]}</>;
}
