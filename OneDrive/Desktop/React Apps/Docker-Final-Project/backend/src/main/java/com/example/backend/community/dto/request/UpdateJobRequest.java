package com.example.backend.community.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class UpdateJobRequest {
    private String title;
    private String company;
    private String location;
    private String description;
    private String type;
    private List<String> tags;
    private String salary;
    private String remote;
    private String experience;
    private String deadline;
    private List<String> benefits;
    private String requirements;
    private String status;
}