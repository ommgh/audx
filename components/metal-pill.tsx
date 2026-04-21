export function MetaPill({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string; size?: string | number }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground">
      <Icon className="shrink-0" size={14} aria-hidden="true" />
      {children}
    </span>
  );
}
