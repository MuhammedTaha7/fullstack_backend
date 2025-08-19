package com.example.backend.eduSphere.service;

import com.example.backend.eduSphere.dto.request.GradeRequestDto;
import com.example.backend.eduSphere.dto.response.GradeResponseDto;
import com.example.backend.eduSphere.entity.GradeColumn;
import com.example.backend.eduSphere.entity.StudentGrade;

import java.util.List;
import java.util.Optional;

public interface GradeService {
    // Grade Columns
    List<GradeColumn> getGradeColumnsByCourse(String courseId);
    GradeColumn createGradeColumn(GradeColumn gradeColumn);
    GradeColumn updateGradeColumn(String columnId, GradeColumn updates);
    void deleteGradeColumn(String columnId);

    // Student Grades
    List<StudentGrade> getGradesByCourse(String courseId);
    StudentGrade updateStudentGrade(String studentId, String columnId, Double grade);
    void deleteStudentGrades(String studentId, String courseId);
    Double calculateFinalGrade(String studentId, String courseId);
    String calculateLetterGrade(Double percentage);

    List<GradeResponseDto> getGradesByStudentId(String studentId);
    GradeResponseDto addGrade(GradeRequestDto gradeDto);
    GradeResponseDto updateGrade(String gradeId, GradeRequestDto gradeDto);

    // Validation
    boolean validateGradeColumnPercentage(String courseId, Integer percentage, String excludeColumnId);
}