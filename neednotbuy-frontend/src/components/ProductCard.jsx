import { Link } from "react-router-dom";

const TYPE_LABELS = {
  borrow: { label: "Borrow", color: "bg-blue-100 text-blue-700" },
  rent: { label: "Rent", color: "bg-yellow-100 text-yellow-700" },
  second_hand: { label: "Second-hand", color: "bg-purple-100 text-purple-700" },
};

function ProductCard({ item }) {
  const typeInfo = TYPE_LABELS[item.type] || {
    label: item.type,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">

      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-4xl">
          📦
        </div>
      )}

      <div className="p-5">

        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeInfo.color}`}>
          {typeInfo.label}
        </span>

        <h2 className="text-xl font-bold mt-3 text-gray-900">
          {item.title}
        </h2>

        {item.description && (
          <p className="text-gray-500 mt-2 text-sm line-clamp-2">
            {item.description}
          </p>
        )}

        <p className="text-lg font-bold mt-4 text-green-600">
          {item.type === "borrow" ? "Free" : `₹${item.price}`}
        </p>

        {item.deposit > 0 && (
          <p className="text-sm text-gray-400 mt-1">
            Deposit: ₹{item.deposit}
          </p>
        )}

        <Link
          to={`/product/${item.id}`}
          state={{ itemId: item.id }}
          className="block mt-4 text-center bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition font-medium"
        >
          View Details
        </Link>

      </div>
    </div>
  );
}

export default ProductCard;
