package com.mymovie.backend.user;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> body) {
        userService.register(body.get("username"), body.get("password"));
        return Map.of("message", "회원가입 성공");
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String token = userService.login(username, body.get("password"));
        User user = userService.findByUsername(username);
        return Map.of(
                "token", token,
                "userId", user.getId(),
                "username", user.getUsername()
        );
    }
}
