import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 90_000, // AI generations can legitimately take a while
});

function unwrapError(err) {
  const message =
    err?.response?.data?.error || err?.message || "Something went wrong. Please try again.";
  const error = new Error(message);
  error.details = err?.response?.data?.details;
  error.status = err?.response?.status;
  throw error;
}

export const simulationApi = {
  simulate: async ({ decision, horizonYears, profile, whatIf, parentId }) => {
    try {
      const { data } = await api.post("/simulate", {
        decision,
        horizonYears,
        profile,
        whatIf,
        parentId,
      });
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },

  listHistory: async () => {
    try {
      const { data } = await api.get("/history");
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },

  getHistoryItem: async (id) => {
    try {
      const { data } = await api.get(`/history/${id}`);
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },

  getReport: async (id) => {
    try {
      const { data } = await api.get(`/report/${id}`);
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
};

export default api;
