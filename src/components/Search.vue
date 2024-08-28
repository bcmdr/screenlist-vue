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

    <div class="movies grid gap-4" v-if="filteredMovies.length">
      <div
        v-for="movie in filteredMovies"
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
import debounce from "lodash.debounce";

export default {
  data() {
    return {
      query: "",
      movies: [],
    };
  },
  created() {
    // Create a debounced version of the search function
    this.debouncedSearch = debounce(this.executeSearch, 300); // 1-second debounce delay
  },
  computed: {
    filteredMovies() {
      // Filter out movies without a release year
      return this.movies.filter((movie) => movie.release_date);
    },
  },
  methods: {
    handleSearch() {
      if (this.query.length < 1) {
        return;
      } else if (this.query.length === 1) {
        // If query length is 1, search instantly
        this.executeSearch();
      } else {
        // Debounce the search function for longer queries
        this.debouncedSearch();
      }
    },
    executeSearch() {
      if (this.query.trim() === "") {
        this.movies = [];
        return;
      }

      // Your search logic here
      tmdb
        .get("/search/movie", {
          params: {
            query: this.query,
            include_adult: false, // Exclude adult content
          },
        })
        .then((response) => {
          this.movies = response.data.results.sort(
            (a, b) => b.popularity - a.popularity
          );
        })
        .catch((error) => {
          console.error("Error fetching movies:", error);
        });
    },
    getPosterUrl(path) {
      return `https://image.tmdb.org/t/p/w342${path}`;
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
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  flex-wrap: wrap;
  justify-items: center;
}

.movie {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  color: white;
  max-width: 240px;
}

.movie img {
  width: 100%;
  height: 100%;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
}

.movie:hover .movie-info {
  visibility: visible;
}

.movie-info {
  visibility: hidden;
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
}

.no-poster * {
  visibility: visible;
}
</style>
