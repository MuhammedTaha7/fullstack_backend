package com.example.backend.eduSphere.controller;

import com.example.backend.eduSphere.entity.Submission;
import com.example.backend.eduSphere.service.SubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
class SubmissionController {
    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    /**
     * GET /api/submissions/course/{courseId} : Get all submissions for a specific course.
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Submission>> getSubmissionsByCourse(@PathVariable String courseId) {
        List<Submission> submissions = submissionService.findSubmissionsByCourseId(courseId);
        return ResponseEntity.ok(submissions);
    }

    /**
     * POST /api/submissions : Create a new submission.
     */
    @PostMapping
    public ResponseEntity<Submission> createSubmission(@RequestBody Submission submission) {
        Submission createdSubmission = submissionService.createSubmission(submission);
        return new ResponseEntity<>(createdSubmission, HttpStatus.CREATED);
    }

    /**
     * GET /api/submissions/student/{studentId} : Get all submissions by a specific student.
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Submission>> getSubmissionsByStudent(@PathVariable String studentId) {
        List<Submission> submissions = submissionService.findSubmissionsByStudentId(studentId);
        return ResponseEntity.ok(submissions);
    }
}