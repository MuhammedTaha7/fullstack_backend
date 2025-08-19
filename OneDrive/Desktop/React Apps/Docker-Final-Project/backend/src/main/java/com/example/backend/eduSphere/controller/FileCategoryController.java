package com.example.backend.eduSphere.controller;

import com.example.backend.eduSphere.dto.request.CreateCategoryRequest;
import com.example.backend.eduSphere.entity.FileCategory;
import com.example.backend.eduSphere.service.CourseContentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FileCategoryController {

    private final CourseContentService courseContentService;

    public FileCategoryController(CourseContentService courseContentService) {
        this.courseContentService = courseContentService;
    }

    /**
     * POST /api/categories : Create a new file category.
     * The courseId must be set in the request body.
     */
    @PostMapping
    public ResponseEntity<FileCategory> createCategory(
            @RequestParam String courseId,
            @RequestParam int year,
            @RequestBody CreateCategoryRequest request
    ) {
        FileCategory createdCategory = courseContentService.createCategory(courseId, year, request);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    /**
     * GET /api/categories/by-course/{courseId} : Get all categories for a specific course.
     */
    @GetMapping("/by-course/{courseId}")
    public ResponseEntity<List<FileCategory>> getCategoriesByCourse(
            @PathVariable String courseId,
            @RequestParam int year // This captures the "?year=2024" part of the URL
    ) {
        List<FileCategory> categories = courseContentService.getCategoriesByCourse(courseId, year);
        return ResponseEntity.ok(categories);
    }

    /**
     * PUT /api/categories/{categoryId} : Update an existing category.
     */
    @PutMapping("/{categoryId}")
    public ResponseEntity<FileCategory> updateCategory(@PathVariable String categoryId, @RequestBody FileCategory categoryDetails) {
        FileCategory updatedCategory = courseContentService.updateCategory(categoryId, categoryDetails);
        return ResponseEntity.ok(updatedCategory);
    }

    /**
     * DELETE /api/categories/{categoryId} : Delete a category and all its files.
     */
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String categoryId) {
        courseContentService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build(); // Standard practice for a successful delete
    }
}