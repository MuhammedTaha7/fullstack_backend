package com.example.backend.eduSphere.service.impl;

import com.example.backend.eduSphere.entity.Department;
import com.example.backend.eduSphere.repository.DepartmentRepository;
import com.example.backend.eduSphere.service.DepartmentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
class DepartmentServiceImpl implements DepartmentService {
    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public List<Department> findAll() {
        return departmentRepository.findAll();
    }

    @Override
    public Department save(Department department) {
        return departmentRepository.save(department);
    }
}