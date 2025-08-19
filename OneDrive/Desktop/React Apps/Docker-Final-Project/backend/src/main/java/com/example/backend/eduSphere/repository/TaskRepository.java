package com.example.backend.eduSphere.repository;

import com.example.backend.eduSphere.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {

    // Find tasks by course ID
    List<Task> findByCourseIdOrderByDueDateAsc(String courseId);

    // Find tasks by course ID with pagination
    Page<Task> findByCourseIdOrderByDueDateAsc(String courseId, Pageable pageable);

    // Find tasks by instructor ID
    List<Task> findByInstructorIdOrderByDueDateAsc(String instructorId);

    // Find tasks by status
    List<Task> findByCourseIdAndStatusOrderByDueDateAsc(String courseId, String status);

    // Find active tasks


    // Find tasks due soon (within next X days)
    @Query("{ 'courseId': ?0, 'dueDate': { $gte: ?1, $lte: ?2 }, 'status': 'active' }")
    List<Task> findByCourseIdAndDueDateBetweenAndStatusActive(String courseId, LocalDate startDate, LocalDate endDate);

    // Find overdue tasks
    @Query("{ 'courseId': ?0, 'dueDate': { $lt: ?1 }, 'status': 'active' }")
    List<Task> findByCourseIdAndDueDateBeforeAndStatusActive(String courseId, LocalDate currentDate);

    // Find tasks by visibility
    List<Task> findByCourseIdAndVisibleToStudentsTrue(String courseId);

    // Find tasks that accept submissions
    @Query("{ 'courseId': ?0, 'allowSubmissions': true, 'requiresSubmission': true, 'status': 'active', " +
            "'visibleToStudents': true, " +
            "$or: [ " +
            "  { 'publishDate': { $exists: false } }, " +
            "  { 'publishDate': null }, " +
            "  { 'publishDate': { $lte: ?1 } } " +
            "] }")
    List<Task> findAvailableTasksForStudents(String courseId, LocalDateTime currentTime);

    // Count tasks by course and status
    long countByCourseIdAndStatus(String courseId, String status);

    // Find tasks with specific types
    List<Task> findByCourseIdAndTypeInOrderByDueDateAsc(String courseId, List<String> types);

    // Find tasks by category
    List<Task> findByCourseIdAndCategoryOrderByDueDateAsc(String courseId, String category);

    // Search tasks by title or description
    @Query("{ 'courseId': ?0, " +
            "$or: [ " +
            "  { 'title': { $regex: ?1, $options: 'i' } }, " +
            "  { 'description': { $regex: ?1, $options: 'i' } } " +
            "] }")
    List<Task> searchByCourseIdAndTitleOrDescription(String courseId, String searchTerm);

    // Find tasks created within date range
    List<Task> findByCourseIdAndCreatedAtBetween(String courseId, LocalDateTime startDate, LocalDateTime endDate);

    // Find tasks by priority
    List<Task> findByCourseIdAndPriorityOrderByDueDateAsc(String courseId, String priority);

    // Find tasks by difficulty
    List<Task> findByCourseIdAndDifficultyOrderByDueDateAsc(String courseId, String difficulty);

    // Find tasks that need grading (have submissions but not all graded)
    @Query("{ 'courseId': ?0, 'submissionCount': { $gt: 0 }, " +
            "$expr: { $lt: ['$gradedCount', '$submissionCount'] } }")
    List<Task> findTasksNeedingGrading(String courseId);

    // Find tasks by tags
    @Query("{ 'courseId': ?0, 'tags': { $in: ?1 } }")
    List<Task> findByCourseIdAndTagsIn(String courseId, List<String> tags);

    // Find tasks with prerequisites
    List<Task> findByCourseIdAndPrerequisiteTasksNotEmpty(String courseId);

    // Find tasks that are prerequisites for other tasks
    @Query("{ 'courseId': ?0, 'prerequisiteTasks': { $in: [?1] } }")
    List<Task> findTasksWithPrerequisite(String courseId, String taskId);

    // Statistics queries
    @Query(value = "{ 'courseId': ?0 }", count = true)
    long countByCourseId(String courseId);

    @Query("{ 'courseId': ?0, 'status': 'active', 'submissionCount': { $gt: 0 } }")
    List<Task> findActiveTasksWithSubmissions(String courseId);

    // Find tasks by instructor and date range
    @Query("{ 'instructorId': ?0, 'createdAt': { $gte: ?1, $lte: ?2 } }")
    List<Task> findByInstructorIdAndCreatedAtBetween(String instructorId, LocalDateTime startDate, LocalDateTime endDate);

    // Find tasks by multiple course IDs (for multi-course instructors)
    List<Task> findByCourseIdInOrderByDueDateAsc(List<String> courseIds);

    // Find tasks that are published and visible
    @Query("{ 'courseId': ?0, 'visibleToStudents': true, 'status': 'active', " +
            "$or: [ " +
            "  { 'publishDate': { $exists: false } }, " +
            "  { 'publishDate': null }, " +
            "  { 'publishDate': { $lte: ?1 } } " +
            "] }")
    List<Task> findPublishedTasks(String courseId, LocalDateTime currentTime);

    // Exists check for task in course
    boolean existsByCourseIdAndId(String courseId, String taskId);

    // Delete tasks by course (for cleanup)
    void deleteByCourseId(String courseId);

    // Find tasks with file attachments
    List<Task> findByCourseIdAndFileUrlIsNotNull(String courseId);

    // Find tasks requiring submission
    List<Task> findByCourseIdAndRequiresSubmissionTrue(String courseId);

    // Find tasks by estimated duration range
    @Query("{ 'courseId': ?0, 'estimatedDuration': { $gte: ?1, $lte: ?2 } }")
    List<Task> findByCourseIdAndEstimatedDurationBetween(String courseId, Integer minDuration, Integer maxDuration);

    // Find tasks by progress percentage
    @Query("{ 'courseId': ?0, 'progress': { $gte: ?1 } }")
    List<Task> findByCourseIdAndProgressGreaterThanEqual(String courseId, Integer minProgress);

    // Advanced queries for dashboard analytics
    @Query("{ 'courseId': ?0, 'status': 'active', 'dueDate': { $gte: ?1 } }")
    List<Task> findUpcomingActiveTasks(String courseId, LocalDate fromDate);

    @Query("{ 'courseId': ?0, 'status': 'active', 'dueDate': { $lt: ?1 }, 'progress': { $lt: 100 } }")
    List<Task> findOverdueIncompleteTasks(String courseId, LocalDate currentDate);

    // Group operations
    @Query("{ 'courseId': ?0, 'category': 'group' }")
    List<Task> findGroupTasks(String courseId);

    // Individual tasks
    @Query("{ 'courseId': ?0, 'category': 'individual' }")
    List<Task> findIndividualTasks(String courseId);
}