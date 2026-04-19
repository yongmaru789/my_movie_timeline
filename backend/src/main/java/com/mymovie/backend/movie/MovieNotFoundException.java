package com.mymovie.backend.movie;

public class MovieNotFoundException extends RuntimeException {
    public MovieNotFoundException(Long id) {
        super("영화를 찾을 수 없습니다. id: " + id);
    }
}
