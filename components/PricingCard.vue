<template>
  <div :class="[
    'rounded-xl p-8 shadow-lg transition-all duration-300',
    popular ? 'bg-primary-600 text-white scale-105 border-4 border-primary-400' : 'bg-white text-gray-900 border border-gray-200'
  ]">
    <div v-if="popular" class="text-center mb-4">
      <span class="bg-primary-400 text-white text-sm font-semibold px-3 py-1 rounded-full">Most Popular</span>
    </div>
    <h3 class="text-2xl font-bold mb-2">{{ tier }}</h3>
    <div class="mb-4">
      <span class="text-4xl font-bold">{{ price }}</span>
      <span v-if="price.includes('/hr')" class="text-lg opacity-80">/hour</span>
    </div>
    <p :class="['mb-6', popular ? 'text-primary-100' : 'text-gray-600']">{{ description }}</p>
    <ul class="space-y-3 mb-8">
      <li v-for="feature in features.split(', ')" :key="feature" class="flex items-start">
        <svg :class="['w-5 h-5 mr-2 mt-0.5 flex-shrink-0', popular ? 'text-primary-200' : 'text-green-500']" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>{{ feature }}</span>
      </li>
    </ul>
    <button
      @click="$emit('book-now')"
      :class="[
        'block w-full text-center py-3 rounded-lg font-semibold transition-colors',
        popular ? 'bg-white text-primary-600 hover:bg-primary-50' : 'bg-primary-600 text-white hover:bg-primary-700'
      ]"
    >
      Book Now
    </button>
  </div>
</template>

<script setup>
defineProps({
  tier: String,
  price: String,
  description: String,
  features: String,
  popular: Boolean
})

defineEmits(['book-now'])
</script>

