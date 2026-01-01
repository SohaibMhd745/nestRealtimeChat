<script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { store } from '../store';

  const newRoomName = ref('');
  const isPrivate = ref(false);

  const username = computed(() => store.state.user.username);
  const isAuthenticated = computed(() => !!store.state.user.token);

  const createRoom = async () => {
    await store.createRoom(newRoomName.value, isPrivate.value);
    newRoomName.value = '';
    isPrivate.value = false;
  };

  const joinRoom = (roomId) => {
    store.joinRoom(roomId);
  };

  onMounted(() => {
    if (store.state.user.token) {
      store.fetchRooms();
    }
  });

  watch(
    () => store.state.user.token,
    (token) => {
      if (token) {
        store.fetchRooms();
      }
    }
  );
  const publicRooms = computed(() => store.state.rooms.filter((r) => !r.isPrivate));
  const privateRooms = computed(() => store.state.rooms.filter((r) => r.isPrivate));
</script>

<template>
  <div class="sidebar">
    <div class="user">
      <p v-if="isAuthenticated && username">{{ username }}</p>
      <p v-else>Guest user</p>
    </div>

    <div v-if="isAuthenticated" class="create-room">
      <input type="text" v-model="newRoomName" placeholder="New room" />
      <div class="private-toggle">
        <input type="checkbox" v-model="isPrivate" />
        <label>Private room</label>
      </div>
      <button @click="createRoom">Create room</button>
    </div>

    <div class="rooms">
      <div v-if="publicRooms.length > 0" class="rooms-section">
        <div class="section-header">Public rooms</div>
        <div
          v-for="room in publicRooms"
          :key="room.id"
          class="room"
          :class="{ 'room-active': store.state.currentRoomId === room.id }"
          @click="joinRoom(room.id)"
        >
          <span>#</span>
          <p>{{ room.name }}</p>
        </div>
      </div>

      <div v-if="privateRooms.length > 0" class="rooms-section">
        <div class="section-header">Private rooms</div>
        <div
          v-for="room in privateRooms"
          :key="room.id"
          class="room"
          :class="{ 'room-active': store.state.currentRoomId === room.id }"
          @click="joinRoom(room.id)"
        >
          <span>#</span>
          <p>{{ room.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .sidebar {
    grid-row: 1 / -1;
    grid-column: 1;
    display: flex;
    flex-direction: column;
    padding: 0px 12px;
    gap: 8px;
    border-right: 1px solid var(--gray);
  }

  .user {
    height: 42px;
    display: flex;
    align-items: center;
  }

  .create-room {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .private-toggle {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .rooms {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 8px;
  }

  .rooms-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-header {
    font-size: 8px;
    color: var(--dark-gray);
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .section-header::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--dark-gray);
    opacity: 0.2;
  }

  .room {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out;
  }

  .room:hover {
    background-color: var(--light-gray);
  }

  .room-active {
    background-color: var(--primary-light);
  }

  .room span {
    opacity: 0.8;
    font-size: 12px;
  }
</style>
