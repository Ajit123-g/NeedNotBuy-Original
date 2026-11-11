import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

function Navbar() {

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6 py-4
        flex items-center justify-between">

        {/* Logo */}

        <Link to="/" className="flex items-center gap-2">

          <div className="bg-green-100 p-2 rounded-xl">
            <Leaf className="text-green-700" size={24} />
          </div>

          <span className="text-2xl font-bold text-gray-900">
            Need<span className="text-green-600">Not</span>Buy
          </span>

        </Link>

        {/* Navigation */}

        <div className="hidden md:flex items-center gap-8
          text-gray-600 font-medium">

          <Link to="/" className="hover:text-green-600">
            Home
          </Link>

          <a href="#how-it-works" className="hover:text-green-600">
            How It Works
          </a>

          <a href="#categories" className="hover:text-green-600">
            Categories
          </a>

          <a href="#about" className="hover:text-green-600">
            About
          </a>

        </div>

        {/* Buttons */}

        <div className="flex items-center gap-3">

          <Link
            to="/login"
            className="hidden sm:block text-gray-700 font-medium"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="bg-green-600 hover:bg-green-700
            text-white px-5 py-2.5 rounded-xl font-semibold
            transition"
          >
            Get Started
          </Link>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;