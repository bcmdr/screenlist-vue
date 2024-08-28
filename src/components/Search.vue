<!-- src/components/Search.vue -->
<template>
  <div class="search">
    <label class="hidden" for="movie-search">Search for Movies</label>
    <input
      id="movie-search"
      type="text"
      v-model="query"
      placeholder="Enter movie name..."
      @input="handleSearch"
      class="border border-grey-100 shadow rounded-full px-3 py-2 mb-4 w-full"
    />

    <div class="movies flex gap-2" v-if="movies.length">
      <div v-for="movie in movies" :key="movie.id" class="movie">
        <img
          v-if="movie.poster_path"
          :src="getPosterUrl(movie.poster_path)"
          :alt="movie.title"
          class="rounded-xl"
        />
        <div v-else class="poster-placeholder bg-gray-950 rounded-xl"></div>
        <h3>{{ movie.title }}</h3>
        <p>
          {{ movie.release_date ? movie.release_date.split("-")[0] : "N/A" }}
        </p>
      </div>
    </div>

    <div v-else>
      <p>No movies found. Try searching for something else!</p>
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
  },
};
</script>

<style scoped>
.search {
  text-align: center;
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
  width: 150px;
  margin: 10px;
  text-align: center;
}

.movie img {
  width: 100%;
  height: 220px;
}

.poster-placeholder {
  height: 220px;
}

.movie h3 {
  font-size: 16px;
  margin: 10px 0 5px;
}

.movie p {
  font-size: 14px;
  color: #666;
}
</style>
