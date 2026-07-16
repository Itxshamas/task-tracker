import {
  FaTasks,
  FaCheckCircle,
  FaChartLine,
  FaClock,
  FaFilter,
  FaMobileAlt,
} from "react-icons/fa";

import FeatureCard from "./FeatureCard";

const features = [
  {
    id: 1,
    icon: <FaTasks />,
    title: "Task Management",
    description:
      "Create, organize, edit, and delete tasks with an intuitive interface designed to keep your work organized.",
  },
  {
    id: 2,
    icon: <FaCheckCircle />,
    title: "Subtasks",
    description:
      "Break large tasks into smaller actionable subtasks and monitor their completion effortlessly.",
  },
  {
    id: 3,
    icon: <FaChartLine />,
    title: "Progress Tracking",
    description:
      "Track completed, pending, and in-progress tasks with visual indicators and productivity insights.",
  },
  {
    id: 4,
    icon: <FaClock />,
    title: "Due Dates",
    description:
      "Never miss a deadline by assigning due dates and keeping upcoming work visible.",
  },
  {
    id: 5,
    icon: <FaFilter />,
    title: "Search & Filters",
    description:
      "Quickly find tasks using search, status filters, priority filters, and sorting options.",
  },
  {
    id: 6,
    icon: <FaMobileAlt />,
    title: "Responsive Design",
    description:
      "Access your task tracker from desktop, tablet, or mobile with a clean responsive interface.",
  },
];

function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            FEATURES
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
            Everything You Need To Stay Productive
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Task Tracker provides all the essential tools to organize your daily
            work, monitor progress, and complete tasks efficiently.
          </p>
        </div>

        {/* Cards */}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
