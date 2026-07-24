import {
  getNotificationReadAtApi,
  markAllNotificationsAsReadApi,
} from "../api/notificationReadApi";

export const getNotificationReadAtService = async () => {
  const response = await getNotificationReadAtApi();
  const readAt = response?.data?.data?.readAt || null;
  return { readAt };
};

export const markAllNotificationsAsReadService = async () => {
  const response = await markAllNotificationsAsReadApi();
  return response?.data?.data || { success: true };
};
