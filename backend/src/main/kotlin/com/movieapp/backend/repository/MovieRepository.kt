package com.movieapp.backend.repository

import com.movieapp.backend.model.Movie
import org.springframework.data.mongodb.repository.MongoRepository

interface MovieRepository : MongoRepository<Movie, String> {
    fun findByWatchedYear(watchedYear: Int): List<Movie>
    fun findByWatchedYearAndAddedBy(watchedYear: Int, addedBy: String): List<Movie>
}