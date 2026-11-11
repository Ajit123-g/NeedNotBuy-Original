import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Sparkles, LoaderCircle } from "lucide-react";

import { analyzeRequirement } from "../services/aiService";

function Analyze() {
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-fill query if navigated here from the Home page search box
  const [query, setQuery] = useState(location.state?.query || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (query.trim().length < 3) {
      setError("Please describe what you need.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await analyzeRequirement(query);

      console.log("AI Response:", data);

      setResult(data);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to analyze your requirement. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] px-5 py-16">

      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">

          <div className="inline-flex items-center gap-2
            bg-green-100 text-green-700
            px-4 py-2 rounded-full mb-5">

            <Sparkles size={18} />

            <span className="text-sm font-medium">
              AI-Powered Smart Search
            </span>

          </div>

          <h1 className="text-4xl font-bold text-gray-900">
            What do you need today?
          </h1>

          <p className="text-gray-500 mt-4">
            Tell us what you need. Our AI will understand
            your requirement and help you find smarter options.
          </p>

        </div>

        <form onSubmit={handleSearch}>

          <div className="bg-white border border-gray-200
            rounded-2xl p-3 shadow-lg">

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Example: I need a projector for 2 days for a college presentation..."
              rows={4}
              className="w-full resize-none outline-none
                p-4 text-gray-700"
            />

            <div className="flex justify-between items-center
              border-t pt-3">

              <span className="text-xs text-gray-400">
                Describe your requirement naturally
              </span>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white
                  px-6 py-3 rounded-xl
                  flex items-center gap-2
                  hover:bg-green-700
                  disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Find Options
                  </>
                )}

              </button>

            </div>

          </div>

        </form>

        {error && (
          <div className="mt-5 p-4 bg-red-50
            text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 bg-white rounded-2xl
            border border-gray-200 p-6 shadow-sm">

            <h2 className="text-xl font-bold mb-5">
              AI Requirement Analysis
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <p className="text-sm text-gray-500">Item</p>
                <p className="font-semibold capitalize">
                  {result.item || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Duration
                </p>
                <p className="font-semibold">
                  {result.duration_days != null
                    ? `${result.duration_days} days`
                    : "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="font-semibold">
                  {result.purpose || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Urgency</p>
                <p className="font-semibold">
                  {result.urgency || "Not specified"}
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                navigate("/results", {
                  state: {
                    requirement: result,
                    originalQuery: query
                  }
                })
              }
              className="w-full mt-7 bg-green-600
                text-white p-3 rounded-xl
                hover:bg-green-700"
            >
              Show Recommendations
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default Analyze;
