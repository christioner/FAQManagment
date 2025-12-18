package com.qa.system.dto;

import lombok.Data;

@Data
public class QaRequest {
    private String question;
    private String answer;
    private Long categoryId;
}
