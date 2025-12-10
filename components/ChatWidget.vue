<template>
  <Teleport to="body">
    <!-- Floating Chat Button -->
    <button
      v-if="!isOpen"
      @click="openChat"
      class="fixed bottom-6 right-6 z-50 bg-primary-600 dark:bg-primary-500 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-all hover:scale-110"
      aria-label="Open chat"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <!-- Unread indicator -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Chat Window -->
    <Transition name="chat">
      <div
        v-if="isOpen"
        class="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700"
      >
        <!-- Chat Header -->
        <div class="bg-primary-600 dark:bg-primary-700 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 class="font-semibold">Chat with us</h3>
          </div>
          <button
            @click="closeChat"
            class="text-white/80 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Loading state -->
          <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-8">
            Loading messages...
          </div>

          <!-- Empty state -->
          <div v-else-if="messages.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
            <p class="mb-2">Start a conversation!</p>
            <p class="text-sm">Send us a message and we'll get back to you.</p>
          </div>

          <!-- Messages list -->
          <div v-else class="space-y-4">
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'flex',
                message.sender === 'customer' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-[80%] rounded-lg px-4 py-2',
                  message.sender === 'customer'
                    ? 'bg-primary-600 dark:bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                ]"
              >
                <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
                <p
                  :class="[
                    'text-xs mt-1',
                    message.sender === 'customer'
                      ? 'text-primary-100'
                      : 'text-gray-500 dark:text-gray-400'
                  ]"
                >
                  {{ formatTime(message.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-4">
          <!-- Optional: Email input for anonymous users -->
          <div v-if="!hasEmail" class="mb-3">
            <input
              v-model="emailInput"
              type="email"
              placeholder="Email (optional - to receive replies)"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- Message input -->
          <div class="flex gap-2">
            <input
              v-model="messageInput"
              @keydown="handleKeydown"
              type="text"
              placeholder="Type your message..."
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              @click="sendMessage"
              :disabled="!messageInput.trim() || sending"
              class="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg v-if="!sending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  conversationId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['conversation-created'])

// State
const isOpen = ref(false)
const messages = ref([])
const messageInput = ref('')
const emailInput = ref('')
const sending = ref(false)
const loading = ref(false)
const unreadCount = ref(0)
const conversationId = ref(props.conversationId || null)
const messagesContainer = ref(null)

const hasEmail = computed(() => {
  // Check if we have email in conversation
  // Once conversation is created with email, it's stored in the conversation
  // We only show email input if no conversation exists yet
  return conversationId.value !== null
})

// Methods
const openChat = async () => {
  isOpen.value = true
  if (conversationId.value) {
    await loadMessages()
  }
}

const closeChat = () => {
  isOpen.value = false
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
  
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const loadMessages = async () => {
  if (!conversationId.value) return
  
  loading.value = true
  try {
    const response = await $fetch(`/api/chat/conversations/${conversationId.value}/messages`)
    if (response.success) {
      messages.value = response.messages
      
      // Mark admin messages as read when customer opens chat
      await markConversationAsRead('customer')
    }
  } catch (error) {
    console.error('Error loading messages:', error)
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    // Use requestIdleCallback to defer execution if possible, otherwise setTimeout
    if (window.requestIdleCallback) {
      requestIdleCallback(() => sendMessage(), { timeout: 100 })
    } else {
      setTimeout(() => sendMessage(), 0)
    }
  }
}

const sendMessage = async () => {
  const content = messageInput.value.trim()
  if (!content || sending.value) return

  // Clear input immediately for better UX
  messageInput.value = ''
  sending.value = true

  // Optimistically add message to UI (will be replaced with server response)
  const tempMessage = {
    id: `temp-${Date.now()}`,
    conversationId: conversationId.value,
    sender: 'customer',
    content: content,
    isRead: false,
    createdAt: new Date().toISOString()
  }
  messages.value.push(tempMessage)
  
  // Scroll immediately for better UX
  requestAnimationFrame(() => {
    scrollToBottom()
  })

  try {
    // If no conversation exists, create one first
    if (!conversationId.value) {
      const email = emailInput.value.trim()
      const convResponse = await $fetch('/api/chat/conversations', {
        method: 'POST',
        body: {
          email: email || undefined,
          name: undefined
        }
      })
      
      if (convResponse.success) {
        conversationId.value = convResponse.conversation.id
        localStorage.setItem('chatConversationId', conversationId.value)
        emit('conversation-created', convResponse.conversation)
        
        // Load messages for the new conversation (async, won't block)
        loadMessages()
      }
    }

    // Send message
    const msgResponse = await $fetch(`/api/chat/conversations/${conversationId.value}/messages`, {
      method: 'POST',
      body: {
        content: content,
        sender: 'customer'
      }
    })

    if (msgResponse.success) {
      // Replace temp message with real message
      const tempIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      if (tempIndex !== -1) {
        messages.value[tempIndex] = msgResponse.message
      }

      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('Error sending message:', error)
    // Remove temp message on error
    const tempIndex = messages.value.findIndex(m => m.id === tempMessage.id)
    if (tempIndex !== -1) {
      messages.value.splice(tempIndex, 1)
    }
    // Restore message content
    messageInput.value = content
    const errorMessage = error?.data?.message || error?.message || 'Failed to send message. Please try again.'
    alert(errorMessage)
  } finally {
    sending.value = false
  }
}

const markConversationAsRead = async (readBy) => {
  if (!conversationId.value) return
  
  try {
    await $fetch(`/api/chat/conversations/${conversationId.value}/read`, {
      method: 'PATCH',
      body: {
        readBy
      }
    })
    
    // Update local unread count
    if (readBy === 'customer') {
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('Error marking conversation as read:', error)
    // Don't show error to user - this is a background operation
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

let unreadCheckInterval = null

const checkForUnreadMessages = async () => {
  if (!conversationId.value) return
  
  try {
    const response = await $fetch(`/api/chat/conversations/${conversationId.value}`)
    if (response.success) {
      unreadCount.value = response.conversation.customerUnreadCount || 0
    }
  } catch (error) {
    console.error('Error checking unread messages:', error)
  }
}

onMounted(() => {
  // Check for existing conversation in localStorage
  const storedConversationId = localStorage.getItem('chatConversationId')
  if (storedConversationId) {
    conversationId.value = storedConversationId
    checkForUnreadMessages()
    
    // Check for unread messages periodically
    unreadCheckInterval = setInterval(() => {
      if (!isOpen.value) {
        checkForUnreadMessages()
      }
    }, 30000) // Check every 30 seconds
  }
})

onBeforeUnmount(() => {
  if (unreadCheckInterval) {
    clearInterval(unreadCheckInterval)
  }
})
</script>

<style scoped>
.chat-enter-active,
.chat-leave-active {
  transition: all 0.3s ease;
}

.chat-enter-from,
.chat-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>

