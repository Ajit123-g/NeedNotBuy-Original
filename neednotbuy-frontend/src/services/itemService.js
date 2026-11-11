import api from "./api";

export const getItems = async (params = {}) => {
  const response = await api.get("/api/items", { params });
  return response.data;
};

export const getItemById = async (id) => {
  const response = await api.get(`/api/items/${id}`);
  return response.data;
};

export const searchItems = async (query) => {
  const response = await api.get("/api/items/search", {
    params: { q: query },
  });
  return response.data;
};
