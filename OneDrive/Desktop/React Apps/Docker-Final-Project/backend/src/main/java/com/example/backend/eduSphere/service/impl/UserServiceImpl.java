package com.example.backend.eduSphere.service.impl;

import com.example.backend.common.exceptions.BadRequestException;
import com.example.backend.common.security.JwtUtil;
import com.example.backend.eduSphere.dto.request.AdminCreateUserRequest;
import com.example.backend.eduSphere.dto.request.LoginRequest;
import com.example.backend.eduSphere.dto.request.RegisterRequest;
import com.example.backend.eduSphere.dto.response.LecturerProfileDto;
import com.example.backend.eduSphere.dto.response.LoginResponse;
import com.example.backend.eduSphere.dto.response.StudentProfileDto;
import com.example.backend.eduSphere.entity.UserEntity;
import com.example.backend.eduSphere.repository.UserRepository;
import com.example.backend.eduSphere.service.MailService;
import com.example.backend.eduSphere.service.UserService;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService;

    @Override
    public void registerUser(@NonNull RegisterRequest registerRequest) {
        if (registerRequest.getUsername() == null || registerRequest.getEmail() == null || registerRequest.getPassword() == null) {
            throw new BadRequestException("Username, email, and password are required.");
        }
        if (userRepository.findByEmailOrUsername(registerRequest.getEmail(), registerRequest.getUsername()).isPresent()) {
            throw new BadRequestException("User already exists");
        }

        String encryptedPassword = passwordEncoder.encode(registerRequest.getPassword());

        UserEntity user = new UserEntity();
        user.setEmail(registerRequest.getEmail());
        user.setUsername(registerRequest.getUsername());
        user.setPassword(encryptedPassword);
        user.setRole("USER"); // Default role

        userRepository.save(user);
    }

    @Override
    public LoginResponse authenticateUser(@NonNull LoginRequest loginRequest) {
        UserEntity user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getEmail(), user.getRole());
    }

    @Override
    public String getUserIdByEmail(@NonNull String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return user.getId();
    }

    @Override
    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public UserEntity getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<UserEntity> findUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    @Override
    public List<UserEntity> findUsersByIds(List<String> userIds) {
        return userRepository.findAllById(userIds);
    }

    @Override
    public UserEntity createAdminUser(AdminCreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("User with this email already exists.");
        }

        String username = request.getName()
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", "_");

        if (userRepository.findByUsername(username).isPresent()) {
            throw new BadRequestException("Username already exists. Please choose a different name.");
        }

        String randomPassword = UUID.randomUUID().toString().substring(0, 8);
        String encryptedPassword = passwordEncoder.encode(randomPassword);

        UserEntity newUser = new UserEntity();
        newUser.setName(request.getName());
        newUser.setEmail(request.getEmail());
        newUser.setUsername(username);
        newUser.setPassword(encryptedPassword);
        newUser.setRole(request.getRole());
        newUser.setPhoneNumber(request.getPhoneNumber());

        if ("1300".equals(request.getRole())) {
            newUser.setDepartment(request.getDepartment());
            newUser.setAcademicYear(request.getAcademicYear());
            newUser.setStatus(request.getStatus());
        } else if ("1200".equals(request.getRole())) {
            newUser.setDepartment(request.getDepartment());
            newUser.setSpecialization(request.getSpecialization());
            newUser.setEmploymentType(request.getEmploymentType());
            newUser.setExperience(request.getExperience());
            newUser.setRating(request.getRating());
        }

        UserEntity createdUser = userRepository.save(newUser);

        String subject = "Your New EduSphere Account";
        String body = String.format(
                "Hello %s,\n\nAn administrator has created an account for you on EduSphere.\nYour temporary login details are:\nUsername: %s\nPassword: %s\n\nPlease log in and change your password immediately.\n\nThank you,\nThe EduSphere Team",
                newUser.getName(),
                newUser.getEmail(),
                randomPassword
        );
        mailService.sendMail(newUser.getEmail(), subject, body);

        return createdUser;
    }

    @Override
    public UserEntity updateUser(String userId, AdminCreateUserRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found with ID: " + userId));

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setPhoneNumber(request.getPhoneNumber());

        if ("1300".equals(request.getRole())) {
            user.setDepartment(request.getDepartment());
            user.setAcademicYear(request.getAcademicYear());
            user.setStatus(request.getStatus());
        } else if ("1200".equals(request.getRole())) {
            user.setDepartment(request.getDepartment());
            user.setSpecialization(request.getSpecialization());
            user.setEmploymentType(request.getEmploymentType());
            user.setExperience(request.getExperience());
            user.setRating(request.getRating());
        }

        return userRepository.save(user);
    }

    public UserEntity getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }
}