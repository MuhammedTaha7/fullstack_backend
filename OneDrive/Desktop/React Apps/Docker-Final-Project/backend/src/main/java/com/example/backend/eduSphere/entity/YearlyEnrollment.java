package com.example.backend.eduSphere.entity;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class YearlyEnrollment {

    private int academicYear;
    private List<String> studentIds = new ArrayList<>();

    public YearlyEnrollment(int academicYear) {
        this.academicYear = academicYear;
    }
}