import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import Button from "../common/Button";
import DashboardPreview from "../dashboard/DashboardPreview";

function Hero() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto flex min-h-[90vh] max-w-7xl flex-col-reverse items-center gap-16 px-6 py-20 lg:flex-row">
        {/* Left */}
        <div className="flex-1 text-center lg:text-left">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            🚀 Organize Your Work Smarter
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-gray-900 lg:text-6xl">
            Manage Tasks
            <br />
            <span className="text-blue-600">Without The Stress</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Stay organized with powerful task management, subtasks, deadlines,
            and progress tracking. Everything you need to boost productivity in
            one place.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Button to="/register" size="lg">
              Get Started
              <FaArrowRight className="ml-2" />
            </Button>

            <Button to="/login" variant="secondary" size="lg">
              Login
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500" />
              Unlimited Tasks
            </div>

            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500" />
              Smart Dashboard
            </div>

            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500" />
              Subtasks
            </div>

            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500" />
              Track Progress
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-1 justify-center">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

export default Hero;
