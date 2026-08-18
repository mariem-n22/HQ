export function SectorHeader({
  sector,
  label,
  title,
  intro,
}: {
  sector?: string | undefined;
  label: string;
  title: string;
  intro?: string | undefined;
}) {
  return (
    <header className="border-b border-line pb-10">
      <p className="label-mono text-amber">
        {sector ? `${sector} — ` : ""}
        {label}
      </p>
      <h1 className="display-title mt-5 text-5xl text-ink sm:text-6xl md:text-7xl">{title}</h1>
      {intro ? (
        <p className="standfirst mt-6 max-w-2xl text-lg sm:text-xl">{intro}</p>
      ) : null}
    </header>
  );
}
