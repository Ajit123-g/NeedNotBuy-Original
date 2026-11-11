import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { createBooking } from "../services/bookingService";


function Booking() {

  const navigate = useNavigate();
  const location = useLocation();

  const item = location.state?.item;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  if (!item) {
    return (
      <div>
        No item selected.
      </div>
    );
  }


  const handleBooking = async () => {

    if (!startDate || !endDate) {
      setError("Please select both dates.");
      return;
    }


    if (new Date(endDate) <= new Date(startDate)) {
      setError(
        "End date must be after start date."
      );
      return;
    }


    try {

      setLoading(true);
      setError("");


      const bookingData = {
        item_id: item.id,
        start_date: startDate,
        end_date: endDate,
      };


      const booking = await createBooking(
        bookingData
      );


      console.log("Booking created:", booking);


      navigate("/payment", {
        state: {
          booking: booking,
          item: item,
        },
      });


    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to create booking."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="max-w-2xl mx-auto mt-10 p-8">

      <h1 className="text-3xl font-bold">
        Book Your Item
      </h1>


      <div className="bg-white shadow rounded-xl p-6 mt-6">

        <h2 className="text-xl font-semibold">
          {item.title}
        </h2>


        <p className="text-gray-600 mt-2">
          ₹{item.price} per day
        </p>


        <div className="mt-6">

          <label>
            Start Date
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            className="border p-3 w-full rounded-lg mt-2"
          />

        </div>


        <div className="mt-4">

          <label>
            End Date
          </label>

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
            className="border p-3 w-full rounded-lg mt-2"
          />

        </div>


        {error && (

          <p className="text-red-600 mt-4">
            {error}
          </p>

        )}


        <button
          onClick={handleBooking}
          disabled={loading}
          className="
            w-full
            bg-green-600
            text-white
            p-4
            rounded-xl
            mt-6
            hover:bg-green-700
            disabled:opacity-50
          "
        >

          {loading
            ? "Creating Booking..."
            : "Continue to Payment"
          }

        </button>

      </div>

    </div>

  );
}


export default Booking;