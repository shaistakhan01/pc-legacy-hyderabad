interface PlaceholderProps {
  pageName: string;
}

// Generic placeholder used for every route in the Phase 1 skeleton.
// Each real page component replaces its Placeholder usage in the phase
// where that module is built (Phase 4 for rooms, Phase 5 for restaurant,
// etc.). This simply confirms navigation works end-to-end.
export function Placeholder({ pageName }: PlaceholderProps) {
  return (
    <div className="mx-auto max-w-content px-6 py-16 text-center">
      <h1 className="font-heading text-2xl text-primary">{pageName}</h1>
      <p className="mt-2 text-neutral-700">
        This page will be implemented in a later phase.
      </p>
    </div>
  );
}