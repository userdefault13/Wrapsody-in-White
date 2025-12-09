import { getDatabase } from './mongodb'

/**
 * Calculate surface area of a box in square inches
 * Formula: 2(lw + lh + wh)
 */
export function calculateBoxSurfaceArea(length: number, width: number, height: number): number {
  return 2 * (length * width + length * height + width * height)
}

/**
 * Calculate wrapping paper needed for a box
 * Includes waste factor for overlap and trimming
 * @param length - Box length in inches
 * @param width - Box width in inches
 * @param height - Box height in inches
 * @param wasteFactor - Waste percentage (default 0.15 = 15%)
 * @returns Wrapping paper needed in square inches
 */
export function calculateWrappingPaperNeeded(
  length: number,
  width: number,
  height: number,
  wasteFactor: number = 0.15 // 15% waste for overlap and trimming
): number {
  const surfaceArea = calculateBoxSurfaceArea(length, width, height)
  return surfaceArea * (1 + wasteFactor)
}

/**
 * Convert square inches to square feet
 */
export function squareInchesToSquareFeet(squareInches: number): number {
  return squareInches / 144
}

/**
 * Convert square feet to square inches
 */
export function squareFeetToSquareInches(squareFeet: number): number {
  return squareFeet * 144
}

/**
 * Find the smallest box dimension to determine minimum usable area
 * This is used to detect when a roll is too small to wrap even the smallest box
 */
export async function getSmallestBoxWrappingPaperNeeded(): Promise<number> {
  try {
    const db = await getDatabase()
    const boxDimensions = await db.collection('boxDimensions')
      .find({ active: true })
      .sort({ wrappingPaperNeeded: 1 })
      .limit(1)
      .toArray()
    
    return boxDimensions[0]?.wrappingPaperNeeded || 0
  } catch (error) {
    console.error('Error getting smallest box wrapping paper needed:', error)
    return 0
  }
}

/**
 * Calculate total area of a wrapping paper roll
 * @param rollLength - Length of roll in feet
 * @param rollWidth - Width of roll in feet
 * @param quantity - Number of rolls
 * @returns Total area in square feet
 */
export function calculateRollTotalArea(rollLength: number, rollWidth: number, quantity: number): number {
  return rollLength * rollWidth * quantity
}

