import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRecommendations } from "../services/aiService";
import { Sparkles, LoaderCircle, ArrowLeft } from "lucide-react";

const TYPE_LABELS = {
  borrow: { label: "Borrow", color: "bg-blue-100 text-blue-700" },
  rent: { label: "Rent", color: "bg-yellow-100 text-yellow-700" },
  second_hand: { label: "Second-hand", color: "bg-purple-100 text-purple-700" },
};

function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const requirement = location.state?.requirement;
  const originalQuery = location.state?.originalQuery;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requirement && !originalQuery) {
      navigate("/analyze");
      return;
    }

    const query = originalQuery || requirement?.item || "";

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const result = await getRecommendations(query);
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
        <div className="text-center">
          <LoaderCircle className="animate-spin text-green-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 text-lg">Finding smarter options for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/analyze")}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { requirement: req, recommended_item, alternatives, reason } = data || {};

  return (
    <div className="min-h-screen bg-[#f8faf9] px-5 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate("/analyze")}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-8"
        >
          <ArrowLeft size={18} />
          Back to Search
        </button>

        {/* Requirement Summary */}
        {req && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-green-600" size={20} />
              <h2 className="text-lg font-bold">Your Requirement</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Item", value: req.item },
                { label: "Duration", value: `${req.duration_days} day(s)` },
                { label: "Purpose", value: req.purpose || "Not specified" },
                { label: "Urgency", value: req.urgency || "Normal" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-semibold capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {!alternatives || alternatives.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <p className="text-gray-500 text-lg">
              No items found for your requirement. Try a different search.
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
            >
              Search Again
            </button>
          </div>
        ) : (
          <>
            {/* AI Recommendation Reason */}
            {reason && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8">
                <p className="text-green-800 font-medium">💡 {reason}</p>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available Options ({alternatives.length})
            </h2>

            {/* Items Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {alternatives.map((option) => {
                const typeInfo = TYPE_LABELS[option.type] || {
                  label: option.type,
                  color: "bg-gray-100 text-gray-700",
                };
                const isRecommended =
                  recommended_item?.item_id === option.item_id;

                return (
                  <div
                    key={option.item_id}
                    className={`bg-white rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${
                      isRecommended
                        ? "border-green-400 ring-2 ring-green-200"
                        : "border-gray-200"
                    }`}
                  >
                    {isRecommended && (
                      <div className="inline-flex items-center gap-1 bg-green-600 text-white text-xs px-3 py-1 rounded-full mb-3">
                        <Sparkles size={12} />
                        Best Match
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>
                        <h3 className="text-lg font-bold mt-2">
                          {option.title}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Score</p>
                        <p className="font-bold text-green-600">
                          {option.score.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-gray-600 font-semibold">
                      {option.type === "borrow"
                        ? "Free"
                        : `₹${option.estimated_cost.toFixed(2)}`}
                    </p>

                    <button
                      onClick={() =>
                        navigate(`/product/${option.item_id}`, {
                          state: { itemId: option.item_id },
                        })
                      }
                      className="w-full mt-5 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium"
                    >
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Results;
