import axiosClient from '../axiosClient';
import type { MedicineFormData } from '@/components/reminder/types';

export type CreateReminderData = MedicineFormData;
export type UpdateReminderData = Partial<MedicineFormData>;

export const reminderApi = {
  // Get all reminders
  getReminders: (params?: { is_active?: boolean; medicine_type?: string }) => {
    return axiosClient.get('/reminders/', { params });
  },

  // Get single reminder
  getReminder: (id: number) => {
    return axiosClient.get(`/reminders/${id}/`);
  },

  // Create reminder
  createReminder: (data: CreateReminderData) => {
    return axiosClient.post('/reminders/', data);
  },

  // Update reminder
  updateReminder: (id: number, data: UpdateReminderData) => {
    return axiosClient.put(`/reminders/${id}/`, data);
  },

  // Partial update reminder
  patchReminder: (id: number, data: Partial<UpdateReminderData>) => {
    return axiosClient.patch(`/reminders/${id}/`, data);
  },

  // Delete reminder
  deleteReminder: (id: number) => {
    return axiosClient.delete(`/reminders/${id}/`);
  },

  // Activate reminder
  activateReminder: (id: number) => {
    return axiosClient.post(`/reminders/${id}/activate/`);
  },

  // Deactivate reminder
  deactivateReminder: (id: number) => {
    return axiosClient.post(`/reminders/${id}/deactivate/`);
  },

  // Update quantity
  updateQuantity: (id: number, quantity: number) => {
    return axiosClient.post(`/reminders/${id}/update_quantity/`, { quantity });
  },

  // Get today's schedule
  getTodaySchedule: () => {
    return axiosClient.get('/reminders/today_schedule/');
  },
};