import { AD_INVENTORY_ENABLED } from "@/config/site";

/**
 * Sponsor-ready ad/partner inventory slot. Renders NOTHING until
 * AD_INVENTORY_ENABLED is switched on, so it never leaves an empty hole or
 * shifts layout while unsold.
 */
export function AdSlot({ id, label = "Partner" }: { id: string; label?: string }) {
  if (!AD_INVENTORY_ENABLED) return null;
  return (
    <aside
      aria-label={`${label} placement ${id}`}
      data-ad-slot={id}
      className="my-10 border border-ink-line bg-ink-soft p-6 text-center"
    >
      <p className="kicker mb-1">{label}</p>
      <p className="text-sm text-paper-dim">Placement {id} — inventory available.</p>
    </aside>
  );
}
