import { useState } from "react";

import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  Search,
  ArrowRight,
  Handshake,
  Repeat,
  ShoppingBag,
  Leaf,
  ShieldCheck,
  Sparkles
} from "lucide-react";

function Home() {

  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  const handleSearch = () => {

    if (!query.trim()) {
      alert("Please describe what you need.");
      return;
    }

    navigate("/analyze", {
      state: { query }
    });

  };

  const categories = [
    {
      name: "Electronics",
      icon: "💻",
      description: "Laptops, cameras and projectors"
    },
    {
      name: "Home & Living",
      icon: "🏠",
      description: "Furniture and appliances"
    },
    {
      name: "Tools",
      icon: "🔧",
      description: "Equipment and machinery"
    },
    {
      name: "Travel",
      icon: "🧳",
      description: "Luggage and travel essentials"
    }
  ];

  const features = [
    {
      icon: Handshake,
      title: "Borrow",
      description: "Get what you need from someone nearby."
    },
    {
      icon: Repeat,
      title: "Rent",
      description: "Pay only for the time you actually need."
    },
    {
      icon: ShoppingBag,
      title: "Buy Second-hand",
      description: "Find affordable pre-owned products."
    }
  ];

  return (

    <div className="min-h-screen bg-[#f8faf9]">

      <Navbar />

      {/* HERO SECTION */}

      <section className="max-w-7xl mx-auto px-6
        pt-20 pb-24 text-center">

        <div className="inline-flex items-center gap-2
          bg-green-100 text-green-800 px-4 py-2
          rounded-full text-sm font-semibold mb-8">

          <Sparkles size={16} />

          Think Before You Buy

        </div>

        <h1 className="text-4xl md:text-6xl
          font-bold leading-tight text-gray-900">

          Don't Buy It.

          <br />

          <span className="text-green-600">
            Find a Smarter Way.
          </span>

        </h1>

        <p className="text-gray-600 text-lg
          max-w-2xl mx-auto mt-6 leading-8">

          Why buy something you only need temporarily?
          Borrow, rent or buy second-hand with the help
          of AI. Save money and reduce waste.

        </p>

        {/* SEARCH BOX */}

        <div className="max-w-3xl mx-auto mt-10">

          <div className="flex flex-col sm:flex-row
            items-center bg-white border border-gray-200
            shadow-xl rounded-2xl p-3 gap-3">

            <Search className="text-green-600 ml-2"
              size={24} />

            <input

              type="text"

              value={query}

              onChange={(e) => setQuery(e.target.value)}

              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}

              placeholder="What do you need? e.g. Projector for 2 days"

              className="flex-1 w-full outline-none
                px-2 py-3 text-gray-700"

            />

            <button

              onClick={handleSearch}

              className="bg-green-600 hover:bg-green-700
                text-white px-7 py-3 rounded-xl
                font-semibold flex items-center gap-2
                transition w-full sm:w-auto justify-center"

            >

              Find Options

              <ArrowRight size={18} />

            </button>

          </div>

          <p className="text-gray-400 text-sm mt-4">

            Try: Projector for 2 days · Camera for a week ·
            Drill machine for one day

          </p>

        </div>

      </section>

      {/* HOW IT WORKS */}

      <section id="how-it-works"
        className="bg-white py-20">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">

            <h2 className="text-3xl md:text-4xl
              font-bold text-gray-900">

              How NeedNotBuy Works

            </h2>

            <p className="text-gray-500 mt-4">

              Three simple steps to make smarter decisions.

            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {[
              {
                number: "01",
                title: "Tell Us What You Need",
                description: "Describe your requirement in your own words."
              },
              {
                number: "02",
                title: "Explore Alternatives",
                description: "Our AI helps discover smarter ways to get it."
              },
              {
                number: "03",
                title: "Save Money",
                description: "Choose the option that works best for you."
              }
            ].map((step) => (

              <div key={step.number}
                className="bg-[#f8faf9] p-8 rounded-2xl">

                <span className="text-green-600
                  font-bold text-3xl">

                  {step.number}

                </span>

                <h3 className="text-xl font-bold
                  mt-5 text-gray-900">

                  {step.title}

                </h3>

                <p className="text-gray-500 mt-3 leading-7">

                  {step.description}

                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* CATEGORIES */}

      <section id="categories" className="py-20">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">

            <h2 className="text-3xl md:text-4xl
              font-bold text-gray-900">

              Explore Categories

            </h2>

            <p className="text-gray-500 mt-4">

              Find smarter alternatives for everyday needs.

            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2
            lg:grid-cols-4 gap-6">

            {categories.map((category) => (

              <div key={category.name}
                className="bg-white p-7 rounded-2xl
                border border-gray-100 hover:shadow-lg
                transition cursor-pointer">

                <div className="text-4xl mb-5">

                  {category.icon}

                </div>

                <h3 className="font-bold text-lg">

                  {category.name}

                </h3>

                <p className="text-gray-500 text-sm mt-2">

                  {category.description}

                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* OPTIONS */}

      <section className="bg-green-50 py-20">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">

            <h2 className="text-3xl md:text-4xl
              font-bold text-gray-900">

              Why Buy When You Can Choose Smarter?

            </h2>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {features.map((feature) => {

              const Icon = feature.icon;

              return (

                <div key={feature.title}
                  className="bg-white p-8 rounded-2xl
                  shadow-sm text-center">

                  <div className="bg-green-100 w-16 h-16
                    rounded-2xl flex items-center
                    justify-center mx-auto mb-5">

                    <Icon className="text-green-700"
                      size={30} />

                  </div>

                  <h3 className="text-xl font-bold">

                    {feature.title}

                  </h3>

                  <p className="text-gray-500 mt-3">

                    {feature.description}

                  </p>

                </div>

              );

            })}

          </div>

        </div>

      </section>

      {/* ABOUT */}

      <section id="about" className="py-20">

        <div className="max-w-4xl mx-auto px-6 text-center">

          <Leaf className="text-green-600 mx-auto"
            size={40} />

          <h2 className="text-3xl font-bold mt-5">

            Better Choices. Less Waste.

          </h2>

          <p className="text-gray-500 leading-8 mt-5">

            NeedNotBuy encourages responsible consumption
            by connecting people with alternatives to
            unnecessary purchases. Our goal is to help
            communities save money and use resources better.

          </p>

          <div className="flex justify-center items-center
            gap-2 mt-6 text-green-700 font-semibold">

            <ShieldCheck size={20} />

            Smarter and more responsible consumption

          </div>

        </div>

      </section>

      <Footer />

    </div>

  );

}

export default Home;