package com.mymovie.backend.user;

import com.mymovie.backend.ApiResponse;
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
    public ApiResponse<String> register(@RequestBody Map<String, String> body) {
        userService.register(body.get("username"), body.get("password"));
        return ApiResponse.ok("회원가입 성공");
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String token = userService.login(username, body.get("password"));
        User user = userService.findByUsername(username);
        return ApiResponse.ok(Map.of(
                "token", token,
                "userId", user.getId(),
                "username", user.getUsername()
        ));
    }
}
