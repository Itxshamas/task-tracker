import { Link } from "react-router-dom";

import RegisterForm from "../../components/auth/RegisterForm";

function Register() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl space-y-4 text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            Task Tracker
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Create your workspace
          </h1>
          <p className="text-lg text-slate-600">
            Organize your priorities, track progress, and stay focused with a
            clean, reliable task hub.
          </p>
          <p className="text-sm text-slate-500">
            Already joined?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

export default Register;
