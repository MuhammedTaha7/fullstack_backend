/**
 * Lecturer Dashboard Component - Complete Implementation with Enhanced File Handling
 * File: src/View/Pages/Lecturer/AssignmentsDashboard.jsx
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  Users, 
  Upload, 
  GraduationCap, 
  Save, 
  Download,
  Plus,
  Trash2,
  Edit3,
  Award,
  ClipboardList,
  FileText,
  Settings,
  Percent,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  Eye,
  Clock,
  Calendar,
  BookOpen,
  Target,
  Play,
  Pause,
  Edit,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  PaperclipIcon,
  X
} from 'lucide-react';
import { useLecturerDashboard } from '../../../Hooks/useAssignmentsDashboard';
import { formatDateTime, formatFileSize } from '../../../Utils/AssignmentsDashboardUtils';
import styles from './AssignmentsDashboard.module.css';

export default function LecturerDashboard() {
  const {
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
    showColumnForm,
    setShowColumnForm,
    showExamForm,
    setShowExamForm,
    showAssignmentForm,
    setShowAssignmentForm,
    loading,
    error,
    success,
    
    // Data
    courses,
    students,
    assignments,
    submissions,
    exams,
    examResponses,
    gradeColumns,
    
    // Forms
    newAssignment,
    setNewAssignment,
    newColumn,
    setNewColumn,
    newExam,
    setNewExam,
    newQuestion,
    setNewQuestion,
    
    // Actions
    handleFileUpload,
    addAssignment,
    addGradeColumn,
    updateColumn,
    deleteColumn,
    updateGrade,
    deleteAssignment,
    updateAssignment,
    updateSubmissionGrade,
    createExam,
    addQuestionToExam,
    deleteQuestion,
    updateExamStatus,
    deleteExam,
    updateExamResponseScore,
    autoGradeResponse,
    exportGrades,
    
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
    getResponsesForExam
  } = useLecturerDashboard();

  // Local state for assignment viewing and editing
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [editingAssignmentData, setEditingAssignmentData] = useState(null);
  const fileInputRef = useRef(null);

  // Enhanced file handling functions
  const handleViewFile = useCallback((fileUrl, fileName) => {
    console.log('🔍 Attempting to open file:', fileName, 'URL:', fileUrl);
    
    if (!fileUrl) {
      console.error('No file URL provided');
      return;
    }

    try {
      // Check if it's a blob URL (temporary file)
      if (fileUrl.startsWith('blob:')) {
        // For blob URLs, create a download link
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'assignment-file';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Append to body, click, then remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ File download initiated');
      } else if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        // For actual URLs, open in new tab
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
        console.log('✅ File opened in new tab');
      } else {
        // For relative URLs, prepend base URL
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
        const fullUrl = fileUrl.startsWith('/') 
          ? `${baseUrl}${fileUrl}`
          : `${baseUrl}/${fileUrl}`;
        
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
        console.log('✅ File opened with full URL:', fullUrl);
      }
    } catch (error) {
      console.error('❌ Error opening file:', error);
    }
  }, []);

  // Enhanced file upload with validation
  const handleFileUploadWithValidation = useCallback(async (event, assignmentId = null) => {
    const file = event.target.files[0];
    if (!file) return;

    // File validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.jpg', '.jpeg', '.png', '.gif'];
    
    try {
      // Validate file size
      if (file.size > maxSize) {
        const fileSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100;
        throw new Error(`File size exceeds 10MB limit (${fileSizeMB}MB)`);
      }
      
      // Validate file extension
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error(`File type ${fileExtension} not allowed. Allowed: ${allowedExtensions.join(', ')}`);
      }
      
      // Call the original file upload handler
      await handleFileUpload(event, assignmentId);
      
    } catch (err) {
      console.error('File validation error:', err);
      // Clear the file input
      event.target.value = '';
    }
  }, [handleFileUpload]);

  // File removal handler
  const handleRemoveFile = useCallback(() => {
    setNewAssignment(prev => ({
      ...prev,
      file: null,
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      hasAttachment: false
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setNewAssignment]);

  // Handler for starting assignment edit
  const handleEditAssignment = (assignment) => {
    setEditingAssignmentData({...assignment});
    setEditingAssignment(assignment.id);
  };

  // Handler for canceling assignment edit
  const handleCancelEdit = () => {
    setEditingAssignmentData(null);
    setEditingAssignment(null);
  };

  // Handler for saving assignment edits
  const handleSaveEdit = async () => {
    if (editingAssignmentData) {
      await updateAssignment(editingAssignmentData.id, editingAssignmentData);
      setEditingAssignmentData(null);
      setEditingAssignment(null);
    }
  };

  // Handler for viewing assignment details
  const handleViewAssignment = (assignment) => {
    setViewingAssignment(assignment);
  };

  // Get file type icon
  const getFileTypeIcon = (fileName) => {
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

  // File Upload Component
  const FileUploadInput = ({ onFileUpload, currentFile, disabled }) => {
    return (
      <div className="col-span-2">
        <label className={styles.formLabel}>File Attachment (Optional)</label>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileUpload}
            className={styles.formInput}
            disabled={disabled}
            accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.jpeg,.png,.gif"
          />
          <div className={styles.fileSupportInfo}>
            <div className={styles.fileSupportText}>
              <strong>Supported formats:</strong> PDF, DOC, DOCX, TXT, ZIP, JPG, PNG, GIF (max 10MB)
            </div>
          </div>
          {currentFile && (
            <div className={styles.filePreviewCard}>
              <div className={styles.filePreviewIcon}>
                {getFileTypeIcon(currentFile.name || currentFile.fileName)}
              </div>
              <div className={styles.filePreviewInfo}>
                <div className={styles.filePreviewName}>
                  {currentFile.name || currentFile.fileName}
                </div>
                {(currentFile.size || currentFile.fileSize) && (
                  <div className={styles.filePreviewSize}>
                    Size: {formatFileSize(currentFile.size || currentFile.fileSize)}
                  </div>
                )}
              </div>
              <div className={styles.filePreviewActions}>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className={styles.fileActionBtnDelete}
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && courses.length === 0) {
    return (
      <div className={styles.dashboard}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <GraduationCap className={styles.logo} />
              <h1 className={styles.title}>Lecturer Dashboard</h1>
            </div>
            <div className={styles.headerRight}>
              <button 
                onClick={exportGrades}
                disabled={loading || !selectedCourse}
                className={styles.exportBtn}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className={styles.btnIcon} />
                )}
                <span>Export Grades</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <div className={styles.navItems}>
            {[
              { id: 'grades', label: 'Grades', icon: Award },
              { id: 'assignments', label: 'Assignments', icon: ClipboardList },
              { id: 'exams', label: 'Online Exams', icon: FileText },
              { id: 'submissions', label: 'Submissions', icon: Upload },
              { id: 'exam-responses', label: 'Exam Responses', icon: ClipboardList }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
              >
                <tab.icon className={styles.navIcon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Error Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Success Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Course Selector */}
        <div className={styles.courseSelector}>
          <label className={styles.courseSelectorLabel}>Select Course</label>
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={styles.courseSelectorSelect}
            disabled={loading}
          >
            <option value="">Choose a course...</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

        {!selectedCourse ? (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Course</h3>
            <p className="text-gray-500">Choose a course from the dropdown above to get started.</p>
          </div>
        ) : (
          <>
            {/* Assignment Viewing Modal */}
            {viewingAssignment && (
              <div className={styles.assignmentModal}>
                <div className={styles.assignmentModalContent}>
                  <div className={styles.assignmentModalHeader}>
                    <h2 className={styles.assignmentModalTitle}>{viewingAssignment.title}</h2>
                    <button
                      onClick={() => setViewingAssignment(null)}
                      className={styles.assignmentModalCloseBtn}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className={styles.assignmentModalBody}>
                    <div className={styles.assignmentModalGrid}>
                      <div className={styles.assignmentModalSection}>
                        <h3 className={styles.assignmentModalSectionTitle}>
                          <ClipboardList className="h-5 w-5" />
                          Assignment Details
                        </h3>
                        <div className={styles.assignmentModalSectionContent}>
                          <div className={styles.assignmentModalDetail}>
                            <span className={styles.assignmentModalDetailLabel}>Type</span>
                            <span className={styles.assignmentModalDetailValue}>{viewingAssignment.type}</span>
                          </div>
                          <div className={styles.assignmentModalDetail}>
                            <span className={styles.assignmentModalDetailLabel}>Due Date</span>
                            <span className={styles.assignmentModalDetailValue}>
                              {formatDateTime(viewingAssignment.dueDate, viewingAssignment.dueTime)}
                            </span>
                          </div>
                          <div className={styles.assignmentModalDetail}>
                            <span className={styles.assignmentModalDetailLabel}>Max Points</span>
                            <span className={styles.assignmentModalDetailValue}>{viewingAssignment.maxPoints}</span>
                          </div>
                          <div className={styles.assignmentModalDetail}>
                            <span className={styles.assignmentModalDetailLabel}>Priority</span>
                            <span className={styles.assignmentModalDetailValue}>{viewingAssignment.priority}</span>
                          </div>
                          <div className={styles.assignmentModalDetail}>
                            <span className={styles.assignmentModalDetailLabel}>Difficulty</span>
                            <span className={styles.assignmentModalDetailValue}>{viewingAssignment.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={styles.assignmentModalSection}>
                        <h3 className={styles.assignmentModalSectionTitle}>
                          <Award className="h-5 w-5" />
                          Statistics
                        </h3>
                        <div className={styles.assignmentModalSectionContent}>
                          <div className={styles.assignmentModalDetail}>
                            <span className={styles.assignmentModalDetailLabel}>Submissions</span>
                            <span className={styles.assignmentModalDetailValue}>{viewingAssignment.submissionCount || 0}</span>
                          </div>
                          <div className={styles.assignmentModalDetail}>
                            <span className={styles.assignmentModalDetailLabel}>Graded</span>
                            <span className={styles.assignmentModalDetailValue}>{viewingAssignment.gradedCount || 0}</span>
                          </div>
                          <div className={styles.assignmentModalDetail}>
                            <span className={styles.assignmentModalDetailLabel}>Average Grade</span>
                            <span className={styles.assignmentModalDetailValue}>
                              {viewingAssignment.averageGrade?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {viewingAssignment.description && (
                      <div className={styles.assignmentModalDescription}>
                        <h3 className={styles.assignmentModalDescriptionTitle}>Description</h3>
                        <p className={styles.assignmentModalDescriptionText}>{viewingAssignment.description}</p>
                      </div>
                    )}
                    
                    {viewingAssignment.instructions && (
                      <div className={styles.assignmentModalDescription}>
                        <h3 className={styles.assignmentModalDescriptionTitle}>Instructions</h3>
                        <p className={styles.assignmentModalDescriptionText}>{viewingAssignment.instructions}</p>
                      </div>
                    )}
                    
                    {(viewingAssignment.hasAttachment && viewingAssignment.fileUrl) && (
                      <div className={styles.assignmentModalFileSection}>
                        <div className={styles.assignmentModalFileHeader}>
                          <span className={styles.assignmentModalFileIcon}>
                            {getFileTypeIcon(viewingAssignment.fileName)}
                          </span>
                          <span>File Attachment</span>
                        </div>
                        <div className={styles.assignmentModalFileContent}>
                          <div className={styles.assignmentModalFileDetails}>
                            <div className={styles.assignmentModalFileName}>
                              {viewingAssignment.fileName || 'Assignment File'}
                            </div>
                            {viewingAssignment.fileSize && (
                              <div className={styles.assignmentModalFileSize}>
                                Size: {formatFileSize(viewingAssignment.fileSize)}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleViewFile(viewingAssignment.fileUrl, viewingAssignment.fileName)}
                            className={styles.assignmentModalFileButton}
                          >
                            <ExternalLink className="h-4 w-4" />
                            View File
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Grades Tab - Preserved Functionality */}
            {activeTab === 'grades' && (
              <div className={styles.tabContent}>
                {/* Grade Configuration */}
                <div className={styles.card}>
                  <div className={styles.gradeConfigHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>Grade Configuration</h3>
                      <p className={styles.cardSubtitle}>Configure your grading components and their weights</p>
                    </div>
                    <div className={styles.gradeConfigActions}>
                      <div className={`${styles.totalPercentage} ${getTotalPercentage() === 100 ? styles.totalPercentageValid : styles.totalPercentageInvalid}`}>
                        <Percent className={styles.percentIcon} />
                        <span className={styles.percentText}>Total: {getTotalPercentage()}%</span>
                        {getTotalPercentage() === 100 && (
                          <div className={styles.validIndicator}></div>
                        )}
                      </div>
                      <button
                        onClick={() => setShowColumnForm(!showColumnForm)}
                        disabled={loading}
                        className={styles.addGradeBtn}
                      >
                        {loading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className={styles.btnIcon} />
                        )}
                        <span>Add Grade</span>
                      </button>
                    </div>
                  </div>

                  {showColumnForm && (
                    <div className={styles.formSection}>
                      <h4 className={styles.formTitle}>Add New Grade Component</h4>
                      <div className={styles.formCard}>
                        <div className={styles.formGrid}>
                          <div>
                            <label className={styles.formLabel}>Grade Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Midterm Exam"
                              value={newColumn.name}
                              onChange={(e) => setNewColumn({...newColumn, name: e.target.value})}
                              className={styles.formInput}
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <label className={styles.formLabel}>Type</label>
                            <select
                              value={newColumn.type}
                              onChange={(e) => setNewColumn({...newColumn, type: e.target.value})}
                              className={styles.formSelect}
                              disabled={loading}
                            >
                              <option value="assignment">Assignment</option>
                              <option value="exam">Exam</option>
                              <option value="quiz">Quiz</option>
                              <option value="project">Project</option>
                            </select>
                          </div>
                          <div>
                            <label className={styles.formLabel}>Weight (%)</label>
                            <div className={styles.percentInputWrapper}>
                              <input
                                type="number"
                                placeholder="20"
                                value={newColumn.percentage}
                                onChange={(e) => setNewColumn({...newColumn, percentage: e.target.value})}
                                className={styles.percentInput}
                                min="0"
                                max="100"
                                disabled={loading}
                              />
                              <Percent className={styles.percentInputIcon} />
                            </div>
                          </div>
                          <div className={styles.formButtonContainer}>
                            <button
                              onClick={addGradeColumn}
                              disabled={loading}
                              className={styles.primaryBtn}
                            >
                              {loading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className={styles.btnIcon} />
                              )}
                              <span>Add Grade</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={styles.cardContent}>
                    {filteredColumns.length > 0 ? (
                      <div>
                        <h4 className={styles.sectionTitle}>Current Grade Components</h4>
                        <div className={styles.tableWrapper}>
                          <table className={styles.table}>
                            <thead>
                              <tr className={styles.tableHeaderRow}>
                                <th className={styles.tableHeader}>Component</th>
                                <th className={styles.tableHeader}>Type</th>
                                <th className={styles.tableHeader}>Weight</th>
                                <th className={styles.tableHeaderCenter}>Actions</th>
                              </tr>
                            </thead>
                            <tbody className={styles.tableBody}>
                              {filteredColumns.map((column) => (
                                <tr key={column.id} className={styles.tableRow}>
                                  <td className={styles.tableCell}>
                                    <input
                                      type="text"
                                      value={column.name}
                                      onChange={(e) => updateColumn(column.id, 'name', e.target.value)}
                                      className={styles.tableInput}
                                      disabled={loading}
                                    />
                                  </td>
                                  <td className={styles.tableCell}>
                                    <div className={`${styles.typeBadge} ${styles[`typeBadge${column.type.charAt(0).toUpperCase() + column.type.slice(1)}`]}`}>
                                      <div className={`${styles.typeBadgeDot} ${styles[`typeBadgeDot${column.type.charAt(0).toUpperCase() + column.type.slice(1)}`]}`}></div>
                                      <span className={styles.typeBadgeText}>{column.type}</span>
                                    </div>
                                  </td>
                                  <td className={styles.tableCell}>
                                    <div className={styles.percentageInputGroup}>
                                      <input
                                        type="number"
                                        value={column.percentage}
                                        onChange={(e) => updateColumn(column.id, 'percentage', parseInt(e.target.value) || 0)}
                                        className={styles.percentageInput}
                                        min="0"
                                        max="100"
                                        disabled={loading}
                                      />
                                      <span className={styles.percentageSymbol}>%</span>
                                    </div>
                                  </td>
                                  <td className={styles.tableCellCenter}>
                                    <button
                                      onClick={() => deleteColumn(column.id)}
                                      disabled={loading}
                                      className={styles.deleteBtn}
                                      title="Delete component"
                                    >
                                      <Trash2 className={styles.btnIcon} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Summary Row */}
                        <div className={styles.summarySection}>
                          <div className={styles.summaryContent}>
                            <span className={styles.summaryLabel}>Total Weight:</span>
                            <div className={`${styles.summaryValue} ${getTotalPercentage() === 100 ? styles.summaryValueValid : getTotalPercentage() < 100 ? styles.summaryValueWarning : styles.summaryValueError}`}>
                              <span>{getTotalPercentage()}%</span>
                              {getTotalPercentage() === 100 ? (
                                <span className={styles.summaryCheck}>✓</span>
                              ) : (
                                <span className={styles.summaryWarning}>⚠</span>
                              )}
                            </div>
                          </div>
                          {getTotalPercentage() !== 100 && (
                            <p className={styles.summaryHelp}>
                              {getTotalPercentage() < 100 
                                ? `Add ${100 - getTotalPercentage()}% more to reach 100%`
                                : `Reduce by ${getTotalPercentage() - 100}% to reach 100%`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <ClipboardList className={styles.emptyStateIcon} />
                        <h4 className={styles.emptyStateTitle}>No Grade Components</h4>
                        <p className={styles.emptyStateText}>
                          Start building your grading structure by adding components like assignments, exams, and projects.
                        </p>
                        <button
                          onClick={() => setShowColumnForm(true)}
                          disabled={loading}
                          className={styles.primaryBtn}
                        >
                          <Plus className={styles.btnIcon} />
                          <span>Add Your First Grade Component</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grades Table */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>Student Grades - {selectedCourseData?.name}</h3>
                      <p className={styles.cardSubtitle}>
                        {filteredStudents.length} students enrolled
                      </p>
                    </div>
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr className={styles.tableHeaderRowGray}>
                          <th className={styles.tableHeader}>
                            <div className={styles.tableHeaderWithIcon}>
                              <Users className={styles.tableHeaderIcon} />
                              <span>Student Name</span>
                            </div>
                          </th>
                          {filteredColumns.map((column) => (
                            <th key={column.id} className={styles.tableHeader}>
                              <div className={styles.tableHeaderContent}>
                                <div className={styles.tableHeaderName}>{column.name}</div>
                                <div className={styles.tableHeaderPercentage}>({column.percentage}%)</div>
                              </div>
                            </th>
                          ))}
                          <th className={styles.tableHeader}>
                            <div className={styles.tableHeaderWithIcon}>
                              <Award className={styles.tableHeaderIcon} />
                              <span>Final Grade</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className={styles.tableBody}>
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className={styles.tableRow}>
                            <td className={styles.tableCell}>
                              <div className={styles.studentInfo}>
                                <div className={styles.studentAvatar}>
                                  {student.name ? student.name.split(' ').map(n => n[0]).join('') : '?'}
                                </div>
                                <div>
                                  <div className={styles.studentName}>{student.name || 'Unknown Student'}</div>
                                  <div className={styles.studentEmail}>{student.email}</div>
                                </div>
                              </div>
                            </td>
                            {filteredColumns.map(column => {
                              const grade = student.grades?.[column.id] || '';
                              return (
                                <td key={column.id} className={styles.tableCell}>
                                  <input
                                    type="number"
                                    value={grade}
                                    onChange={(e) => updateGrade(student.id, column.id, e.target.value)}
                                    className={styles.gradeInput}
                                    min="0"
                                    max="100"
                                    placeholder="--"
                                    disabled={loading}
                                  />
                                </td>
                              );
                            })}
                            <td className={styles.tableCell}>
                              <span className={`${styles.finalGradeBadge} ${
                                calculateFinalGrade(student) >= 90 ? styles.gradeA :
                                calculateFinalGrade(student) >= 80 ? styles.gradeB :
                                calculateFinalGrade(student) >= 70 ? styles.gradeC :
                                styles.gradeF
                              }`}>
                                {calculateFinalGrade(student)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                          <tr>
                            <td colSpan={filteredColumns.length + 2} className="text-center py-8 text-gray-500">
                              No students enrolled in this course.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Assignments Tab - ENHANCED WITH FILE HANDLING */}
            {activeTab === 'assignments' && (
              <div className={styles.tabContent}>
                {/* Assignments Header */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>Assignments - {selectedCourseData?.name}</h3>
                      <p className={styles.cardSubtitle}>Manage course assignments and tasks</p>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                        disabled={loading}
                        className={styles.primaryBtn}
                      >
                        {loading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className={styles.btnIcon} />
                        )}
                        <span>Create Assignment</span>
                      </button>
                    </div>
                  </div>

                  {/* Assignment Creation Form */}
                  {showAssignmentForm && (
                    <div className={styles.formSection}>
                      <h4 className={styles.formTitle}>Create New Assignment</h4>
                      <div className={styles.formCard}>
                        <div className={styles.formGrid}>
                          <div className="col-span-2">
                            <label className={styles.formLabel}>Assignment Title</label>
                            <input
                              type="text"
                              placeholder="Enter assignment title"
                              value={newAssignment.title}
                              onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                              className={styles.formInput}
                              disabled={loading}
                            />
                          </div>
                          
                          <div>
                            <label className={styles.formLabel}>Type</label>
                            <select
                              value={newAssignment.type}
                              onChange={(e) => setNewAssignment({...newAssignment, type: e.target.value})}
                              className={styles.formSelect}
                              disabled={loading}
                            >
                              <option value="homework">Homework</option>
                              <option value="project">Project</option>
                              <option value="essay">Essay</option>
                              <option value="lab">Lab Work</option>
                              <option value="presentation">Presentation</option>
                            </select>
                          </div>

                          <div>
                            <label className={styles.formLabel}>Max Points</label>
                            <input
                              type="number"
                              placeholder="100"
                              value={newAssignment.maxPoints}
                              onChange={(e) => setNewAssignment({...newAssignment, maxPoints: parseInt(e.target.value) || 100})}
                              className={styles.formInput}
                              min="1"
                              max="1000"
                              disabled={loading}
                            />
                          </div>

                          <div>
                            <label className={styles.formLabel}>Due Date</label>
                            <input
                              type="date"
                              value={newAssignment.dueDate}
                              onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                              className={styles.formInput}
                              disabled={loading}
                            />
                          </div>

                          <div>
                            <label className={styles.formLabel}>Due Time</label>
                            <input
                              type="time"
                              value={newAssignment.dueTime}
                              onChange={(e) => setNewAssignment({...newAssignment, dueTime: e.target.value})}
                              className={styles.formInput}
                              disabled={loading}
                            />
                          </div>

                          <div className="col-span-2">
                            <label className={styles.formLabel}>Description</label>
                            <textarea
                              placeholder="Enter assignment description and requirements"
                              value={newAssignment.description}
                              onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                              className={styles.formTextarea}
                              rows={3}
                              disabled={loading}
                            />
                          </div>

                          <div className="col-span-2">
                            <label className={styles.formLabel}>Instructions</label>
                            <textarea
                              placeholder="Detailed instructions for students"
                              value={newAssignment.instructions}
                              onChange={(e) => setNewAssignment({...newAssignment, instructions: e.target.value})}
                              className={styles.formTextarea}
                              rows={3}
                              disabled={loading}
                            />
                          </div>

                          <div>
                            <label className={styles.formLabel}>Priority</label>
                            <select
                              value={newAssignment.priority}
                              onChange={(e) => setNewAssignment({...newAssignment, priority: e.target.value})}
                              className={styles.formSelect}
                              disabled={loading}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>

                          <div>
                            <label className={styles.formLabel}>Difficulty</label>
                            <select
                              value={newAssignment.difficulty}
                              onChange={(e) => setNewAssignment({...newAssignment, difficulty: e.target.value})}
                              className={styles.formSelect}
                              disabled={loading}
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>

                          {/* Enhanced File Upload Component */}
                          <FileUploadInput 
                            onFileUpload={handleFileUploadWithValidation}
                            currentFile={newAssignment.file || (newAssignment.fileName ? { name: newAssignment.fileName, size: newAssignment.fileSize } : null)}
                            disabled={loading}
                          />

                          <div className="col-span-2">
                            <div className="flex gap-3">
                              <button
                                onClick={addAssignment}
                                disabled={loading}
                                className={styles.primaryBtn}
                              >
                                {loading ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className={styles.btnIcon} />
                                )}
                                <span>Create Assignment</span>
                              </button>
                              <button
                                onClick={() => setShowAssignmentForm(false)}
                                disabled={loading}
                                className={styles.secondaryBtn}
                              >
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assignments List */}
                  <div className={styles.cardContent}>
                    {filteredAssignments && filteredAssignments.length > 0 ? (
                      <div className={styles.assignmentsList}>
                        {filteredAssignments.map((assignment) => (
                          <div key={assignment.id} className={styles.assignmentCardEnhanced}>
                            {editingAssignment === assignment.id ? (
                              // Edit Mode
                              <div className={styles.assignmentEditForm}>
                                <h4 className={styles.assignmentEditFormTitle}>
                                  <Edit3 className="h-5 w-5" />
                                  Edit Assignment
                                </h4>
                                <div className={styles.assignmentEditGrid}>
                                  <div className={styles.assignmentEditField}>
                                    <label className={styles.assignmentEditLabel}>Title</label>
                                    <input
                                      type="text"
                                      value={editingAssignmentData?.title || ''}
                                      onChange={(e) => setEditingAssignmentData({
                                        ...editingAssignmentData,
                                        title: e.target.value
                                      })}
                                      className={styles.assignmentEditInput}
                                      placeholder="Enter assignment title"
                                    />
                                  </div>
                                  <div className={styles.assignmentEditField}>
                                    <label className={styles.assignmentEditLabel}>Type</label>
                                    <select
                                      value={editingAssignmentData?.type || ''}
                                      onChange={(e) => setEditingAssignmentData({
                                        ...editingAssignmentData,
                                        type: e.target.value
                                      })}
                                      className={styles.assignmentEditSelect}
                                    >
                                      <option value="homework">Homework</option>
                                      <option value="project">Project</option>
                                      <option value="essay">Essay</option>
                                      <option value="lab">Lab Work</option>
                                      <option value="presentation">Presentation</option>
                                    </select>
                                  </div>
                                  <div className={styles.assignmentEditField}>
                                    <label className={styles.assignmentEditLabel}>Due Date</label>
                                    <input
                                      type="date"
                                      value={editingAssignmentData?.dueDate || ''}
                                      onChange={(e) => setEditingAssignmentData({
                                        ...editingAssignmentData,
                                        dueDate: e.target.value
                                      })}
                                      className={styles.assignmentEditInput}
                                    />
                                  </div>
                                  <div className={styles.assignmentEditField}>
                                    <label className={styles.assignmentEditLabel}>Due Time</label>
                                    <input
                                      type="time"
                                      value={editingAssignmentData?.dueTime || ''}
                                      onChange={(e) => setEditingAssignmentData({
                                        ...editingAssignmentData,
                                        dueTime: e.target.value
                                      })}
                                      className={styles.assignmentEditInput}
                                    />
                                  </div>
                                  <div className={styles.assignmentEditField}>
                                    <label className={styles.assignmentEditLabel}>Max Points</label>
                                    <input
                                      type="number"
                                      value={editingAssignmentData?.maxPoints || ''}
                                      onChange={(e) => setEditingAssignmentData({
                                        ...editingAssignmentData,
                                        maxPoints: parseInt(e.target.value) || 100
                                      })}
                                      className={styles.assignmentEditInput}
                                      min="1"
                                      max="1000"
                                      placeholder="100"
                                    />
                                  </div>
                                  <div className={styles.assignmentEditField}>
                                    <label className={styles.assignmentEditLabel}>Priority</label>
                                    <select
                                      value={editingAssignmentData?.priority || ''}
                                      onChange={(e) => setEditingAssignmentData({
                                        ...editingAssignmentData,
                                        priority: e.target.value
                                      })}
                                      className={styles.assignmentEditSelect}
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                    </select>
                                  </div>
                                  <div className={styles.assignmentEditField}>
                                    <label className={styles.assignmentEditLabel}>Difficulty</label>
                                    <select
                                      value={editingAssignmentData?.difficulty || ''}
                                      onChange={(e) => setEditingAssignmentData({
                                        ...editingAssignmentData,
                                        difficulty: e.target.value
                                      })}
                                      className={styles.assignmentEditSelect}
                                    >
                                      <option value="easy">Easy</option>
                                      <option value="medium">Medium</option>
                                      <option value="hard">Hard</option>
                                    </select>
                                  </div>
                                  <div className={`${styles.assignmentEditField} ${styles.assignmentEditFieldFull}`}>
                                    <label className={styles.assignmentEditLabel}>Description</label>
                                    <textarea
                                      value={editingAssignmentData?.description || ''}
                                      onChange={(e) => setEditingAssignmentData({
                                        ...editingAssignmentData,
                                        description: e.target.value
                                      })}
                                      className={styles.assignmentEditTextarea}
                                      placeholder="Enter assignment description and requirements"
                                      rows={3}
                                    />
                                  </div>
                                  <div className={`${styles.assignmentEditField} ${styles.assignmentEditFieldFull}`}>
                                    <label className={styles.assignmentEditLabel}>Instructions</label>
                                    <textarea
                                      value={editingAssignmentData?.instructions || ''}
                                      onChange={(e) => setEditingAssignmentData({
                                        ...editingAssignmentData,
                                        instructions: e.target.value
                                      })}
                                      className={styles.assignmentEditTextarea}
                                      placeholder="Detailed instructions for students"
                                      rows={3}
                                    />
                                  </div>
                                </div>
                                <div className={styles.assignmentEditActions}>
                                  <button
                                    onClick={handleSaveEdit}
                                    disabled={loading}
                                    className={styles.assignmentEditSaveBtn}
                                  >
                                    {loading ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Save className="h-4 w-4" />
                                    )}
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className={styles.assignmentEditCancelBtn}
                                  >
                                    <X className="h-4 w-4" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <>
                                <div className={styles.assignmentHeaderEnhanced}>
                                  <div className={styles.assignmentTitleEnhanced}>
                                    <h4>{assignment.title}</h4>
                                    <div className={styles.assignmentMeta}>
                                      <span className={`${styles.assignmentType} ${styles[`type${assignment.type?.charAt(0)?.toUpperCase() + assignment.type?.slice(1)}`]}`}>
                                        {assignment.type}
                                      </span>
                                      <span className={`${styles.assignmentPriority} ${styles[`priority${assignment.priority?.charAt(0)?.toUpperCase() + assignment.priority?.slice(1)}`]}`}>
                                        {assignment.priority}
                                      </span>
                                      <span className={`${styles.assignmentDifficulty} ${styles[`difficulty${assignment.difficulty?.charAt(0)?.toUpperCase() + assignment.difficulty?.slice(1)}`]}`}>
                                        {assignment.difficulty}
                                      </span>
                                    </div>
                                  </div>
                                  <div className={styles.assignmentActionsEnhanced}>
                                    <button
                                      onClick={() => handleViewAssignment(assignment)}
                                      disabled={loading}
                                      className={`${styles.assignmentActionBtn} ${styles.assignmentActionBtnView}`}
                                      title="View assignment details"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleEditAssignment(assignment)}
                                      disabled={loading}
                                      className={`${styles.assignmentActionBtn} ${styles.assignmentActionBtnEdit}`}
                                      title="Edit assignment"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteAssignment(assignment.id)}
                                      disabled={loading}
                                      className={`${styles.assignmentActionBtn} ${styles.assignmentActionBtnDelete}`}
                                      title="Delete assignment"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className={styles.assignmentContent}>
                                  <p className={styles.assignmentDescription}>
                                    {assignment.description || 'No description provided'}
                                  </p>
                                  
                                  <div className={styles.assignmentDetails}>
                                    <div className={styles.assignmentDetail}>
                                      <Calendar className="h-4 w-4" />
                                      <span>Due: {formatDateTime(assignment.dueDate, assignment.dueTime)}</span>
                                    </div>
                                    <div className={styles.assignmentDetail}>
                                      <Target className="h-4 w-4" />
                                      <span>Max Points: {assignment.maxPoints}</span>
                                    </div>
                                    {assignment.hasAttachment && assignment.fileUrl && (
                                      <div className={styles.assignmentDetail}>
                                        <span className="mr-2">{getFileTypeIcon(assignment.fileName)}</span>
                                        <button
                                          onClick={() => handleViewFile(assignment.fileUrl, assignment.fileName)}
                                          className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                        >
                                          <span>{assignment.fileName || 'View Attachment'}</span>
                                          <ExternalLink className="h-3 w-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className={styles.assignmentStats}>
                                    <div className={styles.statItem}>
                                      <span className={styles.statValue}>{assignment.submissionCount || 0}</span>
                                      <span className={styles.statLabel}>Submissions</span>
                                    </div>
                                    <div className={styles.statItem}>
                                      <span className={styles.statValue}>{assignment.gradedCount || 0}</span>
                                      <span className={styles.statLabel}>Graded</span>
                                    </div>
                                    <div className={styles.statItem}>
                                      <span className={styles.statValue}>{assignment.averageGrade?.toFixed(1) || '0.0'}</span>
                                      <span className={styles.statLabel}>Avg Grade</span>
                                    </div>
                                  </div>
                                </div>

                                {assignment.isOverdue && (
                                  <div className={styles.overdueWarning}>
                                    <AlertCircle className="h-4 w-4" />
                                    <span>This assignment is overdue</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <ClipboardList className={styles.emptyStateIcon} />
                        <h4 className={styles.emptyStateTitle}>No Assignments</h4>
                        <p className={styles.emptyStateText}>
                          Create your first assignment to get started with task management.
                        </p>
                        <button
                          onClick={() => setShowAssignmentForm(true)}
                          disabled={loading}
                          className={styles.primaryBtn}
                        >
                          <Plus className={styles.btnIcon} />
                          <span>Create Your First Assignment</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Exams Tab */}
            {activeTab === 'exams' && (
              <div className={styles.tabContent}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>Online Exams</h3>
                      <p className={styles.cardSubtitle}>This tab will be fully implemented when you add the Exam endpoints</p>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.emptyState}>
                      <FileText className={styles.emptyStateIcon} />
                      <h4 className={styles.emptyStateTitle}>Exams Coming Soon</h4>
                      <p className={styles.emptyStateText}>
                        Online exam management will be available once you implement the exam endpoints in your backend.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
              <div className={styles.tabContent}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>Submissions</h3>
                      <p className={styles.cardSubtitle}>Student assignment submissions</p>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.emptyState}>
                      <Upload className={styles.emptyStateIcon} />
                      <h4 className={styles.emptyStateTitle}>No Submissions Yet</h4>
                      <p className={styles.emptyStateText}>
                        Student submissions will appear here once assignments are created and students start submitting their work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Exam Responses Tab */}
            {activeTab === 'exam-responses' && (
              <div className={styles.tabContent}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>Exam Responses</h3>
                      <p className={styles.cardSubtitle}>Student online exam responses</p>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.emptyState}>
                      <ClipboardList className={styles.emptyStateIcon} />
                      <h4 className={styles.emptyStateTitle}>No Exam Responses Yet</h4>
                      <p className={styles.emptyStateText}>
                        Student exam responses will appear here once online exams are created and students take them.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}