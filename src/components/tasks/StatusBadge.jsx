const statusStyles = {
  pending: "bg-slate-100 text-slate-700",
  completed: "bg-emerald-50 text-emerald-700",
};

function StatusBadge({ status = "pending" }) {
  const raw = String(status || "").toLowerCase();
  // Map any legacy 'in_progress' or similar values to 'pending'.
  const normalized = raw === "completed" ? "completed" : "pending";
  const style = statusStyles[normalized];

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {normalized}
    </span>
  );
}

export default StatusBadge;
