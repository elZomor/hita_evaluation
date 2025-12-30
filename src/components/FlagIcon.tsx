import clsx from 'clsx';

type FlagVariant = 'uk' | 'eg';

interface FlagIconProps {
  variant: FlagVariant;
  className?: string;
}

export const FlagIcon = ({ variant, className }: FlagIconProps) => {
  if (variant === 'uk') {
    return (
      <svg
        viewBox="0 0 24 16"
        className={clsx('w-6 h-4 rounded-sm', className)}
        role="img"
        aria-label="United Kingdom flag"
      >
        <rect width="24" height="16" rx="2" fill="#012169" />
        <path d="M0 0L24 16M24 0L0 16" stroke="#fff" strokeWidth="3" />
        <path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.5" />
        <path d="M0 6.5H24V9.5H0z" fill="#fff" />
        <path d="M10.5 0V16H13.5V0z" fill="#fff" />
        <path d="M0 7H24V9H0z" fill="#C8102E" />
        <path d="M11 0V16H13V0z" fill="#C8102E" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 16"
      className={clsx('w-6 h-4 rounded-sm', className)}
      role="img"
      aria-label="Egypt flag"
    >
      <rect width="24" height="16" rx="2" fill="#CE1126" />
      <rect y="5.33" width="24" height="5.34" fill="#fff" />
      <rect y="10.67" width="24" height="5.33" fill="#000" />
      <path
        d="M11.94 6.5c-.5 0-.9.3-1.03.78l-.37 1.35c-.06.23.09.46.33.51l.4.08v.9c0 .21.17.38.38.38h.89c.21 0 .38-.17.38-.38v-.9l.4-.08c.24-.05.39-.28.33-.51l-.37-1.35a1.07 1.07 0 00-1.03-.78h-.24z"
        fill="#D4AF37"
      />
    </svg>
  );
};
