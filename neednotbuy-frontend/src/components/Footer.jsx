import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {

  return (

    <footer className="bg-gray-950 text-gray-300 mt-20">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid md:grid-cols-3 gap-10">

          <div>

            <div className="flex items-center gap-2 mb-4">

              <Leaf className="text-green-400" size={26} />

              <h2 className="text-2xl font-bold text-white">
                NeedNotBuy
              </h2>

            </div>

            <p className="text-gray-400 leading-7">
              Don't buy it. Need it? Find a smarter way.
              Discover better alternatives through renting,
              borrowing and second-hand products.
            </p>

          </div>

          <div>

            <h3 className="text-white font-semibold mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3">

              <Link to="/">Home</Link>

              <Link to="/login">Login</Link>

              <Link to="/signup">Signup</Link>

            </div>

          </div>

          <div>

            <h3 className="text-white font-semibold mb-4">
              Our Mission
            </h3>

            <p className="text-gray-400 leading-7">
              Helping people save money and reduce unnecessary
              purchases by making better use of existing resources.
            </p>

          </div>

        </div>

        <div className="border-t border-gray-800 mt-10 pt-6
          text-center text-sm text-gray-500">

          © 2026 NeedNotBuy. All rights reserved.

        </div>

      </div>

    </footer>

  );

}

export default Footer;