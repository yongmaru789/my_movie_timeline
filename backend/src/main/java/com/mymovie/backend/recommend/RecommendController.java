package com.mymovie.backend.recommend;

import com.mymovie.backend.ApiResponse;
import com.mymovie.backend.movie.Movie;
import com.mymovie.backend.movie.MovieRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommend")
public class RecommendController {

    private final MovieRepository movieRepository;
    private final RecommendService recommendService;

    @Value("${recommend.enabled:true}")
    private boolean recommendEnabled;

    public RecommendController(MovieRepository movieRepository, RecommendService recommendService) {
        this.movieRepository = movieRepository;
        this.recommendService = recommendService;
    }

    @GetMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<ApiResponse<String>> recommend(@RequestParam String userId) {
        if (!recommendEnabled) {
            return ResponseEntity.ok(ApiResponse.ok("추천 기능이 현재 비활성화되어 있습니다."));
        }
        List<Movie> movies = movieRepository.findAllByUserId(userId);
        String result = recommendService.getRecommendation(movies);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}