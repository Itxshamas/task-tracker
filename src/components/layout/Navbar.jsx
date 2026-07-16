import { Link, NavLink } from "react-router-dom";
import { FaTasks } from "react-icons/fa";

const navLinks = [
  { name: "Features", path: "#features" },
  { name: "About", path: "#about" },
  { name: "Contact", path: "#contact" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-blue-600"
        >
          <FaTasks className="text-2xl" />
          <span>TaskTracker</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="font-medium text-gray-600 transition hover:text-blue-600"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <NavLink
            to="/login"
            className="rounded-lg border border-blue-600 px-5 py-2 font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            Sign Up
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
