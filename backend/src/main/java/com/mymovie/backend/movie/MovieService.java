package com.mymovie.backend.movie;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public Page<Movie> getMoviesByUserId(String userId, Pageable pageable) {
        return movieRepository.findByUserId(userId, pageable);
    }

    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Movie updateMovie(Long id, Movie updated) {
        Movie movie = movieRepository.findById(id).orElseThrow(() -> new MovieNotFoundException(id));
        movie.setTitle(updated.getTitle());
        movie.setRating(updated.getRating());
        movie.setMemo(updated.getMemo());
        movie.setWatchedDate(updated.getWatchedDate());
        movie.setDate(updated.getDate());
        movie.setPoster(updated.getPoster());
        movie.setGenres(updated.getGenres());
        return movieRepository.save(movie);
    }

    public void deleteMovie(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new MovieNotFoundException(id);
        }
        movieRepository.deleteById(id);
    }
}
