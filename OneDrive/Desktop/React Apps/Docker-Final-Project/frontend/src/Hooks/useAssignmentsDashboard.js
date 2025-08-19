/**
 * Custom Hook for Lecturer Dashboard - Complete Implementation with Enhanced File Handling
 * File: src/Hooks/useAssignmentsDashboard.js
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../Api/AssignmentsDashboardAPI';
import { calculateGradePercentage, validateGradeColumn, handleApiError } from '../Utils/AssignmentsDashboardUtils';

export const useLecturerDashboard = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState('grades');
  const [selectedCourse, setSelectedCourseState] = useState(null);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);
  const [selectedExamForPreview, setSelectedExamForPreview] = useState(null);
  const [selectedExamForResponses, setSelectedExamForResponses] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  // UI state
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data state
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [examResponses, setExamResponses] = useState([]);
  const [gradeColumns, setGradeColumns] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Form state for assignments - ENHANCED WITH FILE HANDLING
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    type: 'homework',
    dueDate: '',
    dueTime: '',
    maxPoints: 100,
    instructions: '',
    priority: 'medium',
    difficulty: 'medium',
    category: 'individual',
    allowSubmissions: true,
    allowLateSubmissions: false,
    latePenaltyPerDay: 0,
    visibleToStudents: true,
    requiresSubmission: true,
    maxAttempts: 1,
    estimatedDuration: null,
    tags: [],
    prerequisiteTasks: [],
    file: null,
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    hasAttachment: false
  });

  // Other form states
  const [newColumn, setNewColumn] = useState({
    name: '',
    type: 'assignment',
    percentage: ''
  });

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    instructions: '',
    duration: 60,
    startTime: '',
    endTime: '',
    publishTime: '',
    attempts: 1,
    showResults: true
  });

  const [newQuestion, setNewQuestion] = useState({
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 5
  });

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    studentId: ''
  });

  // Editing states
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Batch operation states
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [bulkGrade, setBulkGrade] = useState('');
  const [bulkFeedback, setBulkFeedback] = useState('');

  // Enhanced course selection with proper string handling
  const setSelectedCourse = useCallback((courseId) => {
    let courseIdProcessed = courseId;
    if (typeof courseId === 'string' && courseId.trim() !== '') {
      courseIdProcessed = courseId.trim();
    } else if (courseId === '' || courseId === null || courseId === undefined) {
      courseIdProcessed = null;
    }
    
    if (courseIdProcessed !== selectedCourse) {
      console.log(`🎯 Course selection changed from "${selectedCourse}" to "${courseIdProcessed}"`);
      setSelectedCourseState(courseIdProcessed);
      
      // Reset dependent selections when course changes
      setSelectedAssignmentForSubmissions(null);
      setSelectedExamForResponses(null);
      setEditingExam(null);
      setEditingAssignment(null);
      
      // Clear any existing error messages
      setError(null);
    }
  }, [selectedCourse]);

  // Computed values with better filtering
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students) || !selectedCourse) {
      console.log(`👥 No students: students array valid? ${Array.isArray(students)}, selectedCourse: ${selectedCourse}`);
      return [];
    }
    
    console.log(`👥 Returning ${students.length} students for course ${selectedCourse}`);
    return students;
  }, [students, selectedCourse]);

  const filteredAssignments = useMemo(() => {
    if (!Array.isArray(assignments) || !selectedCourse) {
      console.log(`📋 No assignments: assignments array valid? ${Array.isArray(assignments)}, selectedCourse: ${selectedCourse}`);
      return [];
    }
    
    const result = assignments.filter(assignment => 
      assignment.courseId === selectedCourse || assignment.course === selectedCourse
    );
    console.log(`📋 Filtered ${result.length} assignments for course ${selectedCourse}`);
    return result;
  }, [assignments, selectedCourse]);

  const filteredColumns = useMemo(() => {
    if (!Array.isArray(gradeColumns) || !selectedCourse) {
      console.log(`📊 No grade columns: columns array valid? ${Array.isArray(gradeColumns)}, selectedCourse: ${selectedCourse}`);
      return [];
    }
    
    const result = gradeColumns.filter(col => col.courseId === selectedCourse);
    console.log(`📊 Filtered ${result.length} grade columns for course ${selectedCourse}`);
    return result;
  }, [gradeColumns, selectedCourse]);

  const filteredExams = useMemo(() => {
    if (!Array.isArray(exams) || !selectedCourse) {
      console.log(`📝 No exams: exams array valid? ${Array.isArray(exams)}, selectedCourse: ${selectedCourse}`);
      return [];
    }
    
    const result = exams.filter(exam => exam.courseId === selectedCourse);
    console.log(`📝 Filtered ${result.length} exams for course ${selectedCourse}`);
    return result;
  }, [exams, selectedCourse]);

  const selectedCourseData = useMemo(() => {
    if (!Array.isArray(courses) || !selectedCourse) {
      console.log(`🎯 No course data: courses array valid? ${Array.isArray(courses)}, selectedCourse: ${selectedCourse}`);
      return null;
    }
    
    const result = courses.find(course => course.id === selectedCourse);
    console.log(`🎯 Selected course data:`, result);
    return result;
  }, [courses, selectedCourse]);

  // Enhanced error handling
  const handleApiErrorCallback = useCallback((error) => {
    console.error('API Error:', error);
    
    if (error.status === 401) {
      setError('Session expired. Please log in again.');
    } else if (error.status === 403) {
      setError('You don\'t have permission to perform this action.');
    } else if (error.status === 404) {
      setError('The requested resource was not found.');
    } else if (error.status >= 500) {
      setError('Server error. Please try again later.');
    } else {
      setError(error.message || 'An unexpected error occurred.');
    }
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch data when course changes
  useEffect(() => {
    if (selectedCourse && courses.length > 0) {
      fetchCourseData(selectedCourse);
    }
  }, [selectedCourse, courses.length]);

  // Fetch analytics when course data changes
  useEffect(() => {
    if (selectedCourse && filteredStudents.length > 0) {
      fetchAnalytics(selectedCourse);
    }
  }, [selectedCourse, filteredStudents.length]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Starting initial data fetch...');
      
      const coursesData = await api.fetchCourses();
      console.log('✅ Courses loaded:', coursesData);
      setCourses(coursesData);
      
      if (coursesData.length > 0) {
        const firstCourseId = coursesData[0].id;
        console.log(`🎯 Setting initial course to: ${firstCourseId}`);
        setSelectedCourseState(firstCourseId);
      }
      
    } catch (err) {
      console.error('❌ Failed to load initial data:', err);
      handleApiErrorCallback(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseData = async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Fetching data for course ${courseId}...`);
      
      // Fetch all data for the selected course
      const [studentsData, assignmentsData, submissionsData, examsData, examResponsesData, gradeColumnsData] = 
        await Promise.allSettled([
          api.fetchStudents(courseId),
          api.fetchAssignments(courseId),
          api.fetchSubmissions(courseId),
          api.fetchExams(courseId),
          api.fetchExamResponses(courseId),
          api.fetchGradeColumns(courseId)
        ]);
      
      // Handle results and update state
      if (studentsData.status === 'fulfilled') {
        console.log(`✅ Students loaded: ${studentsData.value.length} students`);
        setStudents(studentsData.value);
      } else {
        console.error('❌ Failed to fetch students:', studentsData.reason);
        setStudents([]);
        if (studentsData.reason?.status !== 404) {
          setError(`Failed to load students: ${studentsData.reason?.message || 'Unknown error'}`);
        }
      }
      
      // Handle assignments - NOW USING REAL BACKEND
      if (assignmentsData.status === 'fulfilled') {
        console.log(`✅ Assignments loaded: ${assignmentsData.value.length} assignments`);
        setAssignments(assignmentsData.value);
      } else {
        console.error('❌ Failed to fetch assignments:', assignmentsData.reason);
        setAssignments([]);
        if (assignmentsData.reason?.status !== 404) {
          setError(`Failed to load assignments: ${assignmentsData.reason?.message || 'Unknown error'}`);
        }
      }
      
      if (submissionsData.status === 'fulfilled') {
        console.log(`✅ Submissions loaded: ${submissionsData.value.length} submissions`);
        setSubmissions(submissionsData.value);
      } else {
        console.error('❌ Failed to fetch submissions:', submissionsData.reason);
        setSubmissions([]);
      }
      
      if (examsData.status === 'fulfilled') {
        console.log(`✅ Exams loaded: ${examsData.value.length} exams`);
        setExams(examsData.value);
      } else {
        console.error('❌ Failed to fetch exams:', examsData.reason);
        setExams([]);
      }
      
      if (examResponsesData.status === 'fulfilled') {
        console.log(`✅ Exam responses loaded: ${examResponsesData.value.length} responses`);
        setExamResponses(examResponsesData.value);
      } else {
        console.error('❌ Failed to fetch exam responses:', examResponsesData.reason);
        setExamResponses([]);
      }
      
      if (gradeColumnsData.status === 'fulfilled') {
        console.log(`✅ Grade columns loaded: ${gradeColumnsData.value.length} columns`);
        setGradeColumns(gradeColumnsData.value);
      } else {
        console.error('❌ Failed to fetch grade columns:', gradeColumnsData.reason);
        setGradeColumns([]);
        if (gradeColumnsData.reason?.status !== 404) {
          setError(`Failed to load grade components: ${gradeColumnsData.reason?.message || 'Unknown error'}`);
        }
      }
      
      console.log('✅ Course data fetched successfully');
      
    } catch (err) {
      console.error('❌ Error fetching course data:', err);
      handleApiErrorCallback(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (courseId) => {
    try {
      const analyticsData = await api.fetchDashboardAnalytics(courseId);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
    }
  };

  // ENHANCED FILE UPLOAD HANDLER
  const handleFileUpload = useCallback(async (event, assignmentId = null) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setError(null);
      setLoading(true);
      
      console.log('📁 Processing file upload:', file.name, 'Size:', file.size);
      
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.jpg', '.jpeg', '.png', '.gif'];
      
      if (file.size > maxSize) {
        const fileSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100;
        throw new Error(`File size exceeds 10MB limit (${fileSizeMB}MB)`);
      }
      
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error(`File type ${fileExtension} not allowed. Allowed: ${allowedExtensions.join(', ')}`);
      }
      
      // Create file data - Using blob URL for now since backend doesn't have file upload yet
      const fileData = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file), // This creates a temporary blob URL
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
      
      console.log('📁 File data created:', fileData);
      
      if (assignmentId) {
        // Update existing assignment
        const updatedAssignments = assignments.map(assignment => 
          assignment.id === assignmentId 
            ? { 
                ...assignment, 
                fileUrl: fileData.url, 
                fileName: fileData.name, 
                fileSize: fileData.size,
                hasAttachment: true
              }
            : assignment
        );
        setAssignments(updatedAssignments);
        
        // Update in backend
        try {
          await api.updateAssignment(assignmentId, { 
            fileUrl: fileData.url, 
            fileName: fileData.name, 
            fileSize: fileData.size 
          });
          setSuccess('File uploaded and attached successfully!');
        } catch (error) {
          console.error('Failed to update assignment with file:', error);
          setSuccess('File attached locally (backend update will happen when you save)');
        }
      } else {
        // Attach to new assignment
        setNewAssignment(prev => ({ 
          ...prev, 
          file: file,
          fileUrl: fileData.url,
          fileName: fileData.name,
          fileSize: fileData.size,
          hasAttachment: true
        }));
        setSuccess('File attached to new assignment!');
      }
    } catch (err) {
      setError(err.message);
      console.error('File upload error:', err);
      // Clear the file input
      event.target.value = '';
    } finally {
      setLoading(false);
    }
  }, [assignments, setNewAssignment]);

  // AUTO-CREATE GRADE COLUMN FUNCTION
  const autoCreateGradeColumnForAssignment = useCallback(async (assignment) => {
    try {
      console.log('🎯 Auto-creating grade column for assignment:', assignment.title);
      
      // Check if grade column already exists for this assignment
      const existingColumn = gradeColumns.find(col => 
        col.name.toLowerCase().includes(assignment.title.toLowerCase()) ||
        col.name === assignment.title
      );
      
      if (existingColumn) {
        console.log('📊 Grade column already exists for this assignment');
        return existingColumn;
      }
      
      // Calculate percentage based on max points
      let suggestedPercentage = 10; // Default percentage
      
      // Calculate based on assignment type
      const typePercentages = {
        'homework': 10,
        'project': 25,
        'essay': 15,
        'lab': 10,
        'presentation': 15,
        'quiz': 5,
        'exam': 20
      };
      
      suggestedPercentage = typePercentages[assignment.type] || 10;
      
      // Ensure total doesn't exceed 100%
      const currentTotal = gradeColumns
        .filter(col => col.courseId === selectedCourse)
        .reduce((sum, col) => sum + (col.percentage || 0), 0);
      
      if (currentTotal + suggestedPercentage > 100) {
        suggestedPercentage = Math.max(1, 100 - currentTotal);
      }
      
      // Create the grade column
      const columnData = {
        name: assignment.title,
        type: assignment.type,
        percentage: suggestedPercentage,
        maxPoints: assignment.maxPoints,
        courseId: selectedCourse,
        description: `Auto-created for assignment: ${assignment.title}`
      };
      
      const createdColumn = await api.createGradeColumn(columnData);
      setGradeColumns(prev => [...prev, createdColumn]);
      
      console.log('✅ Auto-created grade column:', createdColumn);
      return createdColumn;
      
    } catch (error) {
      console.error('❌ Error auto-creating grade column:', error);
      // Don't throw error - assignment creation should still succeed
      return null;
    }
  }, [gradeColumns, selectedCourse]);

  // ENHANCED ASSIGNMENT MANAGEMENT WITH FILE HANDLING
  const addAssignment = useCallback(async () => {
    if (!newAssignment.title?.trim()) {
      setError('Assignment title is required');
      return;
    }
    if (!newAssignment.dueDate) {
      setError('Due date is required');
      return;
    }
    if (!newAssignment.dueTime) {
      setError('Due time is required');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      const assignmentData = {
        ...newAssignment,
        title: newAssignment.title.trim(),
        courseId: selectedCourse,
        dueDate: newAssignment.dueDate,
        dueTime: newAssignment.dueTime,
        hasAttachment: !!newAssignment.fileUrl
      };

      console.log('📝 Creating assignment with data:', assignmentData);

      const createdAssignment = await api.createAssignment(assignmentData);
      setAssignments(prev => [...prev, createdAssignment]);
      
      // AUTO-CREATE GRADE COLUMN FOR THE ASSIGNMENT
      await autoCreateGradeColumnForAssignment(createdAssignment);
      
      // Reset form
      setNewAssignment({
        title: '',
        description: '',
        type: 'homework',
        dueDate: '',
        dueTime: '',
        maxPoints: 100,
        instructions: '',
        priority: 'medium',
        difficulty: 'medium',
        category: 'individual',
        allowSubmissions: true,
        allowLateSubmissions: false,
        latePenaltyPerDay: 0,
        visibleToStudents: true,
        requiresSubmission: true,
        maxAttempts: 1,
        estimatedDuration: null,
        tags: [],
        prerequisiteTasks: [],
        file: null,
        fileUrl: '',
        fileName: '',
        fileSize: 0,
        hasAttachment: false
      });
      
      setShowAssignmentForm(false);
      setSuccess('Assignment created successfully with grade column!');
      console.log('✅ Assignment created successfully:', createdAssignment);
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error creating assignment:', err);
    } finally {
      setLoading(false);
    }
  }, [newAssignment, selectedCourse, handleApiErrorCallback, autoCreateGradeColumnForAssignment]);

  const updateAssignment = useCallback(async (assignmentId, updates) => {
    try {
      setError(null);
      setLoading(true);
      
      await api.updateAssignment(assignmentId, updates);
      
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId ? { ...assignment, ...updates } : assignment
      ));
      
      // Update corresponding grade column if title changed
      if (updates.title) {
        const assignment = assignments.find(a => a.id === assignmentId);
        if (assignment) {
          const correspondingColumn = gradeColumns.find(col => 
            col.name === assignment.title || 
            col.name.toLowerCase().includes(assignment.title.toLowerCase())
          );
          
          if (correspondingColumn) {
            try {
              await api.updateGradeColumn(correspondingColumn.id, { 
                name: updates.title,
                type: updates.type || correspondingColumn.type,
                maxPoints: updates.maxPoints || correspondingColumn.maxPoints
              });
              
              setGradeColumns(prev => prev.map(col => 
                col.id === correspondingColumn.id 
                  ? { ...col, name: updates.title, type: updates.type || col.type, maxPoints: updates.maxPoints || col.maxPoints }
                  : col
              ));
              
              console.log('✅ Updated corresponding grade column');
            } catch (error) {
              console.warn('⚠️ Could not update corresponding grade column:', error);
            }
          }
        }
      }
      
      setEditingAssignment(null);
      setSuccess('Assignment updated successfully!');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error updating assignment:', err);
    } finally {
      setLoading(false);
    }
  }, [handleApiErrorCallback, assignments, gradeColumns]);

  const deleteAssignment = useCallback(async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This will also remove the corresponding grade column and all related grades.')) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      // Find the assignment to get its details
      const assignment = assignments.find(a => a.id === assignmentId);
      
      await api.deleteAssignment(assignmentId);
      
      setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
      setSubmissions(prev => prev.filter(sub => sub.assignmentId !== assignmentId));
      
      // Delete corresponding grade column
      if (assignment) {
        const correspondingColumn = gradeColumns.find(col => 
          col.name === assignment.title || 
          col.name.toLowerCase().includes(assignment.title.toLowerCase())
        );
        
        if (correspondingColumn) {
          try {
            await api.deleteGradeColumn(correspondingColumn.id);
            setGradeColumns(prev => prev.filter(col => col.id !== correspondingColumn.id));
            
            // Remove grades for this column from all students
            setStudents(prev => prev.map(student => {
              const newGrades = { ...student.grades };
              delete newGrades[correspondingColumn.id];
              return { ...student, grades: newGrades };
            }));
            
            console.log('✅ Deleted corresponding grade column');
          } catch (error) {
            console.warn('⚠️ Could not delete corresponding grade column:', error);
          }
        }
      }
      
      setSuccess('Assignment and grade column deleted successfully!');
      console.log('✅ Assignment deleted successfully');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error deleting assignment:', err);
    } finally {
      setLoading(false);
    }
  }, [handleApiErrorCallback, assignments, gradeColumns]);

  // Student management
  const addStudent = useCallback(async () => {
    if (!newStudent.name?.trim()) {
      setError('Student name is required');
      return;
    }
    if (!newStudent.email?.trim()) {
      setError('Student email is required');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      const studentData = {
        ...newStudent,
        name: newStudent.name.trim(),
        email: newStudent.email.trim()
      };

      const createdStudent = await api.addStudent(selectedCourse, studentData);
      setStudents(prev => [...prev, createdStudent]);
      
      setNewStudent({ name: '', email: '', studentId: '' });
      setShowStudentForm(false);
      setSuccess('Student added successfully!');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error adding student:', err);
    } finally {
      setLoading(false);
    }
  }, [newStudent, selectedCourse, handleApiErrorCallback]);

  const updateStudent = useCallback(async (studentId, updates) => {
    try {
      setError(null);
      
      await api.updateStudent(studentId, updates);
      
      setStudents(prev => prev.map(student => 
        student.id === studentId ? { ...student, ...updates } : student
      ));
      
      setEditingStudent(null);
      setSuccess('Student updated successfully!');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error updating student:', err);
    }
  }, [handleApiErrorCallback]);

  const removeStudent = useCallback(async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student? This will also remove all their submissions and grades.')) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      await api.removeStudent(selectedCourse, studentId);
      
      setStudents(prev => prev.filter(student => student.id !== studentId));
      setSubmissions(prev => prev.filter(sub => sub.studentId !== studentId));
      setExamResponses(prev => prev.filter(resp => resp.studentId !== studentId));
      setSuccess('Student removed successfully!');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error removing student:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, handleApiErrorCallback]);

  // Grade column management
  const addGradeColumn = useCallback(async () => {
    const columnData = {
      ...newColumn,
      percentage: parseInt(newColumn.percentage) || 0
    };

    if (!validateGradeColumn(columnData)) {
      setError('Please provide valid grade column data');
      return;
    }

    const currentTotal = filteredColumns.reduce((sum, col) => sum + col.percentage, 0);
    if (currentTotal + columnData.percentage > 100) {
      setError(`Cannot add grade component. Total would exceed 100% (current: ${currentTotal}%)`);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      columnData.courseId = selectedCourse;

      const createdColumn = await api.createGradeColumn(columnData);
      setGradeColumns(prev => [...prev, createdColumn]);
      
      setNewColumn({ name: '', type: 'assignment', percentage: '' });
      setShowColumnForm(false);
      setSuccess('Grade column created successfully!');
      console.log('✅ Grade column created successfully:', createdColumn);
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error creating grade column:', err);
    } finally {
      setLoading(false);
    }
  }, [newColumn, selectedCourse, filteredColumns, handleApiErrorCallback]);

  const updateColumn = useCallback(async (columnId, field, value) => {
    try {
      setError(null);
      let processedValue = value;
      
      if (field === 'percentage') {
        const percentageValue = parseInt(value) || 0;
        if (percentageValue < 0 || percentageValue > 100) {
          setError('Percentage must be between 0 and 100');
          return;
        }
        
        const otherColumns = filteredColumns.filter(col => col.id !== columnId);
        const otherTotal = otherColumns.reduce((sum, col) => sum + col.percentage, 0);
        if (otherTotal + percentageValue > 100) {
          setError(`Total percentage cannot exceed 100% (other columns: ${otherTotal}%)`);
          return;
        }
        
        processedValue = percentageValue;
      }

      const updates = { [field]: processedValue };
      await api.updateGradeColumn(columnId, updates);
      
      setGradeColumns(prev => prev.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      ));
      
      if (field === 'percentage') {
        setSuccess('Grade percentage updated successfully!');
      }
      console.log('✅ Grade column updated successfully');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error updating grade column:', err);
    }
  }, [filteredColumns, handleApiErrorCallback]);

  const deleteColumn = useCallback(async (columnId) => {
    if (!window.confirm('Are you sure you want to delete this grade component? All related grades will be removed.')) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      await api.deleteGradeColumn(columnId);
      
      setGradeColumns(prev => prev.filter(col => col.id !== columnId));
      setStudents(prev => prev.map(student => {
        const newGrades = { ...student.grades };
        delete newGrades[columnId];
        return { ...student, grades: newGrades };
      }));
      
      setSuccess('Grade column deleted successfully!');
      console.log('✅ Grade column deleted successfully');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error deleting grade column:', err);
    } finally {
      setLoading(false);
    }
  }, [handleApiErrorCallback]);

  // Grade management with optimistic updates
  const updateGrade = useCallback(async (studentId, columnId, value) => {
    const originalStudents = [...students];
    
    try {
      setError(null);
      const gradeValue = value === '' || value === null ? null : (parseFloat(value) || 0);
      
      if (gradeValue !== null && (gradeValue < 0 || gradeValue > 100)) {
        setError('Grade must be between 0 and 100');
        return;
      }
      
      // Optimistic update
      setStudents(prev => prev.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            grades: { ...student.grades, [columnId]: gradeValue }
          };
        }
        return student;
      }));

      await api.updateGrade(studentId, columnId, gradeValue);
      console.log('✅ Grade updated successfully');
      
    } catch (err) {
      // Rollback on error
      setStudents(originalStudents);
      handleApiErrorCallback(err);
      console.error('Error updating grade:', err);
    }
  }, [students, handleApiErrorCallback]);

  // Submission management
  const updateSubmissionGrade = useCallback(async (submissionId, grade, feedback = '') => {
    try {
      setError(null);
      const gradeValue = grade === '' || grade === null ? null : (parseFloat(grade) || 0);
      
      if (gradeValue !== null && (gradeValue < 0 || gradeValue > 100)) {
        setError('Grade must be between 0 and 100');
        return;
      }
      
      await api.updateSubmissionGrade(submissionId, gradeValue, feedback);
      
      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId 
          ? { ...submission, grade: gradeValue, feedback }
          : submission
      ));
      
      setSuccess('Submission graded successfully!');
      console.log('✅ Submission grade updated successfully');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error updating submission grade:', err);
    }
  }, [handleApiErrorCallback]);

  const downloadSubmission = useCallback(async (submissionId) => {
    try {
      setError(null);
      await api.downloadSubmission(submissionId);
      setSuccess('Download started!');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error downloading submission:', err);
    }
  }, [handleApiErrorCallback]);

  // Batch operations for submissions
  const batchGradeSubmissions = useCallback(async () => {
    if (selectedSubmissions.length === 0) {
      setError('Please select submissions to grade');
      return;
    }
    
    if (!bulkGrade || isNaN(parseInt(bulkGrade))) {
      setError('Please enter a valid grade');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const grade = parseInt(bulkGrade);
      
      await api.batchGradeSubmissions(selectedSubmissions, grade, bulkFeedback);
      
      setSubmissions(prev => prev.map(submission => 
        selectedSubmissions.includes(submission.id)
          ? { ...submission, grade, feedback: bulkFeedback, status: 'graded' }
          : submission
      ));
      
      setSelectedSubmissions([]);
      setBulkGrade('');
      setBulkFeedback('');
      setSuccess(`${selectedSubmissions.length} submissions graded successfully!`);
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error batch grading submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSubmissions, bulkGrade, bulkFeedback, handleApiErrorCallback]);

  // Exam management with enhanced validation
  const createExam = useCallback(async () => {
    if (!newExam.title?.trim()) {
      setError('Exam title is required');
      return;
    }
    if (!newExam.startTime || !newExam.endTime) {
      setError('Start time and end time are required');
      return;
    }

    const startDate = new Date(newExam.startTime);
    const endDate = new Date(newExam.endTime);
    if (endDate <= startDate) {
      setError('End time must be after start time');
      return;
    }

    const duration = parseInt(newExam.duration);
    if (isNaN(duration) || duration < 1) {
      setError('Duration must be at least 1 minute');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      const examData = {
        ...newExam,
        title: newExam.title.trim(),
        courseId: selectedCourse,
        duration: duration,
        attempts: parseInt(newExam.attempts) || 1
      };

      const createdExam = await api.createExam(examData);
      setExams(prev => [...prev, createdExam]);
      setEditingExam(createdExam.id);
      
      setNewExam({
        title: '',
        description: '',
        instructions: '',
        duration: 60,
        startTime: '',
        endTime: '',
        publishTime: '',
        attempts: 1,
        showResults: true
      });
      
      setShowExamForm(false);
      setSuccess('Exam created successfully! Now add questions.');
      console.log('✅ Exam created successfully:', createdExam);
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error creating exam:', err);
    } finally {
      setLoading(false);
    }
  }, [newExam, selectedCourse, handleApiErrorCallback]);

  const updateExam = useCallback(async (examId, updates) => {
    try {
      setError(null);
      await api.updateExam(examId, updates);
      
      setExams(prev => prev.map(exam => 
        exam.id === examId ? { ...exam, ...updates } : exam
      ));
      
      setSuccess('Exam updated successfully!');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error updating exam:', err);
    }
  }, [handleApiErrorCallback]);

  const addQuestionToExam = useCallback(async (examId) => {
    if (!newQuestion.question?.trim()) {
      setError('Question text is required');
      return;
    }

    const points = parseInt(newQuestion.points);
    if (isNaN(points) || points < 1) {
      setError('Points must be at least 1');
      return;
    }

    if (newQuestion.type === 'multiple-choice') {
      const validOptions = newQuestion.options.filter(opt => opt?.trim());
      if (validOptions.length < 2) {
        setError('Multiple choice questions need at least 2 options');
        return;
      }
      if (newQuestion.correctAnswer >= validOptions.length) {
        setError('Please select a valid correct answer');
        return;
      }
    }

    try {
      setError(null);
      setLoading(true);
      
      const questionData = {
        type: newQuestion.type,
        question: newQuestion.question.trim(),
        options: newQuestion.type === 'multiple-choice' 
          ? newQuestion.options.filter(opt => opt?.trim()) 
          : [],
        correctAnswer: newQuestion.correctAnswer,
        points: points
      };

      const result = await api.addQuestionToExam(examId, questionData);
      
      setExams(prev => prev.map(exam => {
        if (exam.id === examId) {
          const newQuestion = result.question || result;
          const updatedQuestions = [...(exam.questions || []), newQuestion];
          const newTotalPoints = (exam.totalPoints || 0) + newQuestion.points;
          
          return {
            ...exam,
            questions: updatedQuestions,
            totalPoints: newTotalPoints
          };
        }
        return exam;
      }));
      
      setNewQuestion({
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 5
      });
      
      setSuccess('Question added successfully!');
      console.log('✅ Question added successfully');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error adding question:', err);
    } finally {
      setLoading(false);
    }
  }, [newQuestion, handleApiErrorCallback]);

  const updateQuestion = useCallback(async (examId, questionId, updates) => {
    try {
      setError(null);
      await api.updateQuestion(examId, questionId, updates);
      
      setExams(prev => prev.map(exam => {
        if (exam.id === examId) {
          const updatedQuestions = exam.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          );
          const newTotalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0);
          
          return { ...exam, questions: updatedQuestions, totalPoints: newTotalPoints };
        }
        return exam;
      }));
      
      setEditingQuestion(null);
      setSuccess('Question updated successfully!');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error updating question:', err);
    }
  }, [handleApiErrorCallback]);

  const deleteQuestion = useCallback(async (examId, questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      await api.deleteQuestionFromExam(examId, questionId);
      
      setExams(prev => prev.map(exam => {
        if (exam.id === examId) {
          const updatedQuestions = exam.questions.filter(q => q.id !== questionId);
          const newTotalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0);
          
          return { ...exam, questions: updatedQuestions, totalPoints: newTotalPoints };
        }
        return exam;
      }));
      
      setSuccess('Question deleted successfully!');
      console.log('✅ Question deleted successfully');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error deleting question:', err);
    } finally {
      setLoading(false);
    }
  }, [handleApiErrorCallback]);

  const updateExamStatus = useCallback(async (examId, status) => {
    try {
      setError(null);
      setLoading(true);
      
      await api.updateExamStatus(examId, status);
      
      setExams(prev => prev.map(exam => 
        exam.id === examId ? { ...exam, status } : exam
      ));
      
      setSuccess(`Exam ${status} successfully!`);
      console.log(`✅ Exam status updated to: ${status}`);
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error updating exam status:', err);
    } finally {
      setLoading(false);
    }
  }, [handleApiErrorCallback]);

  const deleteExam = useCallback(async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? This will also remove all student responses.')) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      await api.deleteExam(examId);
      
      setExams(prev => prev.filter(exam => exam.id !== examId));
      setExamResponses(prev => prev.filter(response => response.examId !== examId));
      
      if (editingExam === examId) {
        setEditingExam(null);
      }
      
      setSuccess('Exam deleted successfully!');
      console.log('✅ Exam deleted successfully');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error deleting exam:', err);
    } finally {
      setLoading(false);
    }
  }, [editingExam, handleApiErrorCallback]);

  // Exam response management
  const updateExamResponseScore = useCallback(async (responseId, questionId, points) => {
    try {
      setError(null);
      const pointsValue = parseInt(points) || 0;
      
      await api.updateExamResponseScore(responseId, questionId, pointsValue);
      
      setExamResponses(prev => prev.map(response => {
        if (response.id === responseId) {
          const newQuestionScores = {
            ...response.questionScores,
            [questionId]: pointsValue
          };
          
          const totalScore = Object.values(newQuestionScores).reduce((sum, score) => sum + score, 0);
          
          return {
            ...response,
            questionScores: newQuestionScores,
            score: totalScore,
            graded: true
          };
        }
        return response;
      }));
      
      setSuccess('Response score updated successfully!');
      console.log('✅ Exam response score updated successfully');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error updating exam response score:', err);
    }
  }, [handleApiErrorCallback]);

  const autoGradeResponse = useCallback(async (responseId) => {
    try {
      setError(null);
      setLoading(true);
      
      const gradedResponse = await api.autoGradeExamResponse(responseId);
      
      setExamResponses(prev => prev.map(response => 
        response.id === responseId ? { ...response, ...gradedResponse } : response
      ));
      
      setSuccess('Response auto-graded successfully!');
      console.log('✅ Response auto-graded successfully');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error auto-grading response:', err);
    } finally {
      setLoading(false);
    }
  }, [handleApiErrorCallback]);

  // Export functionality
  const exportGrades = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      await api.exportGrades(selectedCourse, 'csv');
      setSuccess('Grades exported successfully!');
    } catch (err) {
      handleApiErrorCallback(err);
      console.error('Error exporting grades:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, handleApiErrorCallback]);

  // Helper functions
  const calculateFinalGrade = useCallback((student) => {
    try {
      return calculateGradePercentage(student, filteredColumns);
    } catch (err) {
      console.error('Error calculating final grade:', err);
      return 0;
    }
  }, [filteredColumns]);

  const getTotalPercentage = useCallback(() => {
    try {
      return filteredColumns.reduce((sum, col) => sum + (col.percentage || 0), 0);
    } catch (err) {
      console.error('Error calculating total percentage:', err);
      return 0;
    }
  }, [filteredColumns]);

  const getStudentName = useCallback((studentId) => {
    try {
      const student = students.find(s => s.id === studentId);
      return student ? student.name : 'Unknown Student';
    } catch (err) {
      console.error('Error getting student name:', err);
      return 'Unknown Student';
    }
  }, [students]);

  const getSubmissionsForAssignment = useCallback((assignmentId) => {
    try {
      return submissions.filter(sub => sub.assignmentId === assignmentId) || [];
    } catch (err) {
      console.error('Error getting submissions:', err);
      return [];
    }
  }, [submissions]);

  const getExamResponses = useCallback((examId) => {
    try {
      const result = examResponses.filter(response => response.examId === examId) || [];
      console.log(`📊 Found ${result.length} responses for exam ${examId}`);
      return result;
    } catch (err) {
      console.error('Error getting exam responses:', err);
      return [];
    }
  }, [examResponses]);

  const getResponsesForExam = useCallback((examId) => {
    try {
      const result = examResponses.filter(response => response.examId === examId) || [];
      console.log(`📊 Found ${result.length} responses for exam ${examId}`);
      return result;
    } catch (err) {
      console.error('Error getting responses for exam:', err);
      return [];
    }
  }, [examResponses]);

  return {
    // State
    activeTab,
    setActiveTab,
    selectedCourse,
    setSelectedCourse,
    selectedAssignmentForSubmissions,
    setSelectedAssignmentForSubmissions,
    selectedExamForPreview,
    setSelectedExamForPreview,
    selectedExamForResponses,
    setSelectedExamForResponses,
    editingExam,
    setEditingExam,
    editingAssignment,
    setEditingAssignment,
    editingStudent,
    setEditingStudent,
    editingColumn,
    setEditingColumn,
    editingQuestion,
    setEditingQuestion,
    showColumnForm,
    setShowColumnForm,
    showExamForm,
    setShowExamForm,
    showAssignmentForm,
    setShowAssignmentForm,
    showStudentForm,
    setShowStudentForm,
    loading,
    error,
    setError,
    success,
    setSuccess,
    
    // Data
    courses,
    students,
    assignments,
    submissions,
    exams,
    examResponses,
    gradeColumns,
    analytics,
    
    // Forms
    newAssignment,
    setNewAssignment,
    newColumn,
    setNewColumn,
    newExam,
    setNewExam,
    newQuestion,
    setNewQuestion,
    newStudent,
    setNewStudent,
    
    // Batch operations
    selectedSubmissions,
    setSelectedSubmissions,
    selectedExams,
    setSelectedExams,
    bulkGrade,
    setBulkGrade,
    bulkFeedback,
    setBulkFeedback,
    batchGradeSubmissions,
    
    // Actions - Assignments
    handleFileUpload,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    
    // Actions - Students
    addStudent,
    updateStudent,
    removeStudent,
    
    // Actions - Grade Columns
    addGradeColumn,
    updateColumn,
    deleteColumn,
    updateGrade,
    exportGrades,
    
    // Actions - Submissions
    updateSubmissionGrade,
    downloadSubmission,
    
    // Actions - Exams
    createExam,
    updateExam,
    addQuestionToExam,
    updateQuestion,
    deleteQuestion,
    updateExamStatus,
    deleteExam,
    updateExamResponseScore,
    autoGradeResponse,
    
    // Computed values
    filteredStudents,
    filteredAssignments,
    filteredColumns,
    filteredExams,
    selectedCourseData,
    calculateFinalGrade,
    getTotalPercentage,
    getStudentName,
    getSubmissionsForAssignment,
    getExamResponses,
    getResponsesForExam,
    
    // Utilities
    handleApiError: handleApiErrorCallback
  };
};