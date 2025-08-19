package com.example.backend.eduSphere.service;

import com.example.backend.eduSphere.dto.request.AnnouncementRequest;
import com.example.backend.eduSphere.dto.response.AnnouncementResponse;
import com.example.backend.eduSphere.dto.response.CourseDto; // We'll need a DTO for courses
import com.example.backend.eduSphere.dto.response.DepartmentDto; // And for departments

import java.util.List;

public interface AnnouncementService {

    List<AnnouncementResponse> getAnnouncementsForUser(String userId, String userRole);

    List<AnnouncementResponse> getMyAnnouncements(String userId);

    AnnouncementResponse getAnnouncementById(String announcementId);

    AnnouncementResponse createAnnouncement(AnnouncementRequest announcementRequest, String creatorId, String creatorName);

    AnnouncementResponse updateAnnouncement(String announcementId, AnnouncementRequest announcementRequest, String updaterId, String userRole);
    AnnouncementResponse duplicateAnnouncement(String announcementId, AnnouncementRequest newAnnouncementRequest, String creatorId, String creatorName, String userRole);

    void deleteAnnouncement(String announcementId, String deleterId, String userRole);

    List<DepartmentDto> getDepartmentsForUser(String userId, String userRole);

    List<CourseDto> getCoursesByDepartmentForUser(String userId, String userRole, String departmentName);


}