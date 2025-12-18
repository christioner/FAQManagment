package com.qa.system.controller;

import com.qa.system.common.Result;
import com.qa.system.dto.LoginRequest;
import com.qa.system.dto.LoginResponse;
import com.qa.system.entity.User;
import com.qa.system.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest request) {
        User user = userService.findByUsername(request.getUsername());
        
        if (user == null) {
            return Result.error("User not found");
        }
        
        if (!userService.validatePassword(user, request.getPassword())) {
            return Result.error("Invalid password");
        }
        
        LoginResponse response = new LoginResponse();
        response.setToken("mock-token-" + user.getId()); // Simple mock token
        response.setUsername(user.getUsername());
        response.setRole(user.getRole());
        
        return Result.success(response);
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody LoginRequest request) {
        User existing = userService.findByUsername(request.getUsername());
        if (existing != null) {
            return Result.error("Username already exists");
        }
        
        User user = userService.createUser(
            request.getUsername(),
            request.getPassword(),
            null,
            "USER"
        );
        
        return Result.success(user);
    }
}
