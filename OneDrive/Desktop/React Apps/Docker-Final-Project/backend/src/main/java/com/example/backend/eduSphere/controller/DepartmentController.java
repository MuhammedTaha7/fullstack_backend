package com.example.backend.eduSphere.controller;

import com.example.backend.eduSphere.entity.Department;
import com.example.backend.eduSphere.service.DepartmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
class DepartmentController {
    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentService.findAll();
    }

    @PostMapping
    public Department createDepartment(@RequestBody Department department) {
        return departmentService.save(department);
    }
}
