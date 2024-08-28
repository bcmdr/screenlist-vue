<!-- src/components/TopNav.vue -->
<template>
  <nav class="top-nav bg-gray-950">
    <div class="clamp flex justify-between items-center gap-2 px-2 py-3">
      <div class="logo">
        <a href="/">ScreenList</a>
      </div>
      <div class="user-menu min-h-3">
        <transition name="fade">
        <div class="text-md fade-in" v-if="!user && !loading" @click="signInWithGoogle">
          Sign In
        </div>
      </transition>

      <transition name="fade">
        <div v-if="!loading && user" class="user-dropdown">
          <span class="text-md fade-in" @click="toggleMenu">{{ user.displayName.split(" ")[0] }}</span>
          <div v-if="menuOpen" class="dropdown-menu">
            <button @click="signOut">Logout</button>
          </div>
        </div>
      </transition>
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
    const loading = ref(true);

    // Watch for auth state changes
    onMounted(() => {
      auth.onAuthStateChanged((authUser) => {
        user.value = authUser;
        loading.value = false;
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
      loading,
    };
  },
};
</script>

<style scoped>
.top-nav {
  color: white;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 150ms ease-in;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
