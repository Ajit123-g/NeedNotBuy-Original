import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Search, Calendar, LogOut } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Uses /api/bookings/my which extracts user from Bearer token
      const response = await api.get("/api/bookings/my");
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] p-6">

      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Welcome card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Welcome back! 👋</h2>
          <p className="mt-2 text-gray-500">
            Logged in as{" "}
            <span className="text-green-600 font-semibold">{user?.email}</span>
          </p>
          <button
            onClick={() => navigate("/analyze")}
            className="mt-5 flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-medium"
          >
            <Search size={18} />
            Find Something New
          </button>
        </div>

        {/* Bookings */}
        <h2 className="text-xl font-bold text-gray-900 mb-5">My Bookings</h2>

        {loading ? (
          <p className="text-gray-500">Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
            <Calendar className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-gray-500">You don't have any bookings yet.</p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-5 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-medium"
            >
              Find Something to Borrow or Rent
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((booking) => {
              const statusColor =
                STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-600";

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                >
                  <h3 className="font-bold text-gray-900">
                    {booking.items?.title || "Item"}
                  </h3>

                  <div className="mt-3 space-y-1 text-sm text-gray-500">
                    <p>
                      📅 {booking.start_date} → {booking.end_date}
                    </p>
                    <p className="font-semibold text-gray-900">
                      ₹{booking.total_amount}
                    </p>
                  </div>

                  <span
                    className={`inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}
                  >
                    {booking.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
