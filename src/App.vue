<!-- src/App.vue -->
<template>
  <TopNav />
  <div class="clamp bg-gray-50">
    <router-view />
  </div>
  <Footer />
</template>

<script>
import TopNav from "./components/TopNav.vue";
import Footer from "./components/Footer.vue";

export default {
  name: "App",
  components: {
    TopNav,
    Footer,
  },
};
</script>

<style>
.clamp {
  max-width: var(--max-width);
  width: 100%;
  /* background: red; */
  margin: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>
