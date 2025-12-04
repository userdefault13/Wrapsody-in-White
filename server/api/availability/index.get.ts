import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const db = await getDatabase()
    const availability = await db.collection('availability').findOne({ type: 'schedule' })
    
    return {
      success: true,
      data: availability || { availability: [], dayOfWeekSchedules: [] }
    }
  } catch (error) {
    console.error('Error fetching availability:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch availability'
    })
  }
})

