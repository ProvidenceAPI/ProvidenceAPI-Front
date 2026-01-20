import React from "react";
type SocialIconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};
const commonProps: React.SVGProps<SVGSVGElement> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
export const FacebookIcon = ({
  className = "w-5 h-5",
  ...props
}: SocialIconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...commonProps} {...props}>
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v7h3v-7h3l1-4h-4V7a1 1 0 011-1h3V2z" />
  </svg>
);
export const InstagramIcon = ({
  className = "w-5 h-5",
  ...props
}: SocialIconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...commonProps} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="3.2" />
    <path d="M17.5 6.5h.01" />
  </svg>
);
export const TwitterIcon = ({
  className = "w-5 h-5",
  ...props
}: SocialIconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...commonProps} {...props}>
    <path d="M23 4.5c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.3 1.7-2.2-.7.4-1.6.7-2.5.9C19 3 17.8 2.5 16.5 2.5c-2.2 0-4 1.8-4 4 0 .3 0 .5.1.8C8 7 5 5.6 3 3.3c-.3.6-.5 1.3-.5 2 0 1.4.7 2.6 1.8 3.3-.6 0-1.2-.2-1.7-.5v.1c0 1.9 1.3 3.5 3 3.9-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3 2.3-1.1.9-2.5 1.4-4 1.4-.3 0-.6 0-.9-.1C4.9 20 7 20.8 9.3 20.8c6.8 0 10.5-5.6 10.5-10.5v-.5c.7-.5 1.3-1.2 1.7-2z" />
  </svg>
);
export const WhatsAppIcon = ({
  className = "w-5 h-5",
  ...props
}: SocialIconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...commonProps} {...props}>
    <path d="M21 12.05A9 9 0 1012.05 3 9 9 0 0021 12.05z" />
    <path d="M17.2 15.2c-.3.8-1.4 1.4-2 1.5-.6.1-1.1.2-2 .1-.9-.1-2.2-1.1-3.2-2s-1.9-2.2-2-3.2c-.1-.8.2-1.4.9-2 .6-.6 1.1-.8 1.6-.8.4 0 .8 0 1.1.7.3.6.9 1.8 1 1.9.1.1.1.3 0 .4-.1.1-.5.5-.9.9-.4.4-.6.6-.6 1 0 .4.6 1.1 1.4 1.8.8.7 1.5 1.1 1.9 1.3.4.1.8.1 1.1 0 .3-.2.7-.6 1-1.4.3-.8.3-1.4.2-1.6-.1-.2-.4-.3-.8-.2-.4.1-1 .4-1.2.5z" />
  </svg>
);
export const PhoneIcon = ({
  className = "w-5 h-5",
  ...props
}: SocialIconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...commonProps} {...props}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012 4.18 2 2 0 014 2h3a2 2 0 012 1.72c.12.9.38 1.78.78 2.6a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.48-1.48a2 2 0 012.11-.45c.82.4 1.7.66 2.6.78A2 2 0 0122 16.92z" />
  </svg>
);
export const MailIcon = ({
  className = "w-5 h-5",
  ...props
}: SocialIconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...commonProps} {...props}>
    <path d="M3 8.5v7A2.5 2.5 0 005.5 18h13a2.5 2.5 0 002.5-2.5v-7" />
    <path d="M21 6.5a2.5 2.5 0 00-2.5-2.5h-13A2.5 2.5 0 003 6.5v.5l9 5.5 9-5.5v-.5z" />
  </svg>
);
export const LocationIcon = ({
  className = "w-5 h-5",
  ...props
}: SocialIconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...commonProps} {...props}>
    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
