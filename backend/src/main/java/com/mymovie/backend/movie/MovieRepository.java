package com.mymovie.backend.movie;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    Page<Movie> findByUserId(String userId, Pageable pageable);
    List<Movie> findAllByUserId(String userId);
}
