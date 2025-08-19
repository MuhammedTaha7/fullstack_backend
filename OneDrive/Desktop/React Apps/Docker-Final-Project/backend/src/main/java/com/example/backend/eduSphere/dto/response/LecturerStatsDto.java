package com.example.backend.eduSphere.dto.response;

import lombok.Data;

@Data
public class LecturerStatsDto {
    private Integer activeCourses;
    private Integer totalStudents;
    private Double averageRating;
    private Integer totalPublications;
    private String employmentStatus;
}