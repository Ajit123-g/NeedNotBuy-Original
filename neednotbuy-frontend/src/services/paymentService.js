import api from "./api";

export const createPaymentOrder = async (bookingId) => {
  const response = await api.post("/api/payments/create-order", {
    booking_id: bookingId,
  });
  return response.data;
};

export const capturePayment = async (orderId) => {
  const response = await api.post(
    `/api/payments/capture-order/${orderId}`
  );
  return response.data;
};
