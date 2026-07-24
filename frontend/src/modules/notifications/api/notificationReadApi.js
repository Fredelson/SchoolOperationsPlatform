import api from "../../../services/api";

export const getNotificationReadAtApi = async () => {
  const response = await api.get("/notifications/read-at");
  return response.data;
};

export const markAllNotificationsAsReadApi = async () => {
  const response = await api.post("/notifications/mark-all-read");
  return response.data;
};
