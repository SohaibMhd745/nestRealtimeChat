<script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import { store } from '../store';

  const router = useRouter();
  const username = ref('');
  const password = ref('');
  const error = ref('');

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:3000/auth/login', {
        username: username.value,
        password: password.value,
      });
      store.setUser({ access_token: res.data.access_token });
      router.push('/');
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        error.value = e.response.data.message;
      } else {
        error.value = 'Login failed';
      }
      console.error(e);
    }
  };
</script>

<template>
  <div class="auth-form">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p v-if="error" style="color: red">{{ error }}.</p>
  </div>
</template>
