import api from "./api";

export const createBooking = async (bookingData) => {

  const response = await api.post(
    "/api/bookings",
    bookingData
  );

  return response.data;
};