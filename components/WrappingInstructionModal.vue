<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ hasExistingProgress ? 'Resume Wrapping' : 'Wrapping Instructions' }}
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Size: {{ getItemSizeDisplay(item) }} | Worker: {{ workerName }}
                  <span v-if="hasExistingProgress" class="ml-2 text-primary-600 dark:text-primary-400 font-medium">
                    ({{ completedStepsCount }} / {{ totalSteps }} steps completed)
                  </span>
                </p>
                <!-- Progress Bar -->
                <div class="mt-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress: {{ completedStepsCount }} / {{ totalSteps }}
                    </span>
                    <span class="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {{ progressPercentage }}%
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 transition-all duration-500 ease-out rounded-full"
                      :style="{ width: `${progressPercentage}%` }"
                    ></div>
                  </div>
                </div>
              </div>
              <button
                @click="close"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div v-if="item" ref="contentContainer" class="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div class="space-y-6">
                <!-- Item Info -->
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    Item: {{ item.description || `Item ${item.itemNumber}` }}
                  </h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Size:</span>
                      <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ getItemSizeDisplay(item) }}</span>
                    </div>
                    <div v-if="item.wrappingStyle">
                      <span class="text-gray-600 dark:text-gray-400">Style:</span>
                      <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ item.wrappingStyle }}</span>
                    </div>
                  </div>
                  <div v-if="item.specialInstructions" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span class="text-gray-600 dark:text-gray-400">Special Instructions:</span>
                    <p class="mt-1 text-gray-900 dark:text-white">{{ item.specialInstructions }}</p>
                  </div>
                </div>

                <!-- Wrapping Instructions by Size -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Step-by-Step Instructions
                  </h3>
                  
                  <div class="space-y-4">
                    <div
                      v-for="(step, index) in instructions"
                      :key="index"
                      :ref="el => { if (el) stepRefs[index] = el }"
                      :class="[
                        'flex gap-4 p-4 rounded-lg transition-all duration-200',
                        completedSteps[index]
                          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
                          : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      ]"
                    >
                      <div
                        :class="[
                          'flex-shrink-0 w-8 h-8 rounded-full font-bold flex items-center justify-center transition-all',
                          completedSteps[index]
                            ? 'bg-green-500 dark:bg-green-600 text-white'
                            : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        ]"
                      >
                        <svg
                          v-if="completedSteps[index]"
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                        <span v-else>{{ index + 1 }}</span>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <h4
                              :class="[
                                'font-semibold mb-1',
                                completedSteps[index]
                                  ? 'text-green-800 dark:text-green-200'
                                  : 'text-gray-900 dark:text-white'
                              ]"
                            >
                              {{ step.title }}
                            </h4>
                            <p
                              :class="[
                                'text-sm',
                                completedSteps[index]
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-gray-700 dark:text-gray-300'
                              ]"
                            >
                              {{ step.description }}
                            </p>
                            <ul
                              v-if="step.details && index !== 0"
                              :class="[
                                'mt-2 space-y-1 text-sm',
                                completedSteps[index]
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              ]"
                            >
                              <li v-for="(detail, i) in step.details" :key="i" class="flex items-start">
                                <span class="mr-2">•</span>
                                <span>{{ detail }}</span>
                              </li>
                            </ul>
                            
                            <!-- Step 1 Checklist for Box and Wrapping Paper -->
                            <div v-if="index === 0" class="mt-4 space-y-3">
                              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h5 class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                  Verify Materials Selection
                                </h5>
                                <div class="space-y-2">
                                  <!-- Box Dimension Checklist Item -->
                                  <label class="flex items-start gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      v-model="workspaceChecklist.boxSelected"
                                      class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <div class="flex-1">
                                      <span class="text-sm font-medium text-gray-900 dark:text-white">
                                        Correct box dimension selected
                                      </span>
                                      <div v-if="selectedBoxDimension" class="mt-1 flex items-center gap-2">
                                        <span class="text-xs text-gray-600 dark:text-gray-400">
                                          {{ selectedBoxDimension.length }} × {{ selectedBoxDimension.width }} × {{ selectedBoxDimension.height }} in
                                          <span class="ml-2">({{ selectedBoxDimension.wrappingPaperNeeded.toFixed(1) }} sq in needed)</span>
                                        </span>
                                        <span v-if="item.boxDimensionId" class="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                          {{ item.boxDimensionId }}
                                        </span>
                                      </div>
                                      <div v-else-if="item.boxDimensionId" class="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                        Box dimension ID: {{ item.boxDimensionId }} (loading details...)
                                      </div>
                                      <div v-else class="mt-1 text-xs text-red-600 dark:text-red-400">
                                        No box dimension selected
                                      </div>
                                    </div>
                                  </label>
                                  
                                  <!-- Wrapping Paper Roll Checklist Item -->
                                  <label class="flex items-start gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      v-model="workspaceChecklist.wrappingPaperSelected"
                                      class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <div class="flex-1">
                                      <span class="text-sm font-medium text-gray-900 dark:text-white">
                                        Correct wrapping paper roll selected
                                      </span>
                                      <div v-if="selectedWrappingPaper" class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                        {{ getShortInventoryName(selectedWrappingPaper.inventoryName) }} - Roll {{ selectedWrappingPaper.rollNumber }}
                                        <span class="ml-2">({{ selectedWrappingPaper.onHand.toFixed(2) }} sqft remaining)</span>
                                      </div>
                                      <div v-else-if="item.wrappingPaperSelection" class="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                        Wrapping paper: {{ item.wrappingPaperSelection }} (loading details...)
                                      </div>
                                      <div v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        No wrapping paper roll selected at check-in
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              </div>
                              
                              <!-- Standard checklist items -->
                              <ul
                                v-if="step.details"
                                :class="[
                                  'mt-2 space-y-1 text-sm',
                                  completedSteps[index]
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                ]"
                              >
                                <li v-for="(detail, i) in step.details" :key="i" class="flex items-start">
                                  <span class="mr-2">•</span>
                                  <span>{{ detail }}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                          <button
                            v-if="!completedSteps[index]"
                            @click="completeStep(index)"
                            class="ml-4 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium text-sm flex items-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Complete
                          </button>
                          <button
                            v-else
                            @click="undoStep(index)"
                            class="ml-4 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium text-sm flex items-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Undo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tips Section -->
                <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h4 class="font-semibold text-amber-900 dark:text-amber-300 mb-2">
                    💡 Pro Tips
                  </h4>
                  <ul class="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                    <li v-for="(tip, index) in tips" :key="index" class="flex items-start">
                      <span class="mr-2">•</span>
                      <span>{{ tip }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                <span v-if="completedStepsCount === totalSteps" class="text-green-600 dark:text-green-400 font-medium">
                  ✓ All steps completed!
                </span>
                <span v-else-if="completedStepsCount > 0" class="text-primary-600 dark:text-primary-400 font-medium">
                  Progress saved: {{ completedStepsCount }} / {{ totalSteps }} steps
                </span>
                <span v-else>
                  Complete all steps to finish wrapping
                </span>
              </div>
              <div class="flex gap-4">
                <button
                  @click="handleComplete"
                  :disabled="completedStepsCount !== totalSteps || saving"
                  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg v-if="completedStepsCount === totalSteps && !saving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-if="saving" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ saving ? 'Saving...' : 'Mark as Complete' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Box Dimension Selection Modal -->
    <BoxDimensionSelectionModal
      :is-open="showBoxDimensionModal"
      :item="item"
      @close="showBoxDimensionModal = false"
      @confirm="handleBoxDimensionConfirm"
    />
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'
import BoxDimensionSelectionModal from './BoxDimensionSelectionModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  },
  workerName: {
    type: String,
    default: 'Worker'
  }
})

const emit = defineEmits(['close', 'complete', 'progress-saved'])

const { executeQuery } = useGraphQL()
const saving = ref(false)
const showBoxDimensionModal = ref(false)

// Track completed steps
const completedSteps = ref([])
const stepRefs = ref([])
const contentContainer = ref(null)

// Workspace checklist for step 1
const workspaceChecklist = ref({
  boxSelected: false,
  wrappingPaperSelected: false
})

// Selected box dimension and wrapping paper data
const selectedBoxDimension = ref(null)
const selectedWrappingPaper = ref(null)
const loadingMaterials = ref(false)

const getShortInventoryName = (fullName) => {
  if (!fullName) return ''
  
  // Extract the product code (usually in parentheses at the end, like "(5JXW1038)")
  const codeMatch = fullName.match(/\(([A-Z0-9]+)\)\s*$/)
  const productCode = codeMatch ? codeMatch[1] : null
  
  // Get the first part of the name (before any long descriptions)
  // Usually the brand and main product name come first, before the first comma or long description
  let shortName = fullName.split(',')[0].trim()
  
  // If there's a product code, add it in parentheses
  if (productCode) {
    shortName = `${shortName} (${productCode})`
  }
  
  return shortName
}

const getItemSizeDisplay = (item) => {
  if (!item) return 'N/A'
  
  // Check if size object exists (from GraphQL resolver)
  if (item.size && typeof item.size === 'object') {
    return item.size.displayName || item.size.name || 'N/A'
  }
  
  // If sizeId exists but size object wasn't loaded, show sizeId
  if (item.sizeId) {
    return `Size ID: ${item.sizeId}`
  }
  
  // Fallback to any size string that might exist
  if (item.size && typeof item.size === 'string') {
    return item.size
  }
  
  return 'N/A'
}

const getSizeForInstructions = (item) => {
  if (!item) return ''
  
  // Try to get size name from size object
  if (item.size && typeof item.size === 'object') {
    return (item.size.name || item.size.displayName || '').toLowerCase()
  }
  
  // Try to extract from sizeId (e.g., "size-xsmall" -> "xsmall")
  if (item.sizeId) {
    const match = item.sizeId.match(/size-(\w+)/)
    if (match) {
      return match[1].toLowerCase()
    }
  }
  
  // Fallback to size string
  if (item.size && typeof item.size === 'string') {
    return item.size.toLowerCase()
  }
  
  return ''
}

const instructions = computed(() => {
  const size = getSizeForInstructions(props.item)
  
  // Base instructions for all sizes
  const baseInstructions = [
    {
      title: 'Prepare Your Workspace',
      description: 'Set up a clean, flat surface with all necessary materials.',
      details: [
        'Gather wrapping paper, scissors, tape, and ribbon/bow',
        'Ensure adequate lighting',
        'Have a measuring tool ready'
      ]
    },
    {
      title: 'Measure and Cut Paper',
      description: 'Measure the item and cut appropriate wrapping paper.',
      details: []
    },
    {
      title: 'Wrap the Item',
      description: 'Carefully wrap the item ensuring smooth edges and tight corners.',
      details: []
    },
    {
      title: 'Add Finishing Touches',
      description: 'Apply ribbon, bow, or other decorative elements.',
      details: []
    },
    {
      title: 'Quality Check',
      description: 'Inspect the wrapped item for any imperfections.',
      details: [
        'Check for wrinkles or loose paper',
        'Ensure tape is secure and hidden',
        'Verify decorative elements are properly attached'
      ]
    }
  ]

  // Size-specific modifications
  if (size.includes('xsmall') || size.includes('extra small')) {
    baseInstructions[1].details = [
      'Measure item dimensions',
      'Add 2-3 inches to each side for overlap',
      'Cut paper in one clean motion'
    ]
    baseInstructions[2].details = [
      'Place item in center of paper',
      'Fold sides first, then top and bottom',
      'Use minimal tape for clean look'
    ]
    baseInstructions[3].details = [
      'Use thin ribbon or twine',
      'Add small bow or gift tag',
      'Keep decorations minimal and elegant'
    ]
  } else if (size.includes('small')) {
    baseInstructions[1].details = [
      'Measure item dimensions',
      'Add 3-4 inches to each side for overlap',
      'Cut paper ensuring straight edges'
    ]
    baseInstructions[2].details = [
      'Center item on paper',
      'Fold and crease edges sharply',
      'Use double-sided tape for invisible seams'
    ]
    baseInstructions[3].details = [
      'Add medium-width ribbon',
      'Create a bow or use pre-made bow',
      'Consider adding a gift tag'
    ]
  } else if (size.includes('medium')) {
    baseInstructions[1].details = [
      'Measure all dimensions carefully',
      'Add 4-5 inches to each side',
      'Cut paper on a flat surface'
    ]
    baseInstructions[2].details = [
      'Position item in center',
      'Fold corners first for neat edges',
      'Use strong tape to secure folds'
    ]
    baseInstructions[3].details = [
      'Use wider ribbon (1-2 inches)',
      'Create a full bow or decorative knot',
      'Add coordinating gift tag'
    ]
  } else if (size.includes('large') || size.includes('odd')) {
    baseInstructions[1].details = [
      'Measure carefully, accounting for odd shapes',
      'Add 5-6 inches to each side',
      'May need multiple pieces of paper for large items'
    ]
    baseInstructions[2].details = [
      'Work methodically around the item',
      'Reinforce corners with extra tape',
      'Smooth out any air bubbles'
    ]
    baseInstructions[3].details = [
      'Use wide ribbon or multiple ribbons',
      'Create a substantial bow',
      'Add multiple decorative elements if needed'
    ]
  } else if (size.includes('extra large') || size.includes('fragile')) {
    baseInstructions[1].details = [
      'Measure all dimensions, especially for fragile items',
      'Add 6-8 inches to each side for secure wrapping',
      'May require heavy-duty or reinforced paper'
    ]
    baseInstructions[2].details = [
      'Wrap with extra care for fragile items',
      'Add padding if necessary',
      'Use strong tape and reinforce all seams'
    ]
    baseInstructions[3].details = [
      'Use wide, strong ribbon',
      'Create a large, secure bow',
      'Add "Fragile" label if needed'
    ]
  }

  return baseInstructions
})

const tips = computed(() => {
  const size = getSizeForInstructions(props.item)
  
  if (size.includes('fragile')) {
    return [
      'Handle with extreme care',
      'Add extra padding around fragile areas',
      'Use reinforced tape on all seams',
      'Consider double-wrapping for extra protection'
    ]
  } else if (size.includes('large') || size.includes('extra large')) {
    return [
      'Work on a large, flat surface',
      'Have an assistant if needed for large items',
      'Use heavy-duty tape for security',
      'Test the wrap before finalizing'
    ]
  } else {
    return [
      'Take your time for precision',
      'Keep edges crisp and clean',
      'Match ribbon color to wrapping paper',
      'Double-check all tape is secure'
    ]
  }
})

// Initialize completed steps array when modal opens or item changes
const loadProgress = () => {
  if (!props.item) {
    console.log('loadProgress: No item provided')
    completedSteps.value = []
    return
  }
  
  const numInstructions = instructions.value.length
  console.log('loadProgress: Item data:', {
    itemId: props.item.id,
    wrappingProgress: props.item.wrappingProgress,
    progressType: typeof props.item.wrappingProgress,
    isArray: Array.isArray(props.item.wrappingProgress),
    numInstructions
  })
  
  // Load existing progress from item, or initialize with all steps as incomplete
  if (props.item.wrappingProgress && Array.isArray(props.item.wrappingProgress)) {
    // Copy the progress array
    const progress = [...props.item.wrappingProgress]
    
    console.log('loadProgress: Original progress array from item:', progress)
    console.log('loadProgress: Progress array length:', progress.length)
    console.log('loadProgress: Number of instructions:', numInstructions)
    
    // Ensure the array matches the number of instructions
    while (progress.length < numInstructions) {
      progress.push(false)
    }
    
    // Take only the first numInstructions elements
    completedSteps.value = progress.slice(0, numInstructions)
    
    console.log('loadProgress: Final completedSteps array:', completedSteps.value)
    console.log('loadProgress: Step states:', completedSteps.value.map((val, idx) => `Step ${idx + 1}: ${val ? 'COMPLETE' : 'INCOMPLETE'}`))
    console.log('loadProgress: Completed count:', completedSteps.value.filter(Boolean).length, 'out of', numInstructions)
  } else {
    // Initialize with all steps as incomplete
    completedSteps.value = new Array(numInstructions).fill(false)
    console.log('loadProgress: No wrappingProgress array found on item, initializing with', numInstructions, 'incomplete steps')
    console.log('loadProgress: Item keys:', Object.keys(props.item))
  }
}

// Fetch box dimension and wrapping paper data
const loadMaterialsData = async () => {
  console.log('loadMaterialsData: Called, props.item:', props.item)
  if (!props.item) {
    console.log('loadMaterialsData: Early return - no item')
    return
  }
  
  console.log('loadMaterialsData: Item data:', {
    id: props.item.id,
    boxDimensionId: props.item.boxDimensionId,
    wrappingPaperSelection: props.item.wrappingPaperSelection,
    fullItem: props.item
  })
  
  loadingMaterials.value = true
  try {
    // Fetch box dimension if boxDimensionId exists
    if (props.item.boxDimensionId) {
      console.log('loadMaterialsData: Fetching box dimension:', props.item.boxDimensionId)
      const boxDimensionQuery = `
        query GetBoxDimension($id: ID!) {
          boxDimension(id: $id) {
            id
            length
            width
            height
            wrappingPaperNeeded
          }
        }
      `
      try {
        const boxData = await executeQuery(boxDimensionQuery, { id: props.item.boxDimensionId })
        console.log('loadMaterialsData: Box dimension query result:', boxData)
        selectedBoxDimension.value = boxData?.boxDimension || null
        console.log('loadMaterialsData: Box dimension loaded:', selectedBoxDimension.value)
        if (!selectedBoxDimension.value) {
          console.error('loadMaterialsData: Box dimension query returned null for id:', props.item.boxDimensionId)
          console.error('loadMaterialsData: Full query response:', boxData)
        }
      } catch (error) {
        console.error('loadMaterialsData: Error fetching box dimension:', error)
        selectedBoxDimension.value = null
      }
    } else {
      console.log('loadMaterialsData: No boxDimensionId found on item')
    }
    
    // Fetch wrapping paper if wrappingPaperSelection exists
    if (props.item.wrappingPaperSelection) {
      console.log('loadMaterialsData: Fetching wrapping paper:', props.item.wrappingPaperSelection)
      const [inventoryId, rollNumber] = props.item.wrappingPaperSelection.split(':')
      const inventoryQuery = `
        query GetInventory($id: ID!) {
          inventoryItem(id: $id) {
            id
            name
            rolls {
              rollNumber
              onHand
              maxArea
            }
          }
        }
      `
      try {
        const invData = await executeQuery(inventoryQuery, { id: inventoryId })
        console.log('loadMaterialsData: Inventory query result:', invData)
        if (invData?.inventoryItem && invData.inventoryItem.rolls) {
          const roll = invData.inventoryItem.rolls.find((r) => r.rollNumber === parseInt(rollNumber))
          if (roll) {
            selectedWrappingPaper.value = {
              inventoryId: inventoryId,
              inventoryName: invData.inventoryItem.name,
              rollNumber: roll.rollNumber,
              onHand: roll.onHand,
              maxArea: roll.maxArea
            }
            console.log('loadMaterialsData: Wrapping paper loaded:', selectedWrappingPaper.value)
          } else {
            console.error('loadMaterialsData: Roll not found. Roll number:', rollNumber, 'Available rolls:', invData.inventoryItem.rolls)
          }
        } else {
          console.error('loadMaterialsData: Inventory item or rolls not found:', invData)
        }
      } catch (error) {
        console.error('loadMaterialsData: Error fetching wrapping paper:', error)
        selectedWrappingPaper.value = null
      }
    } else {
      console.log('loadMaterialsData: No wrappingPaperSelection found on item')
    }
  } catch (error) {
    console.error('Error loading materials data:', error)
  } finally {
    loadingMaterials.value = false
  }
}

// Watch for modal opening
watch(() => props.isOpen, async (isOpen) => {
  console.log('WrappingInstructionModal watch: isOpen changed to:', isOpen, 'item:', props.item)
  if (isOpen && props.item) {
    console.log('WrappingInstructionModal watch: Calling loadMaterialsData with item:', {
      id: props.item.id,
      boxDimensionId: props.item.boxDimensionId,
      wrappingPaperSelection: props.item.wrappingPaperSelection
    })
    // Load materials data
    await loadMaterialsData()
    // Wait for next tick to ensure instructions are computed
    await nextTick()
    // Wait a bit more to ensure all reactive values are settled
    setTimeout(() => {
      loadProgress()
      // Reset step refs
      stepRefs.value = []
      // Reset checklist
      workspaceChecklist.value = {
        boxSelected: false,
        wrappingPaperSelected: false
      }
    }, 100)
  } else {
    // Reset when modal closes
    completedSteps.value = []
    stepRefs.value = []
    selectedBoxDimension.value = null
    selectedWrappingPaper.value = null
    workspaceChecklist.value = {
      boxSelected: false,
      wrappingPaperSelected: false
    }
  }
})

// Also watch for item changes (in case item is updated while modal is open)
watch(() => [props.item?.id, props.item?.wrappingProgress], async () => {
  if (props.isOpen && props.item) {
    await nextTick()
    setTimeout(() => {
      loadProgress()
    }, 100)
  }
}, { deep: true })

// Watch for item prop changes to load materials data
watch(() => props.item, async (newItem) => {
  console.log('WrappingInstructionModal: Item prop changed:', newItem)
  if (props.isOpen && newItem) {
    console.log('WrappingInstructionModal: Item changed, calling loadMaterialsData')
    await loadMaterialsData()
  }
}, { immediate: true, deep: true })

// Also load progress on mount if modal is already open
onMounted(() => {
  if (props.isOpen && props.item) {
    nextTick(() => {
      setTimeout(() => {
        loadProgress()
      }, 100)
    })
  }
})

const totalSteps = computed(() => instructions.value.length)

const completedStepsCount = computed(() => {
  return completedSteps.value.filter(Boolean).length
})

const hasExistingProgress = computed(() => {
  if (!props.item) return false
  // Check if wrappingProgress exists and has at least one completed step
  const progress = props.item.wrappingProgress
  return Array.isArray(progress) && progress.length > 0 && progress.some(Boolean)
})

const progressPercentage = computed(() => {
  if (totalSteps.value === 0) return 0
  return Math.round((completedStepsCount.value / totalSteps.value) * 100)
})

const completeStep = async (index) => {
  // For step 1, require checklist items to be checked
  if (index === 0) {
    if (!workspaceChecklist.value.boxSelected) {
      alert('Please verify that the correct box dimension is selected before completing this step.')
      return
    }
    if (!workspaceChecklist.value.wrappingPaperSelected) {
      alert('Please verify that the correct wrapping paper roll is selected before completing this step.')
      return
    }
  }
  
  completedSteps.value[index] = true
  // Save to database immediately
  await saveProgressToDB()
  
  // Scroll to next incomplete step
  await nextTick()
  scrollToNextStep(index)
}

const scrollToNextStep = (currentIndex) => {
  // Find the next incomplete step
  const nextIndex = completedSteps.value.findIndex((completed, idx) => idx > currentIndex && !completed)
  
  if (nextIndex !== -1 && stepRefs.value[nextIndex] && contentContainer.value) {
    const nextStepElement = stepRefs.value[nextIndex]
    const container = contentContainer.value
    
    if (nextStepElement && container) {
      // Wait a bit for DOM to update
      setTimeout(() => {
        const elementRect = nextStepElement.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const scrollOffset = elementRect.top - containerRect.top + container.scrollTop - 20 // 20px padding
        
        container.scrollTo({
          top: scrollOffset,
          behavior: 'smooth'
        })
      }, 100)
    }
  }
}

const undoStep = async (index) => {
  completedSteps.value[index] = false
  // Save to database immediately
  await saveProgressToDB()
}

const saveProgressToDB = async () => {
  if (!props.item || saving.value) return

  saving.value = true
  try {
    const mutation = `
      mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
        updateWorkItem(input: $input) {
          id
          wrappingProgress
        }
      }
    `
    
    await executeQuery(mutation, {
      input: {
        id: props.item.id,
        wrappingProgress: completedSteps.value
      }
    })

    emit('progress-saved', {
      item: props.item,
      progress: completedSteps.value
    })
  } catch (error) {
    console.error('Error saving progress:', error)
    // Don't show alert on every step, just log it
  } finally {
    saving.value = false
  }
}

const close = () => {
  emit('close')
}

const handleComplete = async () => {
  if (!props.item || saving.value || completedStepsCount.value !== totalSteps.value) {
    if (completedStepsCount.value !== totalSteps.value) {
      alert(`Please complete all ${totalSteps.value} steps before marking as complete.`)
    }
    return
  }

  // Verify that all steps are actually completed (100% completion)
  const allStepsComplete = completedSteps.value.length === totalSteps.value && 
                          completedSteps.value.every(step => step === true)
  
  if (!allStepsComplete) {
    alert(`All ${totalSteps.value} wrapping steps must be completed before moving to quality check.`)
    return
  }

  // Show box dimension selection modal first
  showBoxDimensionModal.value = true
}

const handleBoxDimensionConfirm = async (boxDimensionData) => {
  showBoxDimensionModal.value = false
  
  saving.value = true
  try {
    // Save progress first (but don't change status yet - let parent check all items)
    const mutation = `
      mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
        updateWorkItem(input: $input) {
          id
          wrappingProgress
          status
        }
      }
    `
    
    // Save wrapping progress with box dimension info but keep status as 'wrapping' for now
    // The parent will check if ALL items are 100% complete before moving to quality_check
    await executeQuery(mutation, {
      input: {
        id: props.item.id,
        wrappingProgress: completedSteps.value,
        boxDimensionId: boxDimensionData.boxDimensionId,
        wrappingAttempts: boxDimensionData.attempts
        // Don't change status here - let parent handle it after checking all items
      }
    })

    // Emit complete event with bookingId and box dimension data
    // The parent will check if ALL items have 100% wrapping progress before moving to QA
    emit('complete', {
      item: props.item,
      bookingId: props.item.bookingId,
      boxDimensionId: boxDimensionData.boxDimensionId,
      attempts: boxDimensionData.attempts,
      wrappingPaperNeeded: boxDimensionData.wrappingPaperNeeded,
      dimension: boxDimensionData.dimension
    })
    close()
  } catch (error) {
    console.error('Error completing wrapping:', error)
    alert('Failed to complete wrapping. Please try again.')
  } finally {
    saving.value = false
  }
}
</script>

