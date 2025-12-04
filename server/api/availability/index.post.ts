import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = await getDatabase()
    
    const schedule = {
      type: 'schedule',
      availability: body.availability || [],
      dayOfWeekSchedules: body.dayOfWeekSchedules || [],
      updatedAt: new Date().toISOString()
    }
    
    // Upsert the schedule
    await db.collection('availability').updateOne(
      { type: 'schedule' },
      { $set: schedule },
      { upsert: true }
    )
    
    return {
      success: true,
      data: schedule
    }
  } catch (error) {
    console.error('Error saving availability:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to save availability'
    })
  }
})

