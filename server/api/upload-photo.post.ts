import { defineEventHandler, readBody, createError } from 'h3'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    const { image, type = 'general' } = await readBody(event)
    
    if (!image) {
      throw createError({
        statusCode: 400,
        message: 'No image data provided'
      })
    }
    
    // Convert base64 to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Generate filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const filename = `${type}-${timestamp}-${random}.jpg`
    
    // Create upload directory based on type
    const uploadDir = join(process.cwd(), 'public', 'uploads', type)
    
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    // Save file
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)
    
    return {
      success: true,
      url: `/uploads/${type}/${filename}`,
      filename
    }
  } catch (error: any) {
    console.error('Photo upload error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to upload photo'
    })
  }
})

