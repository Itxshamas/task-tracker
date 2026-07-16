import { Link } from "react-router-dom";
import { FaTasks, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        {/* Logo */}

        <div>
          <div className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <FaTasks className="text-blue-500" />
            <span>TaskTracker</span>
          </div>

          <p className="leading-7 text-gray-400">
            A modern task management application built with React and Supabase.
          </p>
        </div>

        {/* Product */}

        <div>
          <h3 className="mb-4 text-lg font-semibold">Product</h3>

          <ul className="space-y-3 text-gray-400">
            <li>
              <a href="#features" className="hover:text-white">
                Features
              </a>
            </li>

            <li>
              <Link to="/login" className="hover:text-white">
                Login
              </Link>
            </li>

            <li>
              <Link to="/register" className="hover:text-white">
                Register
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}

        <div>
          <h3 className="mb-4 text-lg font-semibold">Resources</h3>

          <ul className="space-y-3 text-gray-400">
            <li>Documentation</li>
            <li>Support</li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>

        {/* Social */}

        <div>
          <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>

          <div className="flex gap-4 text-2xl">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-blue-500"
            >
              <FaGithub />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-blue-500"
            >
              <FaLinkedin />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-blue-500"
            >
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © {year} TaskTracker. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
