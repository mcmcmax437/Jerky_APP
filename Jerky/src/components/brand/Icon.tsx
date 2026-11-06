export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  return <i className={`hgi-stroke hgi-${name}`} style={{ fontSize: size }} aria-hidden="true" />;
}
