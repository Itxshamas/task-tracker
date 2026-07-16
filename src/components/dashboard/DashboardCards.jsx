import {
  FiCheckCircle,
  FiClock,
  FiPlayCircle,
  FiClipboard,
} from "react-icons/fi";

const cardConfig = [
  {
    title: "Total Tasks",
    valueKey: "total",
    icon: FiClipboard,
    accent: "bg-blue-50 text-blue-700",
  },
  {
    title: "Completed",
    valueKey: "completed",
    icon: FiCheckCircle,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "In Progress",
    valueKey: "inProgress",
    icon: FiPlayCircle,
    accent: "bg-amber-50 text-amber-700",
  },
  {
    title: "Pending",
    valueKey: "pending",
    icon: FiClock,
    accent: "bg-rose-50 text-rose-700",
  },
];

function DashboardCards({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.valueKey] ?? 0;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {value}
                </p>
              </div>
              <div className={`rounded-2xl p-3 ${card.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardCards;
