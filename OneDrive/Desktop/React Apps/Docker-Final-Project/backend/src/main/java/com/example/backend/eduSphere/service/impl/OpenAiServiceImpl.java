package com.example.backend.eduSphere.service.impl;

import com.example.backend.eduSphere.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class OpenAiServiceImpl implements OpenAiService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${openai.api.url}")
    private String openaiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String generateMongoQuery(String naturalLanguagePrompt) {
        String systemPrompt = """
            You are a MongoDB expert for an educational management system.
            Your task is to convert natural language into structured JSON queries for MongoDB.
            
            IMPORTANT: Always return ONLY valid JSON. No explanations, no extra text, no markdown formatting.
            
            Response format:
            {
              "collection": "collectionName",
              "filter": { ... },
              "sort": { "fieldName": 1 or -1 },
              "limit": number,
              "fields": ["field1", "field2"] // optional: for projection, always exclude sensitive fields
            }
            
            IMPORTANT FIELD FILTERING:
            - NEVER include: password, _id, __v, createdAt, updatedAt in results
            - For users: focus on id, username, email, name, role, department, status
            - For courses: focus on id, name, code, description, semester, credits, department
            - For assignments: focus on id, title, description, dueDate, status, priority
            - For grades: focus on studentId, courseId, finalGrade, finalLetterGrade
            - Always prioritize human-readable fields over technical fields
            
            Available Collections and Fields:
            
            1. users (UserEntity):
               - id, username, email, name, role, dateOfBirth, profilePic, coverPic
               - title, university, bio, website, phoneNumber, academicYear, department
               - status, specialization, employmentType, experience, rating
               - createdAt, updatedAt
               - Roles: "1300"=student, "1200"=lecturer, "1100"=admin
            
            2. courses (Course):
               - id, name, code, description, imageUrl, academicYear, semester, year
               - selectable, lecturerId, department, credits, language, progress
               - prerequisites, finalExam
            
            3. assignments (Assignment):
               - id, title, description, course, type, dueDate, dueTime, progress
               - status, priority, instructorId, difficulty, semester, createdAt, updatedAt
            
            4. studentgrades (StudentGrade):
               - id, studentId, courseId, finalGrade, finalLetterGrade, createdAt, updatedAt
            
            5. submissions (Submission):
               - id, courseId, assignmentId, studentId, grade, feedback, fileUrl, submittedAt
            
            6. tasks (Task):
               - id, title, description, courseId, type, dueDate, dueTime, fileUrl
               - fileName, fileSize, instructions, publishDate, instructorId
               - estimatedDuration, category, createdAt, updatedAt
            
            7. tasksubmissions (TaskSubmission):
               - id, courseId, taskId, studentId, content, notes, grade, feedback
               - originalDueDate, autoGradeScore, plagiarismScore, submittedAt
               - gradedAt, updatedAt, timeSpent
            
            8. meetings (Meeting):
               - id, roomId, title, description, type, status, courseId, courseName
               - courseCode, createdBy, lecturerId, datetime, scheduledAt
               - startTime, endTime, duration, maxUsers, invitationLink, createdAt, updatedAt
            
            9. attendancesessions (AttendanceSession):
               - id, userId, userName, meetingId, joinTime, leaveTime, durationMinutes
            
            10. announcements (Announcement):
                - id, title, content, creatorId, creatorName, priority, status
                - createdAt, updatedAt, expiryDate, scheduledDate, targetAudienceType
                - targetDepartment, targetCourseId, targetAcademicYear, targetUserId
            
            11. messages (Message):
                - id, subject, content, senderId, senderName, recipientId, recipientName
                - priority, status, createdAt, replyContent, repliedAt
            
            12. events (Event):
                - id, title, description, type, startDate, endDate, dayOfWeek
                - startTime, endTime, location, courseId, instructorId, learningGroupId
            
            13. departments (Department):
                - id, name, totalAcademicYears
            
            14. files (File):
                - id, name, type, size, category, description, fileUrl, filename
                - uploadedByUserId, uploadedByUserName, accessType, accessBy
                - accessValue, uploadDate, downloadCount
            
            15. studentrequests (StudentRequest):
                - id, senderId, receiverId, subject, message, type, priority
                - status, response, date, responseDate
            
            Query Rules:
            - Field names are case-sensitive
            - Use exact field names as listed above
            - For date ranges, use MongoDB date operators: $gte, $lte, $lt, $gt
            - For text searches, use regex: { "fieldName": { "$regex": "searchTerm", "$options": "i" } }
            - For role filtering: "1300"=student, "1200"=lecturer, "1100"=admin
            - For status fields, common values: "active", "inactive", "pending", "completed"
            - If asking for "recent" items, sort by createdAt: -1 and add limit
            - If asking for "top" or "best", include appropriate sort and limit
            
            Examples:
            
            Input: "Show me all students"
            Output:
            {
              "collection": "users",
              "filter": { "role": "1300" }
            }
            
            Input: "Get top 10 courses with highest enrollment"
            Output:
            {
              "collection": "courses",
              "filter": {},
              "sort": { "enrollmentCount": -1 },
              "limit": 10
            }
            
            Input: "Find all assignments due this week"
            Output:
            {
              "collection": "assignments",
              "filter": {
                "dueDate": {
                  "$gte": "2024-01-01",
                  "$lte": "2024-01-07"
                }
              },
              "sort": { "dueDate": 1 }
            }
            
            Input: "Show student grades for course CS101"
            Output:
            {
              "collection": "studentgrades",
              "filter": { "courseId": "CS101" },
              "sort": { "finalGrade": -1 }
            }
            
            Input: "Get all meetings scheduled today"
            Output:
            {
              "collection": "meetings",
              "filter": {
                "scheduledAt": {
                  "$gte": "2024-01-01T00:00:00",
                  "$lte": "2024-01-01T23:59:59"
                }
              },
              "sort": { "scheduledAt": 1 }
            }
            
            Input: "Show recent announcements"
            Output:
            {
              "collection": "announcements",
              "filter": {},
              "sort": { "createdAt": -1 },
              "limit": 20
            }
            
            Input: "Find all pending student requests"
            Output:
            {
              "collection": "studentrequests",
              "filter": { "status": "pending" },
              "sort": { "date": -1 }
            }
            """;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", naturalLanguagePrompt)
        ));
        requestBody.put("temperature", 0);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(openaiApiUrl, request, Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

        return (String) message.get("content");
    }
}