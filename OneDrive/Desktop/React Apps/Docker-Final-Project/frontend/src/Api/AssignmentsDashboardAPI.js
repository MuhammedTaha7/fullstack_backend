/**
 * Complete API Client for Lecturer Dashboard - Frontend with Backend Integration and Enhanced File Handling
 * Integrated with your AuthContext and backend endpoints
 * File: src/Api/AssignmentsDashboardAPI.js
 */

// Configuration
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};

/**
 * Cookie utility functions
 */
const cookieUtils = {
  getCookie: (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
};

/**
 * Enhanced HTTP Client with proper error handling, retries, and authentication
 */
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  // Get JWT token from cookies (matching your AuthContext)
  getToken() {
    return cookieUtils.getCookie('jwtToken');
  }

  // Create request headers
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Create AbortController for timeout
  createAbortController() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    return { controller, timeoutId };
  }

  // Retry logic
  async withRetry(requestFn, attempts = API_CONFIG.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await requestFn();
      } catch (error) {
        const isLastAttempt = i === attempts - 1;
        const isRetryableError = this.isRetryableError(error);
        
        if (isLastAttempt || !isRetryableError) {
          throw error;
        }
        
        await new Promise(resolve => 
          setTimeout(resolve, API_CONFIG.retryDelay * (i + 1))
        );
      }
    }
  }

  isRetryableError(error) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status) || 
           error.name === 'AbortError' ||
           error.message.includes('network');
  }

  // Format error response
  formatError(error, response = null) {
    console.error('API Error:', error);
    
    const errorInfo = {
      error: true,
      status: 0,
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      details: null
    };

    if (response) {
      errorInfo.status = response.status;
    } else if (error.status) {
      errorInfo.status = error.status;
    }

    const errorMessages = {
      400: 'Bad request. Please check your input and try again.',
      401: 'Authentication required. Please log in again.',
      403: 'Access forbidden. You don\'t have permission for this action.',
      404: 'Resource not found. The requested item may have been deleted.',
      409: 'Conflict. The resource already exists or is in use.',
      422: 'Invalid data provided. Please check your input.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Please try again later.',
      502: 'Service unavailable. Please try again later.',
      503: 'Service temporarily unavailable. Please try again later.',
      504: 'Request timeout. Please try again.'
    };

    if (error.name === 'AbortError') {
      errorInfo.message = 'Request timeout. Please try again.';
      errorInfo.status = 408;
    } else if (errorMessages[errorInfo.status]) {
      errorInfo.message = errorMessages[errorInfo.status];
    } else if (error.message) {
      errorInfo.message = error.message;
    }

    // Handle authentication errors - dispatch custom event for AuthContext to handle
    if (errorInfo.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return errorInfo;
  }

  // Main request method with credentials
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const { controller, timeoutId } = this.createAbortController();
    
    const requestOptions = {
      method: 'GET',
      headers: this.getHeaders(options.headers),
      credentials: 'include', // Include cookies for your auth system
      signal: controller.signal,
      ...options
    };

    if (requestOptions.body && typeof requestOptions.body === 'object' && !(requestOptions.body instanceof FormData)) {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }

    try {
      const response = await this.withRetry(async () => {
        const res = await fetch(url, requestOptions);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const error = new Error(errorData.message || `HTTP ${res.status}`);
          error.status = res.status;
          error.details = errorData;
          throw error;
        }
        
        return res;
      });

      clearTimeout(timeoutId);
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.formatError(error);
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { 
      method: 'DELETE',
      ...options
    });
  }

  // File upload
  async upload(endpoint, file, additionalData = {}) {
    const { controller, timeoutId } = this.createAbortController();
    
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': this.getToken() ? `Bearer ${this.getToken()}` : undefined
        },
        credentials: 'include',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.details = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.formatError(error);
    }
  }

  // Download file
  async download(endpoint, filename = null) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getToken() ? `Bearer ${this.getToken()}` : undefined
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      
      if (filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return blob;
    } catch (error) {
      throw this.formatError(error);
    }
  }
}

const apiClient = new ApiClient();

/**
 * ENHANCED FILE HANDLING FUNCTIONS
 */

/**
 * Validate file for upload
 */
const validateFileForUpload = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.jpg', '.jpeg', '.png', '.gif'];
  
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (file.size > maxSize) {
    const fileSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100;
    throw new Error(`File size exceeds 10MB limit (${fileSizeMB}MB)`);
  }
  
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    throw new Error(`File type ${fileExtension} not allowed. Allowed: ${allowedExtensions.join(', ')}`);
  }
  
  if (file.type && !allowedTypes.includes(file.type)) {
    console.warn('File MIME type not in allowed list, but proceeding based on extension:', file.type);
  }
  
  return true;
};

/**
 * Enhanced file upload functionality
 */
export const uploadFile = async (file, context = 'assignment', additionalData = {}) => {
  try {
    console.log('📁 Starting file upload:', file.name, 'Context:', context);
    
    // Validate file before upload
    validateFileForUpload(file);
    
    // For now, since your backend doesn't have file upload yet,
    // we'll create a blob URL and simulate the upload
    const fileData = {
      id: Date.now().toString(),
      name: file.name,
      url: URL.createObjectURL(file), // This creates a temporary blob URL
      size: file.size,
      type: file.type,
      context: context,
      uploadedAt: new Date().toISOString(),
      ...additionalData
    };
    
    console.log('✅ File "uploaded" successfully:', fileData);
    
    // When you implement the real backend endpoint, replace above with:
    /*
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    const fileData = await apiClient.upload('/files/upload', formData);
    */
    
    return fileData;
  } catch (error) {
    console.error('❌ File upload failed:', error);
    throw error;
  }
};

/**
 * Download/view file
 */
export const downloadFile = async (fileUrl, fileName = null) => {
  try {
    console.log('📥 Downloading file:', fileName, 'URL:', fileUrl);
    
    if (!fileUrl) {
      throw new Error('No file URL provided');
    }
    
    // Handle different URL types
    if (fileUrl.startsWith('blob:')) {
      // For blob URLs (temporary files), trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'download';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Blob file download initiated');
      return { success: true, method: 'blob' };
    } else if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      // For actual URLs, open in new tab
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      console.log('✅ File opened in new tab');
      return { success: true, method: 'url' };
    } else {
      // For relative URLs, prepend base URL
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
      const fullUrl = fileUrl.startsWith('/') 
        ? `${baseUrl}${fileUrl}`
        : `${baseUrl}/${fileUrl}`;
      
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
      console.log('✅ File opened with full URL:', fullUrl);
      return { success: true, method: 'full_url', url: fullUrl };
    }
  } catch (error) {
    console.error('❌ File download failed:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
};

/**
 * Delete file
 */
export const deleteFile = async (fileId) => {
  try {
    console.log('🗑️ Deleting file:', fileId);
    
    // For now, since it's a blob URL, revoke it to free memory
    // When you implement the real backend endpoint, replace with actual API call
    
    // If it's a blob URL, revoke it
    if (fileId && fileId.startsWith('blob:')) {
      URL.revokeObjectURL(fileId);
      console.log('✅ Blob URL revoked');
    }
    
    // When you implement the real backend endpoint:
    /*
    await apiClient.delete(`/files/${fileId}`);
    */
    
    return { success: true };
  } catch (error) {
    console.error('❌ File deletion failed:', error);
    throw error;
  }
};

/**
 * File size formatting utility
 */
export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes) || bytes === 0) return '0 Bytes';
  if (bytes < 0) return 'Invalid size';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i >= sizes.length) return 'File too large';
  if (i < 0) return '0 Bytes';
  
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${sizes[i]}`;
};

/**
 * File type icon helper
 */
export const getFileTypeIcon = (fileName) => {
  if (!fileName) return '📄';
  
  const extension = fileName.split('.').pop().toLowerCase();
  
  const iconMap = {
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'txt': '📄',
    'zip': '📦',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️'
  };
  
  return iconMap[extension] || '📄';
};

/**
 * COURSES ENDPOINTS
 */
export const fetchCourses = async (params = {}) => {
  try {
    console.log('🔍 Fetching courses...');
    const courses = await apiClient.get('/courses', params);
    console.log('📚 Raw courses data:', courses);
    
    // Transform to match frontend expectations and ensure ID is treated properly
    const transformedCourses = Array.isArray(courses) ? courses.map(course => ({
      id: course.id, // Keep as string (MongoDB ObjectId)
      name: course.name,
      code: course.code,
      description: course.description,
      lecturerId: course.lecturerId,
      department: course.department,
      credits: course.credits,
      enrollments: course.enrollments || [],
      imageUrl: course.imageUrl,
      academicYear: course.academicYear,
      semester: course.semester,
      year: course.year,
      language: course.language,
      progress: course.progress,
      prerequisites: course.prerequisites,
      finalExam: course.finalExam
    })) : [];
    
    console.log(`✅ Transformed ${transformedCourses.length} courses`);
    return transformedCourses;
  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    throw error;
  }
};

export const fetchCourse = async (courseId) => {
  try {
    return await apiClient.get(`/courses/${courseId}`);
  } catch (error) {
    throw error;
  }
};

/**
 * STUDENTS ENDPOINTS - Fixed to work with your backend
 */
export const fetchStudents = async (courseId, params = {}) => {
  try {
    console.log(`🔍 Fetching students for course: ${courseId}`);
    
    // Step 1: Get the course with its enrollments
    const course = await apiClient.get(`/courses/${courseId}`);
    console.log('📚 Course data:', course);
    
    if (!course.enrollments || course.enrollments.length === 0) {
      console.log('📭 No enrollments found for this course');
      return [];
    }
    
    // Step 2: Get current year's enrollments (defaulting to 2024 based on your data)
    const currentYear = 2024; // You can make this dynamic: new Date().getFullYear()
    console.log(`📅 Looking for enrollments in year: ${currentYear}`);
    
    const currentEnrollment = course.enrollments.find(e => e.academicYear === currentYear);
    
    if (!currentEnrollment || !currentEnrollment.studentIds || currentEnrollment.studentIds.length === 0) {
      console.log(`📭 No student enrollments found for year ${currentYear}`);
      return [];
    }
    
    console.log(`👥 Found ${currentEnrollment.studentIds.length} enrolled students:`, currentEnrollment.studentIds);
    
    // Step 3: Fetch detailed student information by IDs
    const studentDetails = await apiClient.post('/users/by-ids', currentEnrollment.studentIds);
    console.log('✅ Student details fetched:', studentDetails);
    
    // Step 4: Try to fetch existing grades for these students (optional - may not exist yet)
    let existingGrades = [];
    try {
      existingGrades = await apiClient.get(`/courses/${courseId}/grades`);
      console.log('📊 Existing grades found:', existingGrades);
    } catch (error) {
      console.warn('⚠️ No existing grades found (this is normal for new courses):', error.message);
      existingGrades = [];
    }
    
    // Step 5: Combine student info with any existing grades
    const studentsWithGrades = studentDetails.map(student => {
      const studentGrade = existingGrades.find(g => g.studentId === student.id);
      
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        username: student.username, // Include username for display
        courseId: courseId, // Keep as string to match your backend
        grades: studentGrade?.grades || {}, // Empty object if no grades yet
        finalGrade: studentGrade?.finalGrade || 0,
        finalLetterGrade: studentGrade?.finalLetterGrade || 'N/A'
      };
    });
    
    console.log(`✅ Successfully processed ${studentsWithGrades.length} students with grade data`);
    return studentsWithGrades;
    
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    
    // If it's a 404, the course doesn't exist
    if (error.status === 404) {
      throw new Error(`Course with ID ${courseId} not found`);
    }
    
    // If it's a 403, there's an auth issue
    if (error.status === 403) {
      throw new Error('You do not have permission to view students for this course');
    }
    
    // For other errors, return empty array but log the error
    console.error('Returning empty array due to error');
    return [];
  }
};

export const addStudent = async (courseId, studentData) => {
  try {
    // Create enrollment request based on your CourseController
    const enrollmentRequest = {
      studentId: studentData.id || studentData.studentId,
      academicYear: new Date().getFullYear()
    };
    
    return await apiClient.post(`/courses/${courseId}/enroll`, enrollmentRequest);
  } catch (error) {
    throw error;
  }
};

export const removeStudent = async (courseId, studentId) => {
  try {
    // Use the unenrollment endpoint from your CourseController
    const unenrollmentRequest = {
      studentIds: [studentId]
    };
    
    return await apiClient.delete(`/courses/${courseId}/enrollments`, {
      body: unenrollmentRequest
    });
  } catch (error) {
    throw error;
  }
};

export const updateStudent = async (studentId, updates) => {
  try {
    return await apiClient.put(`/users/${studentId}`, updates);
  } catch (error) {
    throw error;
  }
};

/**
 * GRADE COLUMNS ENDPOINTS
 */
export const fetchGradeColumns = async (courseId, params = {}) => {
  try {
    const columns = await apiClient.get(`/courses/${courseId}/grade-columns`, params);
    return Array.isArray(columns) ? columns : [];
  } catch (error) {
    console.error('Error fetching grade columns:', error);
    return [];
  }
};

export const createGradeColumn = async (columnData) => {
  try {
    return await apiClient.post('/grade-columns', columnData);
  } catch (error) {
    throw error;
  }
};

export const updateGradeColumn = async (columnId, updates) => {
  try {
    return await apiClient.put(`/grade-columns/${columnId}`, updates);
  } catch (error) {
    throw error;
  }
};

export const deleteGradeColumn = async (columnId) => {
  try {
    return await apiClient.delete(`/grade-columns/${columnId}`);
  } catch (error) {
    throw error;
  }
};

/**
 * GRADES ENDPOINTS
 */
export const fetchGrades = async (courseId, params = {}) => {
  try {
    const grades = await apiClient.get(`/courses/${courseId}/grades`, params);
    return Array.isArray(grades) ? grades : [];
  } catch (error) {
    console.error('Error fetching grades:', error);
    return [];
  }
};

export const updateGrade = async (studentId, columnId, grade) => {
  try {
    return await apiClient.put(`/students/${studentId}/grades/${columnId}`, { grade });
  } catch (error) {
    throw error;
  }
};

export const calculateFinalGrades = async (courseId) => {
  try {
    return await apiClient.post(`/courses/${courseId}/grades/calculate-final`);
  } catch (error) {
    throw error;
  }
};

/**
 * ASSIGNMENTS ENDPOINTS - ENHANCED WITH FILE HANDLING
 */
export const fetchAssignments = async (courseId, params = {}) => {
  try {
    console.log(`🔍 Fetching assignments for course: ${courseId}`);
    const assignments = await apiClient.get(`/tasks/course/${courseId}`, params);
    console.log('📋 Raw assignments data:', assignments);
    
    // Transform backend Task objects to frontend Assignment format
    const transformedAssignments = Array.isArray(assignments) ? assignments.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      courseId: task.courseId,
      courseName: task.courseName,
      type: task.type,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      dueDateTime: task.dueDateTime,
      maxPoints: task.maxPoints,
      status: task.status,
      priority: task.priority,
      difficulty: task.difficulty,
      category: task.category,
      instructions: task.instructions,
      estimatedDuration: task.estimatedDuration,
      
      // File attachment info
      fileUrl: task.fileUrl,
      fileName: task.fileName,
      fileSize: task.fileSize,
      hasAttachment: task.hasAttachment,
      
      // Submission settings
      allowSubmissions: task.allowSubmissions,
      allowLateSubmissions: task.allowLateSubmissions,
      latePenaltyPerDay: task.latePenaltyPerDay,
      visibleToStudents: task.visibleToStudents,
      requiresSubmission: task.requiresSubmission,
      maxAttempts: task.maxAttempts,
      publishDate: task.publishDate,
      
      // Statistics
      submissionCount: task.submissionCount,
      gradedCount: task.gradedCount,
      averageGrade: task.averageGrade,
      enrolledStudents: task.enrolledStudents,
      completionRate: task.completionRate,
      
      // Status flags
      isOverdue: task.isOverdue,
      isPublished: task.isPublished,
      acceptsSubmissions: task.acceptsSubmissions,
      
      // Instructor info
      instructorId: task.instructorId,
      instructorName: task.instructorName,
      
      // Organization
      tags: task.tags,
      prerequisiteTasks: task.prerequisiteTasks,
      progress: task.progress,
      
      // Timestamps
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    })) : [];
    
    console.log(`✅ Transformed ${transformedAssignments.length} assignments`);
    return transformedAssignments;
  } catch (error) {
    console.error('❌ Error fetching assignments:', error);
    return [];
  }
};

export const createAssignment = async (assignmentData) => {
  try {
    console.log('➕ Creating assignment with data:', assignmentData);
    
    // Transform frontend data to backend Task format
    const taskCreateRequest = {
      title: assignmentData.title,
      description: assignmentData.description,
      courseId: assignmentData.courseId,
      type: assignmentData.type,
      dueDate: assignmentData.dueDate,
      dueTime: assignmentData.dueTime,
      maxPoints: assignmentData.maxPoints,
      instructions: assignmentData.instructions,
      priority: assignmentData.priority,
      difficulty: assignmentData.difficulty,
      category: assignmentData.category,
      allowSubmissions: assignmentData.allowSubmissions,
      allowLateSubmissions: assignmentData.allowLateSubmissions,
      latePenaltyPerDay: assignmentData.latePenaltyPerDay,
      visibleToStudents: assignmentData.visibleToStudents,
      requiresSubmission: assignmentData.requiresSubmission,
      maxAttempts: assignmentData.maxAttempts,
      estimatedDuration: assignmentData.estimatedDuration,
      tags: assignmentData.tags,
      prerequisiteTasks: assignmentData.prerequisiteTasks,
      fileUrl: assignmentData.fileUrl,
      fileName: assignmentData.fileName,
      fileSize: assignmentData.fileSize
    };
    
    const createdTask = await apiClient.post('/tasks', taskCreateRequest);
    console.log('✅ Assignment created successfully:', createdTask);
    
    // Transform back to frontend format
    return {
      id: createdTask.id,
      title: createdTask.title,
      description: createdTask.description,
      courseId: createdTask.courseId,
      type: createdTask.type,
      dueDate: createdTask.dueDate,
      dueTime: createdTask.dueTime,
      maxPoints: createdTask.maxPoints,
      status: createdTask.status,
      priority: createdTask.priority,
      difficulty: createdTask.difficulty,
      category: createdTask.category,
      instructions: createdTask.instructions,
      fileUrl: createdTask.fileUrl,
      fileName: createdTask.fileName,
      fileSize: createdTask.fileSize,
      hasAttachment: createdTask.hasAttachment,
      submissionCount: createdTask.submissionCount || 0,
      gradedCount: createdTask.gradedCount || 0,
      averageGrade: createdTask.averageGrade || 0,
      isOverdue: createdTask.isOverdue,
      createdAt: createdTask.createdAt,
      updatedAt: createdTask.updatedAt
    };
  } catch (error) {
    console.error('❌ Error creating assignment:', error);
    throw error;
  }
};

export const updateAssignment = async (assignmentId, updates) => {
  try {
    console.log('🔄 Updating assignment:', assignmentId, updates);
    
    // Transform frontend updates to backend Task format
    const taskUpdateRequest = {
      title: updates.title,
      description: updates.description,
      type: updates.type,
      dueDate: updates.dueDate,
      dueTime: updates.dueTime,
      maxPoints: updates.maxPoints,
      instructions: updates.instructions,
      status: updates.status,
      priority: updates.priority,
      difficulty: updates.difficulty,
      category: updates.category,
      allowSubmissions: updates.allowSubmissions,
      allowLateSubmissions: updates.allowLateSubmissions,
      latePenaltyPerDay: updates.latePenaltyPerDay,
      visibleToStudents: updates.visibleToStudents,
      requiresSubmission: updates.requiresSubmission,
      maxAttempts: updates.maxAttempts,
      estimatedDuration: updates.estimatedDuration,
      tags: updates.tags,
      prerequisiteTasks: updates.prerequisiteTasks,
      fileUrl: updates.fileUrl,
      fileName: updates.fileName,
      fileSize: updates.fileSize
    };
    
    const updatedTask = await apiClient.put(`/tasks/${assignmentId}`, taskUpdateRequest);
    console.log('✅ Assignment updated successfully:', updatedTask);
    
    return updatedTask;
  } catch (error) {
    console.error('❌ Error updating assignment:', error);
    throw error;
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    console.log('🗑️ Deleting assignment:', assignmentId);
    await apiClient.delete(`/tasks/${assignmentId}`);
    console.log('✅ Assignment deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting assignment:', error);
    throw error;
  }
};

/**
 * ENHANCED ASSIGNMENT FILE OPERATIONS
 */
export const createAssignmentWithFile = async (assignmentData, file = null) => {
  try {
    console.log('➕ Creating assignment with file:', assignmentData.title);
    
    let fileData = null;
    
    // Upload file first if provided
    if (file) {
      fileData = await uploadFile(file, 'assignment', {
        assignmentTitle: assignmentData.title,
        courseId: assignmentData.courseId
      });
      
      // Add file info to assignment data
      assignmentData.fileUrl = fileData.url;
      assignmentData.fileName = fileData.name;
      assignmentData.fileSize = fileData.size;
      assignmentData.hasAttachment = true;
    }
    
    // Create assignment
    const createdAssignment = await createAssignment(assignmentData);
    
    console.log('✅ Assignment created with file:', createdAssignment.id);
    return createdAssignment;
    
  } catch (error) {
    console.error('❌ Failed to create assignment with file:', error);
    throw error;
  }
};

export const updateAssignmentFile = async (assignmentId, file) => {
  try {
    console.log('🔄 Updating assignment file:', assignmentId);
    
    // Upload new file
    const fileData = await uploadFile(file, 'assignment', {
      assignmentId: assignmentId
    });
    
    // Update assignment with new file info
    const updates = {
      fileUrl: fileData.url,
      fileName: fileData.name,
      fileSize: fileData.size,
      hasAttachment: true
    };
    
    const updatedAssignment = await updateAssignment(assignmentId, updates);
    
    console.log('✅ Assignment file updated successfully');
    return updatedAssignment;
    
  } catch (error) {
    console.error('❌ Failed to update assignment file:', error);
    throw error;
  }
};

export const removeAssignmentFile = async (assignmentId, fileUrl) => {
  try {
    console.log('🗑️ Removing file from assignment:', assignmentId);
    
    // Delete the file
    if (fileUrl) {
      await deleteFile(fileUrl);
    }
    
    // Update assignment to remove file info
    const updates = {
      fileUrl: null,
      fileName: null,
      fileSize: null,
      hasAttachment: false
    };
    
    const updatedAssignment = await updateAssignment(assignmentId, updates);
    
    console.log('✅ File removed from assignment successfully');
    return updatedAssignment;
    
  } catch (error) {
    console.error('❌ Failed to remove file from assignment:', error);
    throw error;
  }
};

/**
 * SUBMISSIONS ENDPOINTS
 */
export const fetchSubmissions = async (courseId, params = {}) => {
  try {
    const submissions = await apiClient.get(`/submissions/course/${courseId}`, params);
    return Array.isArray(submissions) ? submissions.map(submission => ({
      ...submission,
      submittedAt: submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A',
      fileName: submission.fileUrl ? submission.fileUrl.split('/').pop() : 'No file'
    })) : [];
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
};

export const updateSubmissionGrade = async (submissionId, grade, feedback = '') => {
  try {
    // Update the submission entity directly
    return await apiClient.put(`/submissions/${submissionId}`, {
      grade: grade,
      feedback: feedback
    });
  } catch (error) {
    throw error;
  }
};

export const downloadSubmission = async (submissionId) => {
  try {
    // Get submission details first
    const submission = await apiClient.get(`/submissions/${submissionId}`);
    if (submission.fileUrl) {
      return await downloadFile(submission.fileUrl, submission.fileName);
    }
    throw new Error('No file available for download');
  } catch (error) {
    throw error;
  }
};

/**
 * EXAMS ENDPOINTS (Placeholders for future implementation)
 */
export const fetchExams = async (courseId, params = {}) => {
  try {
    // This endpoint doesn't exist yet, return empty array
    console.warn('Exams endpoint not implemented yet');
    return [];
  } catch (error) {
    console.error('Error fetching exams:', error);
    return [];
  }
};

export const createExam = async (examData) => {
  try {
    // Placeholder for future implementation
    console.warn('Create exam endpoint not implemented yet');
    return { id: Date.now(), ...examData, questions: [], totalPoints: 0, status: 'draft' };
  } catch (error) {
    throw error;
  }
};

export const updateExam = async (examId, updates) => {
  try {
    // Placeholder for future implementation
    console.warn('Update exam endpoint not implemented yet');
    return { id: examId, ...updates };
  } catch (error) {
    throw error;
  }
};

export const fetchExamResponses = async (courseId, params = {}) => {
  try {
    // Placeholder for future implementation
    console.warn('Exam responses endpoint not implemented yet');
    return [];
  } catch (error) {
    console.error('Error fetching exam responses:', error);
    return [];
  }
};

export const addQuestionToExam = async (examId, questionData) => {
  try {
    // Placeholder for future implementation
    console.warn('Add question to exam endpoint not implemented yet');
    return { question: { id: Date.now(), ...questionData } };
  } catch (error) {
    throw error;
  }
};

export const updateQuestion = async (examId, questionId, updates) => {
  try {
    // Placeholder for future implementation
    console.warn('Update question endpoint not implemented yet');
    return { id: questionId, ...updates };
  } catch (error) {
    throw error;
  }
};

export const deleteQuestionFromExam = async (examId, questionId) => {
  try {
    // Placeholder for future implementation
    console.warn('Delete question from exam endpoint not implemented yet');
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const updateExamStatus = async (examId, status) => {
  try {
    // Placeholder for future implementation
    console.warn('Update exam status endpoint not implemented yet');
    return { id: examId, status };
  } catch (error) {
    throw error;
  }
};

export const deleteExam = async (examId) => {
  try {
    // Placeholder for future implementation
    console.warn('Delete exam endpoint not implemented yet');
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const updateExamResponseScore = async (responseId, questionId, points) => {
  try {
    // Placeholder for future implementation
    console.warn('Update exam response score endpoint not implemented yet');
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const autoGradeExamResponse = async (responseId) => {
  try {
    // Placeholder for future implementation
    console.warn('Auto grade exam response endpoint not implemented yet');
    return { success: true, graded: true };
  } catch (error) {
    throw error;
  }
};

/**
 * EXPORT FUNCTIONALITY
 */
export const exportGrades = async (courseId, format = 'csv', options = {}) => {
  try {
    // For now, simulate CSV export since the endpoint might not exist yet
    console.warn('Export grades endpoint not implemented yet');
    
    // Create a simple CSV with current data
    const students = await fetchStudents(courseId);
    const columns = await fetchGradeColumns(courseId);
    
    let csvContent = 'Student Name,';
    csvContent += columns.map(col => `${col.name} (${col.percentage}%)`).join(',');
    csvContent += ',Final Grade\n';
    
    students.forEach(student => {
      csvContent += `${student.name},`;
      csvContent += columns.map(col => student.grades[col.id] || '').join(',');
      csvContent += `,${student.finalGrade}%\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const filename = `grades_course_${courseId}_${new Date().toISOString().split('T')[0]}.csv`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error) {
    throw error;
  }
};

/**
 * ANALYTICS ENDPOINTS (Placeholders)
 */
export const fetchDashboardAnalytics = async (courseId) => {
  try {
    // Placeholder for analytics
    console.warn('Analytics endpoint not implemented yet');
    return {
      totalStudents: 0,
      averageGrade: 0,
      assignmentsCompleted: 0,
      upcomingDeadlines: []
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};

/**
 * BATCH OPERATIONS
 */
export const batchGradeSubmissions = async (submissionIds, grade, feedback = '') => {
  try {
    // Implement batch update of multiple submissions
    const promises = submissionIds.map(id => 
      updateSubmissionGrade(id, grade, feedback)
    );
    return await Promise.all(promises);
  } catch (error) {
    throw error;
  }
};

/**
 * HELPER FUNCTIONS
 */
export const checkUserEnrollment = async (courseId, userId) => {
  try {
    const course = await apiClient.get(`/courses/${courseId}`);
    
    if (!course.enrollments) return false;
    
    // Check if user is enrolled in any academic year
    return course.enrollments.some(enrollment => 
      enrollment.studentIds && enrollment.studentIds.includes(userId)
    );
  } catch (error) {
    console.error('Error checking user enrollment:', error);
    return false;
  }
};

export const getCourseEnrollmentCount = async (courseId, academicYear = 2024) => {
  try {
    const course = await apiClient.get(`/courses/${courseId}`);
    
    if (!course.enrollments) return 0;
    
    const enrollment = course.enrollments.find(e => e.academicYear === academicYear);
    return enrollment ? enrollment.studentIds.length : 0;
  } catch (error) {
    console.error('Error getting enrollment count:', error);
    return 0;
  }
};

/**
 * ERROR HANDLING UTILITY
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // If it's already formatted, return as is
  if (error.error && error.status !== undefined) {
    return error;
  }
  
  // Format unhandled errors
  return {
    error: true,
    status: error.status || 0,
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    details: error.details || null
  };
};

// Export the apiClient for direct use if needed
export { apiClient, validateFileForUpload };