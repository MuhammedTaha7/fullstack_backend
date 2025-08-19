package com.example.backend.eduSphere.controller;

import com.example.backend.eduSphere.dto.request.MessageReplyRequest;
import com.example.backend.eduSphere.dto.request.MessageRequest;
import com.example.backend.eduSphere.dto.response.MessageResponse;
import com.example.backend.eduSphere.entity.UserEntity;
import com.example.backend.eduSphere.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // --- Endpoints for all authenticated users (Student, Lecturer, Admin) ---

    @GetMapping("/received")
    public ResponseEntity<List<MessageResponse>> getReceivedMessages(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity currentUser = (UserEntity) userDetails;
        List<MessageResponse> messages = messageService.getReceivedMessages(currentUser.getId());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/sent")
    public ResponseEntity<List<MessageResponse>> getSentMessages(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity currentUser = (UserEntity) userDetails;
        List<MessageResponse> messages = messageService.getSentMessages(currentUser.getId());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageResponse> getMessageById(@PathVariable String id, @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity currentUser = (UserEntity) userDetails;
        MessageResponse message = messageService.getMessageById(id, currentUser.getId());
        return ResponseEntity.ok(message);
    }

    @PostMapping
    public ResponseEntity<MessageResponse> createMessage(@RequestBody MessageRequest messageRequest, @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity currentUser = (UserEntity) userDetails;
        MessageResponse createdMessage = messageService.createMessage(messageRequest, currentUser.getId(), currentUser.getName());
        return ResponseEntity.ok(createdMessage);
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<MessageResponse> replyToMessage(@PathVariable String id, @RequestBody MessageReplyRequest replyRequest, @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity currentUser = (UserEntity) userDetails;
        MessageResponse repliedMessage = messageService.replyToMessage(id, replyRequest, currentUser.getId());
        return ResponseEntity.ok(repliedMessage);
    }

    // --- Admin-only endpoint ---

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<MessageResponse>> getAllMessages() {
        List<MessageResponse> messages = messageService.getAllMessages();
        return ResponseEntity.ok(messages);
    }
}