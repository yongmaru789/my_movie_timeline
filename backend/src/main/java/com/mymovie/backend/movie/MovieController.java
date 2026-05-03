package com.mymovie.backend.movie;

import com.mymovie.backend.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    public ApiResponse<Page<Movie>> getMoviesByUserId(
            @RequestParam String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = direction.equals("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ApiResponse.ok(movieService.getMoviesByUserId(userId, pageable));
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
