<script setup>
  import Sidebar from './components/Sidebar.vue';
  import Navbar from './components/Navbar.vue';
</script>

<template>
  <div class="app">
    <Sidebar />
    <Navbar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
  :root {
    --primary-light: #e5f4ff;
    --primary: #007be5;
    --light-gray: #f8f8f8;
    --gray: #dddddd;
    --dark-gray: #666666;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter';
    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.011em;
    overflow: hidden;
  }

  .app {
    display: grid;
    grid-template-columns: 240px 1fr;
    grid-template-rows: 42px 1fr;
    height: 100vh;
    width: 100vw;
  }

  main {
    grid-column: 2;
    grid-row: 2;
    overflow: hidden;
  }

  .auth-form {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .auth-form form {
    min-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  input {
    font-size: 13px;
    padding: 8px 8px;
    border: none;
    border-radius: 4px;
    background-color: var(--light-gray);
  }

  input:focus {
    outline: none;
  }

  button {
    font-size: 12px;
    padding: 8px 8px;
    border: none;
    border-radius: 4px;
    background-color: var(--primary);
    color: white;
    cursor: pointer;
  }
</style>
