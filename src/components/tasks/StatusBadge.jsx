const statusStyles = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-50 text-blue-700",
  "in progress": "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
};

function StatusBadge({ status = "pending" }) {
  const normalized = String(status).toLowerCase();
  const style = statusStyles[normalized] || statusStyles.pending;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {normalized.replace("_", " ")}
    </span>
  );
}

export default StatusBadge;
