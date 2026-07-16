import { FaArrowRight } from "react-icons/fa";
import Button from "../common/Button";

function CTA() {
  return (
    <section className="bg-blue-600 py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <h2 className="text-4xl font-extrabold text-white md:text-5xl">
          Ready to Boost Your Productivity?
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
          Organize your work, manage subtasks, track your progress, and stay
          focused with Task Tracker.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button
            to="/register"
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Get Started
            <FaArrowRight className="ml-2" />
          </Button>

          <Button
            to="/login"
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-600"
          >
            Login
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CTA;
