import { useState } from "react";
import { Search } from "lucide-react";
import { analyzeRequirement } from "../services/aiService";

function SearchBar() {

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {

    if (query.trim().length < 3) {
      setError("Please describe what you need.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await analyzeRequirement(query);

      console.log("AI Result:", result);

      // Navigate to the results page
      // and pass the returned requirement data.

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Unable to analyze your requirement."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">

      <div className="flex items-center gap-3
        bg-white p-3 rounded-2xl shadow-lg
        border border-gray-200">

        <Search className="text-green-600" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need?"
          className="flex-1 outline-none p-2"
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-green-600 text-white
            px-5 py-3 rounded-xl
            hover:bg-green-700
            disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Search"}
        </button>

      </div>

      {error && (
        <p className="text-red-600 mt-2">
          {error}
        </p>
      )}

    </div>
  );
}

export default SearchBar;