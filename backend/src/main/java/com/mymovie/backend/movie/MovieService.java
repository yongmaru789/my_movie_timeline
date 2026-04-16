package com.mymovie.backend.movie;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Movie updateMovie(Long id, Movie updated) {
        Movie movie = movieRepository.findById(id).orElseThrow();
        movie.setTitle(updated.getTitle());
        movie.setRating(updated.getRating());
        movie.setMemo(updated.getMemo());
        movie.setWatchedDate(updated.getWatchedDate());
        return movieRepository.save(movie);
    }

    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }
}
