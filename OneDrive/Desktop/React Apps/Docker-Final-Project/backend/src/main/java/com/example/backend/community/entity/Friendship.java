package com.example.backend.community.entity;

import com.example.backend.eduSphere.entity.UserEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "friendships")
public class Friendship {

    @Id
    private String id;

    @DBRef
    private UserEntity user1;

    @DBRef
    private UserEntity user2;

    @CreatedDate
    private LocalDateTime createdAt;
}