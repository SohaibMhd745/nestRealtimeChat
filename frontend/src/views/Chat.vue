<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { store } from '../store';
  import socketService from '../services/socket';

  const router = useRouter();

  const userId = computed(() => store.state.user.id);
  const username = computed(() => store.state.user.username);
  const messages = computed(() => store.state.messages);
  const typingUsers = computed(() => store.state.typingUsers);
  const currentRoomId = computed(() => store.state.currentRoomId);
  const currentRoom = computed(() => store.state.rooms.find((r) => r.id === currentRoomId.value));

  const groupedMessages = computed(() => {
    if (!messages.value) return [];

    const groups = [];
    let lastGroup = null;

    for (const message of messages.value) {
      const senderName = message.sender ? message.sender.username : '???';
      const senderColor = message.sender ? message.sender.color : '#000000'; // Default to black if no color

      if (lastGroup && lastGroup.senderName === senderName) {
        lastGroup.messages.push(message);
      } else {
        lastGroup = {
          id: message.id,
          senderName,
          senderColor,
          sender: message.sender,
          sender: message.sender,
          createdAt: message.createdAt,
          messages: [message],
        };
        groups.push(lastGroup);
      }
    }
    return groups;
  });

  const messageInput = ref('');
  const textareaRef = ref(null);

  const inviteUsername = ref('');
  const showInviteInput = ref(false);

  const toggleInviteInput = (value) => {
    showInviteInput.value = value;
  };

  const resizeTextarea = () => {
    if (!textareaRef.value) return;
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  };

  const handleTyping = (isTyping) => {
    if (!currentRoomId.value) return;
    socketService.sendTyping(username.value, isTyping, currentRoomId.value);
  };

  let typingTimeout = null;
  const onInput = () => {
    resizeTextarea();
    handleTyping(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      handleTyping(false);
    }, 1000);
  };

  const sendMessage = () => {
    if (!messageInput.value.trim() || !currentRoomId.value) return;
    socketService.sendMessage(messageInput.value, userId.value, currentRoomId.value);
    messageInput.value = '';

    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }

    handleTyping(false);
  };

  const inviteUser = async () => {
    if (!inviteUsername.value.trim() || !currentRoomId.value) return;
    try {
      await store.addUserToRoom(currentRoomId.value, inviteUsername.value);
      inviteUsername.value = '';
      showInviteInput.value = false;
      alert('User added successfully.');
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 409) {
        alert('User is already in the room.');
      } else {
        alert('Failed to add user. Check username spelling.');
      }
    }
  };

  onMounted(() => {
    if (!store.state.user.token) {
      router.push('/login');
    }
  });
</script>

<template>
  <div v-if="currentRoomId" class="chat-container">
    <div class="chat-header">
      <div class="room-info">
        <span>#</span>
        <h4>{{ currentRoom?.name }}</h4>
        <span v-if="currentRoom?.isPrivate">(private)</span>
      </div>

      <div v-if="currentRoom?.isPrivate" class="room-actions">
        <button v-if="!showInviteInput" @click="toggleInviteInput(true)" class="icon-button">
          + Add user
        </button>
        <div v-else class="invite-input">
          <input v-model="inviteUsername" placeholder="Username" @keydown.enter="inviteUser" />
          <button @click="inviteUser">Add</button>
          <button @click="toggleInviteInput(false)" class="cancel-button">x</button>
        </div>
      </div>
    </div>

    <div class="messages-container">
      <div v-for="group in groupedMessages" :key="group.id" class="message-group">
        <div class="message-header">
          <span class="sender" :style="{ color: group.senderColor }">{{ group.senderName }}</span>
          <span class="timestamp">
            {{
              new Date(group.createdAt).toLocaleString([], {
                dateStyle: 'short',
                timeStyle: 'short',
              })
            }}
          </span>
        </div>
        <div class="group-content">
          <span v-for="message in group.messages" :key="message.id" class="content">{{
            message.content
          }}</span>
        </div>
      </div>
    </div>

    <div v-if="Object.keys(typingUsers).length > 0" class="typing-indicator">
      Users typing: {{ Object.keys(typingUsers).join(', ') }}
    </div>

    <div class="input-container">
      <textarea
        ref="textareaRef"
        v-model="messageInput"
        @keydown.enter.exact.prevent="sendMessage"
        @input="onInput"
        placeholder="Type your message here..."
        rows="1"
      ></textarea>

      <div class="send-button-container">
        <button @click="sendMessage">Send message</button>
      </div>
    </div>
  </div>

  <div v-else class="no-room-selected">
    <p>Join or create a room to start chatting.</p>
  </div>
</template>

<style scoped>
  .no-room-selected {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .chat-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .messages-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin: 0px 32px 20px 32px;
    gap: 16px;
    overflow-y: auto;
  }

  .message-group {
    display: flex;
    flex-direction: column;
  }

  .group-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sender {
    font-weight: 600;
  }

  .timestamp {
    font-size: 10px;
    font-weight: 300;
    letter-spacing: 0.01em;
  }

  .typing-indicator {
    margin: 0px 32px 12px;
    font-size: 12px;
    font-weight: 400;
    color: var(--dark-gray);
  }

  .input-container {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    margin: 0 32px 20px;
    border-radius: 12px;
    border: 1px solid var(--gray);
  }

  .input-container textarea {
    flex: 1;
    background: none;
    resize: none;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: inherit;
    height: auto;
    max-height: 120px;
    overflow-y: auto;
  }

  .send-button-container {
    height: 100%;
    display: flex;
    align-items: flex-end;
  }

  .send-button-container button {
    font-size: 11px;
    padding: 6px 12px;
    border-radius: 999px;
  }

  .chat-header {
    height: 42px;
    border-bottom: 1px solid var(--gray);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    margin-bottom: 20px;
  }

  .room-info {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .room-actions {
    display: flex;
    align-items: center;
  }

  .invite-input {
    display: flex;
    gap: 4px;
  }

  .invite-input input {
    padding: 4px 8px;
    border: 1px solid var(--gray);
    border-radius: 4px;
  }

  .cancel-button {
    background-color: #666;
  }
</style>
