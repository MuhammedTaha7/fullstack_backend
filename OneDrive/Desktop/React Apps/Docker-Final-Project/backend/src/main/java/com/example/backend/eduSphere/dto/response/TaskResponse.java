package com.example.backend.eduSphere.dto.response;

import com.example.backend.eduSphere.entity.Task;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskResponse {

    private String id;
    private String title;
    private String description;
    private String courseId;
    private String courseName; // Populated from course data
    private String type;
    private LocalDate dueDate;
    private LocalTime dueTime;
    private LocalDateTime dueDateTime;
    private Integer maxPoints;
    private String status;
    private String priority;
    private String difficulty;
    private String category;
    private String instructions;
    private Integer estimatedDuration;

    // File attachment info
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private boolean hasAttachment;

    // Submission settings
    private Boolean allowSubmissions;
    private Boolean allowLateSubmissions;
    private Double latePenaltyPerDay;
    private Boolean visibleToStudents;
    private Boolean requiresSubmission;
    private Integer maxAttempts;
    private LocalDateTime publishDate;

    // Statistics
    private Integer submissionCount;
    private Integer gradedCount;
    private Double averageGrade;
    private Integer enrolledStudents; // Total students in course
    private Double completionRate;

    // Status flags
    private boolean isOverdue;
    private boolean isPublished;
    private boolean acceptsSubmissions;

    // Instructor info
    private String instructorId;
    private String instructorName; // Populated from user data

    // Organization
    private List<String> tags;
    private List<String> prerequisiteTasks;
    private Integer progress;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskResponse fromEntity(Task task) {
        TaskResponse response = new TaskResponse();

        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setCourseId(task.getCourseId());
        response.setType(task.getType());
        response.setDueDate(task.getDueDate());
        response.setDueTime(task.getDueTime());
        response.setDueDateTime(task.getDueDateTime());
        response.setMaxPoints(task.getMaxPoints());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setDifficulty(task.getDifficulty());
        response.setCategory(task.getCategory());
        response.setInstructions(task.getInstructions());
        response.setEstimatedDuration(task.getEstimatedDuration());

        // File info
        response.setFileUrl(task.getFileUrl());
        response.setFileName(task.getFileName());
        response.setFileSize(task.getFileSize());
        response.setHasAttachment(task.hasFileAttachment());

        // Settings
        response.setAllowSubmissions(task.getAllowSubmissions());
        response.setAllowLateSubmissions(task.getAllowLateSubmissions());
        response.setLatePenaltyPerDay(task.getLatePenaltyPerDay());
        response.setVisibleToStudents(task.getVisibleToStudents());
        response.setRequiresSubmission(task.getRequiresSubmission());
        response.setMaxAttempts(task.getMaxAttempts());
        response.setPublishDate(task.getPublishDate());

        // Statistics
        response.setSubmissionCount(task.getSubmissionCount());
        response.setGradedCount(task.getGradedCount());
        response.setAverageGrade(task.getAverageGrade());
        response.setCompletionRate(task.getCompletionRate());

        // Status flags
        response.setOverdue(task.isOverdue());
        response.setPublished(task.isPublished());
        response.setAcceptsSubmissions(task.acceptsSubmissions());

        // Instructor
        response.setInstructorId(task.getInstructorId());

        // Organization
        response.setTags(task.getTags());
        response.setPrerequisiteTasks(task.getPrerequisiteTasks());
        response.setProgress(task.getProgress());

        // Timestamps
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());

        return response;
    }
}