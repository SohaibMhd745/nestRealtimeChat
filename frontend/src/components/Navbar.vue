<script setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { store } from '../store';
  import socketService from '../services/socket';

  const router = useRouter();

  const isAuthenticated = computed(() => !!store.state.user.token);

  const logout = () => {
    store.logout();
    router.push('/login');
  };

  const updateColor = (event) => {
    const color = event.target.value;
    socketService.sendChangeColor(store.state.user.id, color);
  };
</script>

<template>
  <div class="navbar">
    <nav>
      <div class="nav-links">
        <p v-if="!isAuthenticated" @click="router.push('/login')">Login</p>
        <p v-if="!isAuthenticated" @click="router.push('/register')">Register</p>

        <div v-if="isAuthenticated" class="color-picker">
          <label for="color">Change color</label>
          <input
            type="color"
            id="color"
            :value="store.state.user.color || '#000000'"
            @change="updateColor"
          />
        </div>
      </div>

      <p v-if="isAuthenticated" @click="logout">Logout</p>
    </nav>
  </div>
</template>

<style>
  .navbar {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--gray);
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 36px;
    width: 100%;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  nav p {
    cursor: pointer;
  }

  .color-picker {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
