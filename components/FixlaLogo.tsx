interface Props {
  size?: number;
  className?: string;
}

/**
 * The green circular Fixla logo mark, matching the mobile app's
 * `logoPlaceholder` in ServicesScreen.tsx.
 */
export default function FixlaLogo({ size = 50, className }: Props) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-fixla-500 ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <span
        className="font-bold text-white"
        style={{ fontSize: size * 0.36 }}
      >
        Fixla
      </span>
    </div>
  );
}
