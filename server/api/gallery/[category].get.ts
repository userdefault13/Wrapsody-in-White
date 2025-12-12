import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    const category = getRouterParam(event, 'category')
    
    // Validate category
    const validCategories = ['wrapping-paper', 'ribbon-tags', 'bows']
    if (!category || !validCategories.includes(category)) {
      throw createError({
        statusCode: 400,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      })
    }
    
    // Path to gallery directory
    const galleryDir = join(process.cwd(), 'public', 'uploads', 'gallery', category)
    
    // Check if directory exists
    if (!existsSync(galleryDir)) {
      return {
        success: true,
        images: []
      }
    }
    
    // Read directory contents
    const files = await readdir(galleryDir)
    
    // Filter for image files and get file stats
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const images = []
    
    for (const file of files) {
      const filePath = join(galleryDir, file)
      const fileStat = await stat(filePath)
      
      // Only include files (not directories) with image extensions
      if (fileStat.isFile() && imageExtensions.some(ext => file.toLowerCase().endsWith(ext))) {
        images.push({
          url: `/uploads/gallery/${category}/${file}`,
          filename: file,
          title: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          alt: `${category} - ${file}`,
          // You can add more metadata here if you create a JSON file alongside images
        })
      }
    }
    
    // Sort images by filename
    images.sort((a, b) => a.filename.localeCompare(b.filename))
    
    return {
      success: true,
      images
    }
  } catch (error: any) {
    console.error('Error fetching gallery images:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch gallery images'
    })
  }
})

