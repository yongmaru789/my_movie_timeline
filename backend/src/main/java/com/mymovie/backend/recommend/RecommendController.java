package com.mymovie.backend.recommend;

import com.mymovie.backend.ApiResponse;
import com.mymovie.backend.movie.Movie;
import com.mymovie.backend.movie.MovieRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommend")
public class RecommendController {

    private final MovieRepository movieRepository;
    private final RecommendService recommendService;

    public RecommendController(MovieRepository movieRepository, RecommendService recommendService) {
        this.movieRepository = movieRepository;
        this.recommendService = recommendService;
    }

    @GetMapping(produces = "application/json;charset=UTF-8")
    public ApiResponse<String> recommend(@RequestParam String userId) {
        List<Movie> movies = movieRepository.findAllByUserId(userId);
        String result = recommendService.getRecommendation(movies);
        return ApiResponse.ok(result);
    }
}