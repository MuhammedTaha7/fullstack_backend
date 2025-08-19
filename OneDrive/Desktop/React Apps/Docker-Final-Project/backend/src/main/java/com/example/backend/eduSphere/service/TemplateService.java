package com.example.backend.eduSphere.service;

import com.example.backend.eduSphere.dto.request.TemplateRequest;
import com.example.backend.eduSphere.dto.request.UseTemplateRequest;
import com.example.backend.eduSphere.dto.response.TemplateResponse;

import java.util.List;

public interface TemplateService {

    List<TemplateResponse> getAllTemplates();

    TemplateResponse getTemplateById(String templateId);

    // 🆕 UPDATED: Added creatorId
    TemplateResponse createTemplate(TemplateRequest templateRequest, String creatorId);

    // 🆕 UPDATED: Added updaterId
    TemplateResponse updateTemplate(String templateId, TemplateRequest templateRequest, String updaterId);

    // 🆕 UPDATED: Added deleterId
    void deleteTemplate(String templateId, String deleterId);

    // 🆕 UPDATED: Added creatorId and creatorName
    void useTemplate(String templateId, UseTemplateRequest useTemplateRequest, String creatorId, String creatorName);
}