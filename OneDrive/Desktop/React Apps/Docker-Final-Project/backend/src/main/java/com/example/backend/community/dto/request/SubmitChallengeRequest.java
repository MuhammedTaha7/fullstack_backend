package com.example.backend.community.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitChallengeRequest {
    private String submissionLink;
    private String notes;
}