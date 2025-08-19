package com.example.backend.community.service;

import com.example.backend.community.dto.NotificationDto;
import com.example.backend.community.dto.request.SendNotificationRequest;
import java.util.List;

public interface NotificationService {
    List<NotificationDto> getUserNotifications(String userId);
    void sendNotification(SendNotificationRequest request, String senderId);
    void markAsRead(String notificationId, String userId);
    int getUnreadCount(String userId);
    void markAllAsRead(String userId);
    void sendJobApplicationNotification(String recipientId, String type, String title, String message, String jobId);
}