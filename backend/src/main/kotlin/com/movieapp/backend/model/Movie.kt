package com.movieapp.backend.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "movies")
data class Movie(
    @Id val id: String? = null,
    val title: String,
    val watchedYear: Int,
    val watchedAt: String? = null,
    val coverUrl: String? = null,
    val overview: String? = null,
    val tmdbId: String? = null,
    val source: String? = null,
    val addedBy: String? = null
)