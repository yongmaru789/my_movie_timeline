package com.mymovie.backend.movie;

import com.mymovie.backend.ApiResponse;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    public ApiResponse<List<Movie>> getMoviesByUserId(@RequestParam String userId) {
        return ApiResponse.ok(movieService.getMoviesByUserId(userId));
    }

    @PostMapping
    public ApiResponse<Movie> addMovie(@RequestBody Movie movie) {
        return ApiResponse.ok(movieService.addMovie(movie));
    }

    @PutMapping("/{id}")
    public ApiResponse<Movie> updateMovie(@PathVariable Long id, @RequestBody Movie movie) {
        return ApiResponse.ok(movieService.updateMovie(id, movie));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ApiResponse.ok(null);
    }
}
