package com.movieapp.backend.web

import com.movieapp.backend.model.Movie
import com.movieapp.backend.service.MovieService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/movies")
class MovieController(private val movieService: MovieService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @Valid @RequestBody request: MovieRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): Movie {
        val addedBy = jwt.subject
        return movieService.createMovie(
            Movie(
                title = request.title,
                watchedYear = request.watchedYear,
                watchedAt = request.watchedAt,
                source = request.source,
                addedBy = addedBy
            )
        )
    }

    @GetMapping
    fun getByYear(
        @RequestParam year: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): List<Movie> = movieService.getMoviesByYear(year)

    @GetMapping("/{id}")
    fun get(@PathVariable id: String): Movie =
        movieService.getMovie(id)

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: String,
        @Valid @RequestBody request: MovieRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): Movie = movieService.updateMovie(id, Movie(
        title = request.title,
        watchedYear = request.watchedYear,
        watchedAt = request.watchedAt,
        source = request.source,
        addedBy = jwt.subject
    ))

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: String) =
        movieService.deleteMovie(id)
}

data class MovieRequest(
    val title: String,
    val watchedYear: Int,
    val watchedAt: String? = null,
    val source: String? = null
)