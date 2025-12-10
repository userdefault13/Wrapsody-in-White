<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
            <p class="text-gray-600 dark:text-gray-400">Manage customer conversations and respond to inquiries</p>
          </div>
          <div class="flex items-center gap-4">
            <DarkModeToggle />
            <button
              @click="refreshConversations"
              :disabled="loading"
              class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg 
                :class="['w-5 h-5 transition-transform', loading ? 'animate-spin' : '']"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Refresh
              </span>
            </button>
            <NuxtLink to="/admin" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Back to Dashboard
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Conversations"
          :value="conversations.length"
          icon="💬"
          color="blue"
        />
        <StatCard
          title="Unread Messages"
          :value="totalUnreadCount"
          icon="🔔"
          color="red"
        />
        <StatCard
          title="Active Conversations"
          :value="activeConversationsCount"
          icon="✅"
          color="green"
        />
        <StatCard
          title="Today's Messages"
          :value="todaysMessagesCount"
          icon="📅"
          color="purple"
        />
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Conversations List -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Conversations</h2>
              <div class="flex gap-2">
                <button
                  @click="statusFilter = statusFilter === 'active' ? '' : 'active'"
                  :class="[
                    'px-3 py-1 text-xs rounded-lg transition-colors',
                    statusFilter === 'active'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  ]"
                >
                  Active
                </button>
                <button
                  @click="statusFilter = statusFilter === 'closed' ? '' : 'closed'"
                  :class="[
                    'px-3 py-1 text-xs rounded-lg transition-colors',
                    statusFilter === 'closed'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  ]"
                >
                  Closed
                </button>
              </div>
            </div>

            <!-- Search -->
            <div class="mb-4">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by email or name..."
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <!-- Conversations -->
            <div v-if="loading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-2"></div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Loading conversations...</p>
            </div>
            <div v-else-if="filteredConversations.length === 0" class="text-center py-8">
              <p class="text-gray-500 dark:text-gray-400">No conversations found</p>
            </div>
            <div v-else class="space-y-2 max-h-[600px] overflow-y-auto">
              <button
                v-for="conv in filteredConversations"
                :key="conv.id"
                @click="selectConversation(conv)"
                :class="[
                  'w-full text-left p-4 rounded-lg border transition-all',
                  selectedConversation?.id === conv.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-400'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <p class="font-semibold text-gray-900 dark:text-white truncate">
                        {{ conv.email || conv.name || 'Anonymous' }}
                      </p>
                      <span
                        v-if="conv.unreadCount > 0"
                        class="flex-shrink-0 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full"
                      >
                        {{ conv.unreadCount }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ conv.lastMessagePreview || 'No messages yet' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatRelativeTime(conv.lastMessageAt) }}
                  </span>
                  <span
                    :class="[
                      'px-2 py-0.5 text-xs rounded-full',
                      conv.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    ]"
                  >
                    {{ conv.status }}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Messages View -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col" style="height: 700px;">
            <div v-if="!selectedConversation" class="flex-1 flex items-center justify-center p-8">
              <div class="text-center">
                <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400 text-lg">Select a conversation to view messages</p>
              </div>
            </div>

            <div v-else class="flex flex-col h-full">
              <!-- Conversation Header -->
              <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ selectedConversation.email || selectedConversation.name || 'Anonymous' }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Conversation ID: {{ selectedConversation.id }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="closeConversation"
                      class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {{ selectedConversation.status === 'active' ? 'Close' : 'Reopen' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Messages Area -->
              <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                <div v-if="loadingMessages" class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-2"></div>
                  <p class="text-gray-500 dark:text-gray-400 text-sm">Loading messages...</p>
                </div>
                <div v-else-if="messages.length === 0" class="text-center py-8">
                  <p class="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                </div>
                <div v-else>
                  <div
                    v-for="message in messages"
                    :key="message.id"
                    :class="[
                      'flex',
                      message.sender === 'admin' ? 'justify-end' : 'justify-start'
                    ]"
                  >
                    <div
                      :class="[
                        'max-w-[70%] rounded-lg p-3',
                        message.sender === 'admin'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                      ]"
                    >
                      <p class="text-sm whitespace-pre-wrap break-words">{{ message.content }}</p>
                      <div class="flex items-center justify-between mt-2">
                        <span
                          :class="[
                            'text-xs',
                            message.sender === 'admin'
                              ? 'text-primary-100'
                              : 'text-gray-500 dark:text-gray-400'
                          ]"
                        >
                          {{ formatTime(message.createdAt) }}
                        </span>
                        <span
                          v-if="message.sender === 'customer' && message.isRead"
                          :class="[
                            'text-xs ml-2',
                            message.sender === 'admin'
                              ? 'text-primary-100'
                              : 'text-gray-500 dark:text-gray-400'
                          ]"
                        >
                          ✓ Read
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Message Input -->
              <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex gap-2">
                  <textarea
                    v-model="newMessage"
                    @keydown="handleKeydown"
                    placeholder="Type your message..."
                    rows="3"
                    class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  ></textarea>
                  <button
                    @click="sendMessage"
                    :disabled="!newMessage.trim() || sending"
                    class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    {{ sending ? 'Sending...' : 'Send' }}
                  </button>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useAuth } from '~/composables/useAuth'
import StatCard from '~/components/StatCard.vue'
import DarkModeToggle from '~/components/DarkModeToggle.vue'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

const { walletAddress } = useAuth()

const loading = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)
const conversations = ref([])
const selectedConversation = ref(null)
const messages = ref([])
const newMessage = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const messagesContainer = ref(null)

// Computed
const totalUnreadCount = computed(() => {
  return conversations.value.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
})

const activeConversationsCount = computed(() => {
  return conversations.value.filter(conv => conv.status === 'active').length
})

const todaysMessagesCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return conversations.value.filter(conv => {
    const lastMessageDate = conv.lastMessageAt ? new Date(conv.lastMessageAt).toISOString().split('T')[0] : ''
    return lastMessageDate === today
  }).length
})

const filteredConversations = computed(() => {
  let filtered = conversations.value

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(conv => conv.status === statusFilter.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(conv => {
      const email = (conv.email || '').toLowerCase()
      const name = (conv.name || '').toLowerCase()
      return email.includes(query) || name.includes(query)
    })
  }

  return filtered
})

// Methods
const fetchConversations = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/chat/conversations', {
      query: {
        status: statusFilter.value || undefined
      }
    })

    if (response.success) {
      conversations.value = response.conversations || []
    }
  } catch (error) {
    console.error('Error fetching conversations:', error)
    alert('Failed to load conversations. Please try again.')
  } finally {
    loading.value = false
  }
}

const selectConversation = async (conv) => {
  selectedConversation.value = conv
  await loadMessages()

  // Mark messages as read
  if (conv.unreadCount > 0) {
    await markConversationAsRead('admin')
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

const loadMessages = async () => {
  if (!selectedConversation.value) return

  loadingMessages.value = true
  try {
    const response = await $fetch(`/api/chat/conversations/${selectedConversation.value.id}/messages`)

    if (response.success) {
      messages.value = response.messages || []
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('Error loading messages:', error)
    alert('Failed to load messages. Please try again.')
  } finally {
    loadingMessages.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value || sending.value) return

  // Get message content and clear input immediately for better UX
  const messageContent = newMessage.value.trim()
  newMessage.value = ''
  sending.value = true

  // Optimistically add message to UI (will be replaced with server response)
  const tempMessage = {
    id: `temp-${Date.now()}`,
    conversationId: selectedConversation.value.id,
    sender: 'admin',
    content: messageContent,
    isRead: false,
    createdAt: new Date().toISOString()
  }
  messages.value.push(tempMessage)
  
  // Scroll immediately for better UX
  requestAnimationFrame(() => {
    scrollToBottom()
  })

  try {
    const response = await $fetch(`/api/chat/conversations/${selectedConversation.value.id}/messages`, {
      method: 'POST',
      body: {
        content: messageContent,
        sender: 'admin'
      }
    })

    if (response.success) {
      // Replace temp message with real message
      const tempIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      if (tempIndex !== -1) {
        messages.value[tempIndex] = response.message
      }
      
      // Defer non-critical updates to avoid blocking UI
      setTimeout(() => {
        const convIndex = conversations.value.findIndex(c => c.id === selectedConversation.value.id)
        if (convIndex !== -1) {
          conversations.value[convIndex] = {
            ...conversations.value[convIndex],
            lastMessageAt: response.message.createdAt,
            lastMessagePreview: response.message.content.substring(0, 100)
          }
          // Sort conversations by last message time (deferred)
          conversations.value.sort((a, b) => {
            return new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
          })
        }
      }, 0)

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
    newMessage.value = messageContent
    alert(error?.data?.message || 'Failed to send message. Please try again.')
  } finally {
    sending.value = false
  }
}

const markConversationAsRead = async (readBy) => {
  if (!selectedConversation.value) return

  try {
    await $fetch(`/api/chat/conversations/${selectedConversation.value.id}/read`, {
      method: 'PATCH',
      body: { readBy }
    })

    // Update local state
    const convIndex = conversations.value.findIndex(c => c.id === selectedConversation.value.id)
    if (convIndex !== -1) {
      conversations.value[convIndex].unreadCount = 0
    }
    selectedConversation.value.unreadCount = 0
  } catch (error) {
    console.error('Error marking conversation as read:', error)
  }
}

const closeConversation = async () => {
  if (!selectedConversation.value) return

  const newStatus = selectedConversation.value.status === 'active' ? 'closed' : 'active'
  
  try {
    const response = await $fetch(`/api/chat/conversations/${selectedConversation.value.id}/status`, {
      method: 'PATCH',
      body: { status: newStatus }
    })

    if (response.success) {
      // Update local state
      const convIndex = conversations.value.findIndex(c => c.id === selectedConversation.value.id)
      if (convIndex !== -1) {
        conversations.value[convIndex].status = newStatus
      }
      selectedConversation.value.status = newStatus
    }
  } catch (error) {
    console.error('Error updating conversation status:', error)
    alert(error?.data?.message || 'Failed to update conversation status. Please try again.')
  }
}

const refreshConversations = async () => {
  await fetchConversations()
  if (selectedConversation.value) {
    // Reload selected conversation
    const updated = conversations.value.find(c => c.id === selectedConversation.value.id)
    if (updated) {
      selectedConversation.value = updated
      await loadMessages()
    }
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Never'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

// Watch for new messages (polling or real-time updates)
let pollingInterval = null

onMounted(() => {
  fetchConversations()

  // Poll for new messages every 30 seconds
  pollingInterval = setInterval(() => {
    if (selectedConversation.value) {
      loadMessages()
    } else {
      fetchConversations()
    }
  }, 30000)
})

// Watch for conversation selection to load messages
watch(selectedConversation, (newVal) => {
  if (newVal) {
    loadMessages()
  }
})

// Cleanup
onBeforeUnmount(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>

