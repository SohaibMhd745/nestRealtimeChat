<script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const username = ref('');
  const password = ref('');
  const error = ref('');

  const register = async () => {
    try {
      await axios.post('http://localhost:3000/auth/register', {
        username: username.value,
        password: password.value,
      });

      router.push('/login');
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        error.value = e.response.data.message;
      } else {
        error.value = 'Registration failed';
      }
      console.error(e);
    }
  };
</script>

<template>
  <div class="auth-form">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <p v-if="error" style="color: red">{{ error }}.</p>
  </div>
</template>
