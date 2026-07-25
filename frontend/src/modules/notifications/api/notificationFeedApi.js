import api from "../../../services/api";

export const getNotificationFeedApi = async (params = {}) => {
  const response = await api.get("/notifications/feed", { params });
  return response.data;
};
