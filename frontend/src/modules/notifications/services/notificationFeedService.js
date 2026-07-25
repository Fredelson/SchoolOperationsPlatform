import { getNotificationFeedApi } from "../api/notificationFeedApi";

export const getNotificationFeedService = async (params = {}) => {
  const response = await getNotificationFeedApi(params);
  return response?.data?.notifications || [];
};
