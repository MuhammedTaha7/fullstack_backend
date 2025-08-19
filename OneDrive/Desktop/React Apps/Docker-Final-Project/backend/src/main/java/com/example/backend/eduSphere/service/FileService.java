package com.example.backend.eduSphere.service;

import com.example.backend.eduSphere.dto.request.FileUploadRequest;
import com.example.backend.eduSphere.dto.response.FileResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {

    FileResponse uploadFileWithMetadata(MultipartFile file, FileUploadRequest fileMetadata, String uploaderId, String uploaderName);

    List<FileResponse> getAccessibleFiles(String userId, String userRole, String userDepartment);

    FileResponse getFileMetadata(String fileId);

    void deleteFile(String fileId, String deleterId, String userRole);

    Resource getFileContent(String filename);
}