<!-- src/components/TopNav.vue -->
<template>
  <nav class="top-nav">
    <div class="container">
      <div class="logo">
        <a href="/">ScreenList</a>
      </div>
      <div class="user-menu">
        <button v-if="!user" @click="signInWithGoogle">
          Sign In with Google
        </button>
        <div v-else class="user-dropdown">
          <span @click="toggleMenu">{{ user.displayName }}</span>
          <div v-if="menuOpen" class="dropdown-menu">
            <button @click="signOut">Logout</button>
          </div>
        </div>
      </div>
    </div class="container">
  </nav>
</template>

<script>
import { ref, onMounted } from "vue";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";

export default {
  setup() {
    const user = ref(null);
    const menuOpen = ref(false);

    // Watch for auth state changes
    onMounted(() => {
      auth.onAuthStateChanged((authUser) => {
        user.value = authUser;
      });
    });

    const signInWithGoogle = async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error signing in with Google:", error);
      }
    };

    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value;
    };

    const signOut = async () => {
      try {
        await firebaseSignOut(auth);
        user.value = null;
        menuOpen.value = false;
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };

    return {
      user,
      menuOpen,
      signInWithGoogle,
      toggleMenu,
      signOut,
    };
  },
};
</script>

<style scoped>
.top-nav {
  padding: 0.5rem 1.5rem;
  background-color: #333;
  color: white;
  margin: auto;
}

.container {
    display: flex;
    justify-content: space-between;
}

.logo a {
  margin: 0;
  color: white;
  text-decoration: none;
  font-weight: bold;
}

.user-menu {
  position: relative;
}

.user-dropdown {
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  color: black;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
</style>
