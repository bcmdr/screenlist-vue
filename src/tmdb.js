// src/tmdb.js
import axios from "axios";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const baseURL = "https://api.themoviedb.org/3";

const tmdb = axios.create({
  baseURL,
  params: {
    api_key: apiKey,
  },
});

export default tmdb;
