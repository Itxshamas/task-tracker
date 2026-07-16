const priorityStyles = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-rose-50 text-rose-700",
};

function PriorityBadge({ priority = "medium" }) {
  const normalized = String(priority).toLowerCase();
  const style = priorityStyles[normalized] || priorityStyles.medium;

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}
    >
      {normalized}
    </span>
  );
}

export default PriorityBadge;
