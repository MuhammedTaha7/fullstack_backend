package com.example.backend.eduSphere.service;

import com.example.backend.eduSphere.dto.request.ResourceRequestDto;
import com.example.backend.eduSphere.dto.response.ResourceResponseDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResourceService {
    List<ResourceResponseDto> getResourcesByLecturerId(String lecturerId);
    ResourceResponseDto uploadResource(String lecturerId, MultipartFile file, ResourceRequestDto metadata);
    ResourceResponseDto updateResource(String resourceId, ResourceRequestDto metadata);
    Resource downloadResource(String resourceId);
    void deleteResource(String resourceId);
}