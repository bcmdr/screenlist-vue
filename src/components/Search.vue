<!-- src/components/Search.vue -->
<template>
  <div class="search">
    <label class="hidden" for="movie-search">Search for Movies</label>
    <input
      id="movie-search"
      type="text"
      v-model="query"
      placeholder="Search movie titles..."
      autocomplete="off"
      @input="handleSearch"
      class="border border-grey-100 shadow rounded-full px-3 py-2 mb-4 w-full"
    />

    <div class="movies flex gap-2" v-if="movies.length">
      <div
        v-for="movie in movies"
        :key="movie.id"
        class="movie"
        :class="{ 'no-poster': !movie.poster_path }"
      >
        <img
          v-if="movie.poster_path"
          :src="getPosterUrl(movie.poster_path)"
          :alt="movie.title"
          class="rounded-xl"
        />
        <div v-else class="poster-placeholder bg-gray-950 rounded-xl"></div>
        <div class="movie-info bg-gray-950/90 px-3 py-4 rounded-t-xl">
          <h3 class="font-bold leading-tight mb-2 text-lg">
            {{ trimmedTitle(movie.title) }}
          </h3>
          <p class="text-xs">
            {{ movie.release_date ? movie.release_date.split("-")[0] : "N/A" }}
          </p>
        </div>
        <div class="movie-controls"></div>
      </div>
    </div>

    <div v-else>
      <p v-if="query" class="text-center">
        No results found. Try searching for another title.
      </p>
    </div>
  </div>
</template>

<script>
import tmdb from "../tmdb"; // Import the TMDB API configuration

export default {
  data() {
    return {
      query: "",
      movies: [],
    };
  },
  methods: {
    handleSearch() {
      if (this.query.trim() === "") {
        this.movies = [];
        return;
      }

      tmdb
        .get("/search/movie", {
          params: {
            query: this.query,
            include_adult: false, // Exclude adult content
          },
        })
        .then((response) => {
          this.movies = response.data.results;
        })
        .catch((error) => {
          console.error("Error fetching movies:", error);
        });
    },
    getPosterUrl(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    trimmedTitle(title) {
      const maxLength = 30; // Set your maximum length here
      return title.length > maxLength
        ? title.substring(0, maxLength) + "..."
        : title;
    },
  },
};
</script>

<style scoped>
.search {
  padding: 20px 0px;
}

.container {
  justify-content: center;
}

.movies {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.movie {
  position: relative;
  width: 150px;
  margin: 10px;
  color: white;
}

.movie img {
  width: 100%;
  height: 220px;
}

.poster-placeholder {
  height: 220px;
}

.movie:hover .movie-info {
  opacity: 1;
}

.movie-info {
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
  opacity: 0;
}

.no-poster * {
  opacity: 1 !important;
}

.movie-controls {
}
</style>
