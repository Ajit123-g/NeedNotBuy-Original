import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getItemById } from "../services/itemService";
import { LoaderCircle, ArrowLeft, Calendar, Tag, Info } from "lucide-react";

const TYPE_LABELS = {
  borrow: { label: "Borrow", color: "bg-blue-100 text-blue-700" },
  rent: { label: "Rent", color: "bg-yellow-100 text-yellow-700" },
  second_hand: { label: "Second-hand", color: "bg-purple-100 text-purple-700" },
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await getItemById(id);
        setItem(data);
      } catch (err) {
        console.error(err);
        setError("Item not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
        <LoaderCircle className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || "Item not found."}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const typeInfo = TYPE_LABELS[item.type] || {
    label: item.type,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] px-5 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-8"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Image */}
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-72 object-cover"
            />
          ) : (
            <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-300 text-6xl">
              📦
            </div>
          )}

          <div className="p-8">

            {/* Type badge */}
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${typeInfo.color}`}>
              {typeInfo.label}
            </span>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mt-4">
              {item.title}
            </h1>

            {/* Category */}
            {item.category && (
              <div className="flex items-center gap-2 mt-3 text-gray-500">
                <Tag size={16} />
                <span className="text-sm">{item.category}</span>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="flex items-start gap-2 mt-4 text-gray-600">
                <Info size={16} className="mt-1 shrink-0" />
                <p className="leading-7">{item.description}</p>
              </div>
            )}

            {/* Pricing */}
            <div className="mt-6 p-5 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">
                {item.type === "borrow"
                  ? "Free to Borrow"
                  : item.type === "rent"
                  ? `₹${item.price} / day`
                  : `₹${item.price}`}
              </p>
              {item.deposit > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Refundable deposit: ₹{item.deposit}
                </p>
              )}
              <p className={`mt-2 text-sm font-semibold ${item.availability ? "text-green-600" : "text-red-500"}`}>
                {item.availability ? "✓ Available" : "✗ Not Available"}
              </p>
            </div>

            {/* Book Now */}
            {item.availability && (
              <button
                onClick={() =>
                  navigate("/booking", {
                    state: { item },
                  })
                }
                className="w-full mt-6 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Calendar size={20} />
                {item.type === "borrow"
                  ? "Request to Borrow"
                  : item.type === "rent"
                  ? "Book for Rental"
                  : "Purchase Now"}
              </button>
            )}

            {!item.availability && (
              <div className="w-full mt-6 bg-gray-100 text-gray-500 py-4 rounded-xl text-center font-medium">
                Currently Unavailable
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
