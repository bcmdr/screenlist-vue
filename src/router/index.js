// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Search from "../components/Search.vue";

const routes = [{ path: "/", component: Search }];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
