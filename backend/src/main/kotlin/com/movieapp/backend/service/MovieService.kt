package com.movieapp.backend.service

import com.movieapp.backend.model.Movie
import com.movieapp.backend.repository.MovieRepository
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.stereotype.Service

@Service
class MovieService(
    private val movieRepository: MovieRepository,
    private val mongoTemplate: MongoTemplate
) {

    fun createMovie(movie: Movie): Movie =
        movieRepository.save(movie)

    fun getMoviesByYear(year: Int): List<Movie> =
        movieRepository.findByWatchedYear(year)

    fun getMoviesByYearAndUser(year: Int, addedBy: String): List<Movie> =
        movieRepository.findByWatchedYearAndAddedBy(year, addedBy)

    fun getMovie(id: String): Movie =
        movieRepository.findById(id).orElseThrow {
            RuntimeException("Movie not found with id: $id")
        }

    fun updateMovie(id: String, updated: Movie): Movie {
        val existing = getMovie(id)
        return movieRepository.save(
            existing.copy(
                title = updated.title,
                watchedYear = updated.watchedYear,
                watchedAt = updated.watchedAt,
                coverUrl = updated.coverUrl,
                overview = updated.overview,
                source = updated.source
            )
        )
    }

    fun deleteMovie(id: String) =
        movieRepository.deleteById(id)

    fun getAllMovies(): List<Movie> {
        val db = mongoTemplate.db.name
        val collections = mongoTemplate.collectionNames
        println("Connected to database: $db")
        println("Available collections: $collections")
        val movies = movieRepository.findAll()
        println("Repository findAll returned: ${movies.size} movies")
        return movies
    }
}