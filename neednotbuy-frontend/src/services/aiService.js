import api from "./api";

export const analyzeRequirement = async (query) => {
  try {
    const response = await api.post("/api/ai/analyze", { query });
    return response.data;
  } catch (error) {
    console.error("AI Analysis Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getRecommendations = async (query) => {
  try {
    const response = await api.post("/api/ai/recommend", { query });
    return response.data;
  } catch (error) {
    console.error(
      "Recommendation Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
