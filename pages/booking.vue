<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue'

definePageMeta({
  layout: false
})

const router = useRouter()

// Redirect to home page since booking is now done via modal
onMounted(() => {
  router.push('/')
})
</script>
