import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPaymentOrder, capturePayment } from "../services/paymentService";
import { LoaderCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;
  const item = location.state?.item;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [approvalUrl, setApprovalUrl] = useState(null);

  // Check if we're returning from PayPal with an order_id in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id") || params.get("token");

    if (orderId) {
      handleCapture(orderId);
    }
  }, []);

  if (!booking || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No booking found. Please start over.</p>
          <button
            onClick={() => navigate("/analyze")}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await createPaymentOrder(booking.id);

      setPaypalOrderId(data.paypal_order_id);
      setApprovalUrl(data.approval_url);

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Failed to create payment order."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async (orderId) => {
    try {
      setLoading(true);
      setError("");

      await capturePayment(orderId);
      setSuccess(true);

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Payment capture failed."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">
          <CheckCircle className="text-green-600 mx-auto mb-4" size={56} />
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-500 mt-3">
            Your booking for <strong>{item.title}</strong> has been confirmed.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full mt-8 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] px-5 py-12">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-8"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Payment</h1>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Item</span>
              <span className="font-medium">{item.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Start Date</span>
              <span className="font-medium">{booking.start_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">End Date</span>
              <span className="font-medium">{booking.end_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-medium capitalize">{booking.status}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="text-gray-900 font-bold">Total Amount</span>
              <span className="text-green-600 font-bold text-lg">
                ₹{booking.total_amount}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-5">
            {error}
          </div>
        )}

        {/* PayPal approval link */}
        {approvalUrl ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <p className="text-gray-700 mb-4">
              Your PayPal order has been created. Click below to complete the payment:
            </p>
            <a
              href={approvalUrl}
              className="inline-block bg-[#003087] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#002069] transition"
            >
              Pay with PayPal
            </a>
          </div>
        ) : (
          <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="w-full bg-[#003087] text-white py-4 rounded-xl hover:bg-[#002069] transition font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              "Pay with PayPal"
            )}
          </button>
        )}

      </div>
    </div>
  );
}
