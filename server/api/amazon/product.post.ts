/**
 * Fetch Amazon product information from URL
 * 
 * This endpoint extracts ASIN from Amazon URLs and attempts to fetch product data.
 * 
 * For full product data fetching, you can integrate:
 * 1. Amazon Product Advertising API (requires credentials)
 * 2. Third-party services like RapidAPI Amazon Product API
 * 3. Web scraping with proper rate limiting (check legal compliance)
 * 
 * Currently extracts ASIN and attempts to parse product details from the URL or product page.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { url, asin } = body

    if (!url && !asin) {
      throw createError({
        statusCode: 400,
        message: 'URL or ASIN is required'
      })
    }

    // Extract ASIN from various Amazon URL formats
    let productAsin = asin
    if (!productAsin && url) {
      // Handle different Amazon URL formats:
      // - https://amazon.com/dp/B08XYZ1234
      // - https://amazon.com/product/B08XYZ1234
      // - https://amazon.com/gp/product/B08XYZ1234
      // - https://amazon.com/dp/B08XYZ1234/ref=...
      const asinPatterns = [
        /(?:dp|product|gp\/product)\/([A-Z0-9]{10})/,
        /\/dp\/([A-Z0-9]{10})/,
        /\/product\/([A-Z0-9]{10})/,
        /\/gp\/product\/([A-Z0-9]{10})/
      ]
      
      for (const pattern of asinPatterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          productAsin = match[1]
          break
        }
      }
    }
    
    if (!productAsin) {
      throw createError({
        statusCode: 400,
        message: 'Could not extract ASIN from URL. Please ensure the URL contains a valid Amazon product ASIN.'
      })
    }

    // Validate ASIN format (10 characters, alphanumeric)
    if (!/^[A-Z0-9]{10}$/.test(productAsin)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid ASIN format. ASIN must be 10 alphanumeric characters.'
      })
    }

    // Try to fetch product page HTML to extract details
    // Note: Amazon may block direct scraping, so this is a fallback approach
    let productData = {
      asin: productAsin,
      title: null,
      price: null,
      brand: null,
      description: null,
      size: null, // e.g., "88 sqft"
      quantity: null, // e.g., 4
      dimensions: null,
      rollLength: null, // Roll length in feet
      rollWidth: null, // Roll width in inches
      thumbnail: null, // Product image URL
      images: [],
      url: `https://www.amazon.com/dp/${productAsin}`
    }

    try {
      // Attempt to fetch the product page
      // Note: Amazon may require proper headers and may block scraping
      const fetchUrl = url || `https://www.amazon.com/dp/${productAsin}`
      console.log('🌐 Fetching Amazon product page:', fetchUrl)
      
      const response = await fetch(fetchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      })

      console.log('📡 Response status:', response.status, response.statusText)

      if (response.ok) {
        const html = await response.text()
        console.log('📄 HTML length:', html.length, 'characters')
        
        // Extract product title
        const titleMatch = html.match(/<span[^>]*id="productTitle"[^>]*>([^<]+)<\/span>/i) ||
                          html.match(/<h1[^>]*class="a-size-large[^>]*>([^<]+)<\/h1>/i)
        if (titleMatch && titleMatch[1]) {
          productData.title = titleMatch[1].trim()
        }

        // Extract price - try multiple patterns to find the actual product price
        // Look for price in various formats: $16.99, $16.99 - $20.99, etc.
        const pricePatterns = [
          /<span[^>]*class="[^"]*a-price[^"]*"[^>]*>.*?<span[^>]*class="[^"]*a-offscreen[^"]*"[^>]*>\$(\d+\.?\d*)/i,
          /<span[^>]*id="priceblock_[^"]*"[^>]*>.*?\$(\d+\.?\d*)/i,
          /"price":\s*"(\d+\.?\d*)"/i,
          /price[^>]*>.*?\$(\d+\.?\d*)/i,
          /\$(\d+\.?\d*)(?!\s*-\s*\$)/, // Match first price, not price ranges
        ]
        
        for (const pattern of pricePatterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            const price = parseFloat(match[1])
            if (price > 0 && price < 10000) { // Sanity check: reasonable price range
              productData.price = price
              console.log('Extracted price:', price)
              break
            }
          }
        }

        // Extract size information - look for "per roll" size, not total size
        // Patterns like "22 sq. ft. per roll", "22 sqft per roll", etc.
        const sizePatterns = [
          /(\d+)\s*(?:sq\.?\s*ft\.?|square\s*feet?)\s*(?:per\s*roll|each)/gi,
          /(\d+)\s*(?:sq\.?\s*ft\.?|square\s*feet?)\s*(?:per\s*roll)/gi,
          /per\s*roll[^>]*>.*?(\d+)\s*(?:sq\.?\s*ft\.?|sqft)/gi,
          /(\d+)\s*(?:sq\s*ft|sqft|square\s*feet|sq\.?\s*ft\.?)/gi,
        ]
        
        // First try to find "per roll" size (this is what we want)
        let foundPerRollSize = false
        for (const pattern of sizePatterns.slice(0, 3)) {
          const matches = [...html.matchAll(pattern)]
          if (matches.length > 0) {
            const sizes = matches.map(m => parseInt(m[1])).filter(n => !isNaN(n) && n > 0)
            if (sizes.length > 0) {
              // Take the first reasonable size (usually the per-roll size)
              productData.size = `${sizes[0]} sqft`
              foundPerRollSize = true
              console.log('Extracted size per roll:', sizes[0], 'sqft')
              break
            }
          }
        }
        
        // If we didn't find "per roll" size, look for any size mention
        if (!foundPerRollSize) {
          const allSizeMatches = [...html.matchAll(/(\d+)\s*(?:sq\.?\s*ft\.?|sqft|square\s*feet?)/gi)]
          if (allSizeMatches.length > 0) {
            const sizes = allSizeMatches.map(m => parseInt(m[1])).filter(n => !isNaN(n) && n > 0 && n < 1000)
            if (sizes.length > 0) {
              // If we have multiple sizes, the smaller one is likely per roll
              // (e.g., 22 sqft per roll, 88 sqft total)
              const sortedSizes = sizes.sort((a, b) => a - b)
              productData.size = `${sortedSizes[0]} sqft`
              console.log('Extracted size (smallest found):', sortedSizes[0], 'sqft')
            }
          }
        }

        // Extract quantity/pack count (look for patterns like "4 count", "Pack of 4", "4-Pack")
        // Try multiple patterns to catch different formats
        const quantityPatterns = [
          /(?:pack\s*of|count|quantity)[^>]*>.*?(\d+)/gi,
          /(\d+)[\s-]*(?:pack|count|ct)/gi,
          /(\d+)\s*(?:count|pack)/gi,
          /pack\s*of\s*(\d+)/gi,
          /(\d+)[\s-]*pack/gi
        ]
        
        for (const pattern of quantityPatterns) {
          const matches = [...html.matchAll(pattern)]
          if (matches.length > 0) {
            // Take the first match
            const quantity = parseInt(matches[0][1])
            if (!isNaN(quantity) && quantity > 0) {
              productData.quantity = quantity
              break
            }
          }
        }

        // Extract brand
        const brandMatch = html.match(/<a[^>]*class="[^"]*brand[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                          html.match(/brand[^>]*>([^<]+)</i)
        if (brandMatch && brandMatch[1]) {
          productData.brand = brandMatch[1].trim()
        }

        // Extract dimensions (for boxes)
        const dimensionMatch = html.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*(?:inches|in)/i)
        if (dimensionMatch) {
          productData.dimensions = `${dimensionMatch[1]}x${dimensionMatch[2]}x${dimensionMatch[3]}`
        }

        // Extract roll dimensions from "included component" field
        // Look for patterns like "30" x 8.8'", "30 inches x 8.8 feet", etc.
        // The format is typically: width (inches) x length (feet)
        // Key: double quote (") = inches, single quote (') = feet
        
        // Pattern 1: Look for "30" x 8.8'" format (double quote for inches, single quote for feet)
        // This is the most common format: width in inches, length in feet
        // Match: number + double quote (") + x + number + single quote (')
        // Use ["] to match double quote specifically, [''] to match single quote
        const rollDimensionPattern1 = /(\d+\.?\d*)\s*["]\s*(?:x|×|X)\s*(\d+\.?\d*)\s*[']/gi
        const matches1 = [...html.matchAll(rollDimensionPattern1)]
        console.log('🔍 Pattern 1 (30" x 8.8\') matches found:', matches1.length)
        for (const match of matches1) {
          console.log('🔍 Pattern 1 match:', match[0], '-> First:', match[1], 'Second:', match[2])
          if (match[1] && match[2]) {
            const firstNum = parseFloat(match[1])
            const secondNum = parseFloat(match[2])
            console.log('🔍 Parsed numbers:', firstNum, '(should be inches)', secondNum, '(should be feet)')
            
            // First number has double quote (") = inches (width)
            // Second number has single quote (') = feet (length)
            // Validate: width should be 20-40 inches, length should be 5-15 feet
            if (firstNum >= 20 && firstNum <= 40 && secondNum >= 5 && secondNum <= 15) {
              productData.rollWidth = firstNum // Width in inches
              productData.rollLength = secondNum // Length in feet
              console.log('✅ Extracted roll dimensions (pattern 1):', firstNum, 'inches x', secondNum, 'feet')
              break
            } else {
              console.log('⚠️ Pattern 1 match failed validation - firstNum:', firstNum, 'secondNum:', secondNum)
            }
          }
        }
        
        // Pattern 2: Look in "Components" or "included component" section specifically - be more thorough
        if (!productData.rollWidth || !productData.rollLength) {
          // Amazon stores product details in a table structure
          // Look for the product details table and find the Components row
          
          // First, try to find the product details table
          const productDetailsTableMatch = html.match(/<table[^>]*id="productDetails[^>]*>([\s\S]{0,10000})<\/table>/i)
          if (productDetailsTableMatch) {
            const tableHtml = productDetailsTableMatch[1]
            console.log('🔍 Found product details table, length:', tableHtml.length)
            
            // Look for Components row in the table - try multiple patterns
            const componentsRowPatterns = [
              /<tr[^>]*>[\s\S]{0,500}Components?[:\s]*<\/th>[\s\S]{0,500}?<td[^>]*>([\s\S]{0,500}?)<\/td>/i,
              /<tr[^>]*>[\s\S]{0,500}Components?[:\s]*<\/td>[\s\S]{0,500}?<td[^>]*>([\s\S]{0,500}?)<\/td>/i,
              /Components?[:\s]*<\/th>[\s\S]{0,1000}?<td[^>]*>([\s\S]{0,1000}?)<\/td>/i,
            ]
            
            let componentsText = null
            for (const pattern of componentsRowPatterns) {
              const componentsRowMatch = tableHtml.match(pattern)
              if (componentsRowMatch) {
                componentsText = componentsRowMatch[1]
                console.log('📋 Found Components row in table (pattern:', pattern, '):', componentsText.substring(0, 500))
                break
              }
            }
            
            if (componentsText) {
              // Remove HTML tags to get clean text
              let cleanText = componentsText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
              
              // Decode HTML entities: &#34; = ", &#39; = '
              cleanText = cleanText
                .replace(/&#34;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
              
              console.log('📋 Parsed Included Components (clean text):', cleanText)
              
              // Try to extract dimensions from this text
              // The text shows: "30" x 8.8'; 22 sq. ft." so we need to match 30" x 8.8'
              const dimensionPatterns = [
                /(\d+\.?\d*)\s*["]\s*(?:x|×|X)\s*(\d+\.?\d*)\s*[']/gi,  // 30" x 8.8'
                /(\d+\.?\d*)\s*&#34;\s*(?:x|×|X)\s*(\d+\.?\d*)\s*&#39;/gi,  // 30&#34; x 8.8&#39;
                /(\d+\.?\d*)\s*&quot;\s*(?:x|×|X)\s*(\d+\.?\d*)\s*&apos;/gi,  // 30&quot; x 8.8&apos;
                /(\d+\.?\d*)\s*["]\s*(?:x|×|X)\s*(\d+\.?\d*)\s*['"]/gi,  // More flexible
              ]
              
              // Search in both the original HTML (with entities) and decoded clean text
              const searchTexts = [componentsText, cleanText]
              
              for (const searchText of searchTexts) {
                for (const dimPattern of dimensionPatterns) {
                  const matches2 = [...searchText.matchAll(dimPattern)]
                  console.log('🔍 Pattern 2 matches in Components row:', matches2.length, 'using pattern:', dimPattern)
                  for (const match of matches2) {
                    console.log('🔍 Pattern 2 match:', match[0], '->', match[1], match[2])
                    if (match[1] && match[2]) {
                      const firstNum = parseFloat(match[1])
                      const secondNum = parseFloat(match[2])
                      console.log('🔍 Parsed numbers:', firstNum, secondNum)
                      if (firstNum >= 20 && firstNum <= 40 && secondNum >= 5 && secondNum <= 15) {
                        productData.rollWidth = firstNum
                        productData.rollLength = secondNum
                        console.log('✅ Extracted roll dimensions from Components row:', firstNum, 'inches x', secondNum, 'feet')
                        break
                      } else {
                        console.log('⚠️ Pattern 2 match failed validation:', firstNum, 'x', secondNum)
                      }
                    }
                  }
                  if (productData.rollWidth && productData.rollLength) break
                }
                if (productData.rollWidth && productData.rollLength) break
              }
            } else {
              console.log('⚠️ Components row not found in product details table')
              // Log a sample of the table HTML to help debug
              console.log('📋 Sample of product details table HTML:', tableHtml.substring(0, 1000))
            }
          } else {
            console.log('⚠️ Product details table not found')
          }
          
          // If not found in table, try other patterns
          if (!productData.rollWidth || !productData.rollLength) {
            // Try to find "Components:" in the HTML with more context
            const componentsLabelMatch = html.match(/Components?[:\s]+([^<]{0,300})/gi)
            if (componentsLabelMatch) {
              for (const match of componentsLabelMatch) {
                console.log('📋 Found Components label match:', match.substring(0, 400))
                // Extract dimensions from this match
                const dimensionPatterns = [
                  /(\d+\.?\d*)\s*["]\s*(?:x|×|X)\s*(\d+\.?\d*)\s*[']/gi,
                  /(\d+\.?\d*)\s*&quot;\s*(?:x|×|X)\s*(\d+\.?\d*)\s*&apos;/gi,
                ]
                for (const dimPattern of dimensionPatterns) {
                  const matches2 = [...match.matchAll(dimPattern)]
                  for (const dimMatch of matches2) {
                    if (dimMatch[1] && dimMatch[2]) {
                      const firstNum = parseFloat(dimMatch[1])
                      const secondNum = parseFloat(dimMatch[2])
                      if (firstNum >= 20 && firstNum <= 40 && secondNum >= 5 && secondNum <= 15) {
                        productData.rollWidth = firstNum
                        productData.rollLength = secondNum
                        console.log('✅ Extracted roll dimensions from Components label:', firstNum, 'inches x', secondNum, 'feet')
                        break
                      }
                    }
                  }
                  if (productData.rollWidth && productData.rollLength) break
                }
                if (productData.rollWidth && productData.rollLength) break
              }
            }
          }
          
          // Last resort: search entire HTML
          if (!productData.rollWidth || !productData.rollLength) {
            console.log('⚠️ No component section found or no valid dimensions extracted')
            console.log('🔍 Searching entire HTML for dimension pattern...')
            const lastResortPattern = /(\d+\.?\d*)\s*["]\s*(?:x|×|X)\s*(\d+\.?\d*)\s*[']/gi
            const lastResortMatches = [...html.matchAll(lastResortPattern)]
            console.log('🔍 Last resort matches found:', lastResortMatches.length)
            for (const match of lastResortMatches) {
              console.log('🔍 Last resort match:', match[0], '->', match[1], match[2])
              if (match[1] && match[2]) {
                const firstNum = parseFloat(match[1])
                const secondNum = parseFloat(match[2])
                if (firstNum >= 20 && firstNum <= 40 && secondNum >= 5 && secondNum <= 15) {
                  productData.rollWidth = firstNum
                  productData.rollLength = secondNum
                  console.log('✅ Extracted roll dimensions (last resort):', firstNum, 'inches x', secondNum, 'feet')
                  break
                }
              }
            }
          }
        }
        
        // Pattern 3: "30 inches x 8.8 feet" format (explicit units)
        if (!productData.rollWidth || !productData.rollLength) {
          const pattern3 = /(\d+\.?\d*)\s*(?:inches?|in\.?)\s*(?:x|×)\s*(\d+\.?\d*)\s*(?:feet?|ft\.?)/gi
          const matches3 = [...html.matchAll(pattern3)]
          for (const match of matches3) {
            if (match[1] && match[2]) {
              const width = parseFloat(match[1])
              const length = parseFloat(match[2])
              if (width >= 20 && width <= 40 && length >= 5 && length <= 15) {
                productData.rollWidth = width
                productData.rollLength = length
                console.log('✅ Extracted roll dimensions (pattern 3):', width, 'inches x', length, 'feet')
                break
              }
            }
          }
        }
        
        // Pattern 4: Look for escaped quotes in HTML (30&quot; x 8.8&apos;)
        if (!productData.rollWidth || !productData.rollLength) {
          const pattern4 = /(\d+\.?\d*)\s*&quot;\s*(?:x|×|X)\s*(\d+\.?\d*)\s*&apos;/gi
          const matches4 = [...html.matchAll(pattern4)]
          console.log('🔍 Pattern 4 (HTML entities) matches found:', matches4.length)
          for (const match of matches4) {
            console.log('🔍 Pattern 4 match:', match[0], '->', match[1], match[2])
            if (match[1] && match[2]) {
              const firstNum = parseFloat(match[1])
              const secondNum = parseFloat(match[2])
              console.log('🔍 Parsed numbers:', firstNum, secondNum)
              if (firstNum >= 20 && firstNum <= 40 && secondNum >= 5 && secondNum <= 15) {
                productData.rollWidth = firstNum
                productData.rollLength = secondNum
                console.log('✅ Extracted roll dimensions (pattern 4, HTML entities):', firstNum, 'inches x', secondNum, 'feet')
                break
              } else {
                console.log('⚠️ Pattern 4 match failed validation:', firstNum, 'x', secondNum)
              }
            }
          }
        }
        
        // Pattern 5: Try a more flexible approach - look for any dimension pattern and validate
        if (!productData.rollWidth || !productData.rollLength) {
          // Look for any pattern with quotes and validate which is which
          const pattern5 = /(\d+\.?\d*)\s*["']\s*(?:x|×|X)\s*(\d+\.?\d*)\s*["']/gi
          const matches5 = [...html.matchAll(pattern5)]
          console.log('🔍 Pattern 5 (flexible quotes) matches found:', matches5.length)
          for (const match of matches5) {
            console.log('🔍 Pattern 5 match:', match[0], '->', match[1], match[2], 'Full match:', match)
            if (match[1] && match[2]) {
              const firstNum = parseFloat(match[1])
              const secondNum = parseFloat(match[2])
              const fullMatch = match[0]
              
              // Check which quote type is used for each number
              // Look for double quote (") after first number = inches
              // Look for single quote (') after second number = feet
              const firstHasDoubleQuote = /(\d+\.?\d*)\s*["]/.test(fullMatch) || fullMatch.includes('&quot;')
              const secondHasSingleQuote = /[']/.test(fullMatch.split('x')[1] || fullMatch.split('×')[1] || '') || fullMatch.includes('&apos;')
              
              console.log('🔍 Quote analysis:', {
                firstNum,
                secondNum,
                firstHasDoubleQuote,
                secondHasSingleQuote,
                fullMatch,
                afterX: fullMatch.split(/x|×/i)[1]
              })
              
              // If first has double quote and second has single quote, that's correct
              if (firstHasDoubleQuote && secondHasSingleQuote) {
                if (firstNum >= 20 && firstNum <= 40 && secondNum >= 5 && secondNum <= 15) {
                  productData.rollWidth = firstNum
                  productData.rollLength = secondNum
                  console.log('✅ Extracted roll dimensions (pattern 5):', firstNum, 'inches x', secondNum, 'feet')
                  break
                }
              }
              // Also check if it's reversed (first has single quote, second has double quote)
              else if (!firstHasDoubleQuote && !secondHasSingleQuote) {
                // If neither pattern matches, check if numbers are in reasonable ranges
                // and assume first is width (inches) and second is length (feet)
                if (firstNum >= 20 && firstNum <= 40 && secondNum >= 5 && secondNum <= 15) {
                  productData.rollWidth = firstNum
                  productData.rollLength = secondNum
                  console.log('✅ Extracted roll dimensions (pattern 5, assumed):', firstNum, 'inches x', secondNum, 'feet')
                  break
                }
              }
            }
          }
        }
        
        // Final validation: if we have values but they seem swapped, swap them
        if (productData.rollWidth && productData.rollLength) {
          console.log('🔍 Final validation - Current values:', {
            rollWidth: productData.rollWidth,
            rollLength: productData.rollLength,
            widthInRange: productData.rollWidth >= 20 && productData.rollWidth <= 40,
            lengthInRange: productData.rollLength >= 5 && productData.rollLength <= 15
          })
          
          // Check if values are in correct ranges
          // Width should be 20-40 (inches), Length should be 5-15 (feet)
          const widthLooksLikeInches = productData.rollWidth >= 20 && productData.rollWidth <= 40
          const lengthLooksLikeFeet = productData.rollLength >= 5 && productData.rollLength <= 15
          const widthLooksLikeFeet = productData.rollWidth >= 5 && productData.rollWidth <= 15
          const lengthLooksLikeInches = productData.rollLength >= 20 && productData.rollLength <= 40
          
          // If width looks like feet (5-15) and length looks like inches (20-40), they're swapped
          if (widthLooksLikeFeet && lengthLooksLikeInches) {
            const temp = productData.rollWidth
            productData.rollWidth = productData.rollLength
            productData.rollLength = temp
            console.log('⚠️ Swapped dimensions - width was', temp, 'feet, length was', productData.rollWidth, 'inches')
            console.log('✅ Corrected roll dimensions:', productData.rollWidth, 'inches x', productData.rollLength, 'feet')
          }
          // If length is in inches range (20-40) and width is very small (< 5), they're swapped
          // This catches cases like: rollWidth=0.1, rollLength=30 (should be rollWidth=30, rollLength=8.8)
          else if (lengthLooksLikeInches && productData.rollWidth < 5) {
            const temp = productData.rollWidth
            productData.rollWidth = productData.rollLength
            productData.rollLength = temp
            console.log('⚠️ Swapped dimensions (length in inches range, width too small) - width was', temp, 'length was', productData.rollWidth)
            console.log('✅ Corrected roll dimensions:', productData.rollWidth, 'inches x', productData.rollLength, 'feet')
          }
          // If width is NOT in inches range (20-40) but length IS in feet range (5-15), swap
          else if (!widthLooksLikeInches && lengthLooksLikeFeet) {
            const temp = productData.rollWidth
            productData.rollWidth = productData.rollLength
            productData.rollLength = temp
            console.log('⚠️ Swapped dimensions (width not in range) - width was', temp, 'length was', productData.rollWidth)
            console.log('✅ Corrected roll dimensions:', productData.rollWidth, 'inches x', productData.rollLength, 'feet')
          }
          // If length is NOT in feet range (5-15) but width IS in inches range (20-40), swap
          else if (widthLooksLikeInches && !lengthLooksLikeFeet && lengthLooksLikeInches) {
            const temp = productData.rollWidth
            productData.rollWidth = productData.rollLength
            productData.rollLength = temp
            console.log('⚠️ Swapped dimensions (length not in range) - width was', temp, 'length was', productData.rollWidth)
            console.log('✅ Corrected roll dimensions:', productData.rollWidth, 'inches x', productData.rollLength, 'feet')
          }
        }

        // Extract product image/thumbnail - try multiple methods
        let imageUrl = null
        
        // Method 0: Look for Amazon CDN URLs directly (m.media-amazon.com)
        // Prefer main product images with _AC_SL (size large) over thumbnails
        const amazonCdnPattern = /https?:\/\/m\.media-amazon\.com\/images\/I\/[A-Z0-9a-z\-]+[^"'\s<>]*\.(jpg|jpeg|png|webp)/gi
        const cdnMatches = [...html.matchAll(amazonCdnPattern)]
        if (cdnMatches.length > 0) {
          // Filter and prioritize images:
          // 1. Prefer _AC_SL (size large) images - these are usually the main product images
          // 2. Avoid _AC_QL (quality low), _AC_UX (user experience), _AC_SX (size X), _AC_SY (size Y) - these are often thumbnails
          // 3. Prefer JPG over WebP for consistency
          const slImages = cdnMatches.filter(m => m[0].includes('_AC_SL'))
          const nonThumbnailImages = cdnMatches.filter(m => 
            !m[0].includes('_AC_QL') && 
            !m[0].includes('_AC_UX') && 
            !m[0].includes('_AC_SX') &&
            !m[0].includes('_AC_SY')
          )
          
          if (slImages.length > 0) {
            // Prefer JPG over WebP
            const jpgImage = slImages.find(m => m[0].match(/\.(jpg|jpeg)/i))
            imageUrl = jpgImage ? jpgImage[0] : slImages[0][0]
            console.log('✅ Found Amazon CDN image (SL size):', imageUrl)
          } else if (nonThumbnailImages.length > 0) {
            // Fallback to non-thumbnail images
            const jpgImage = nonThumbnailImages.find(m => m[0].match(/\.(jpg|jpeg)/i))
            imageUrl = jpgImage ? jpgImage[0] : nonThumbnailImages[0][0]
            console.log('✅ Found Amazon CDN image (non-thumbnail):', imageUrl)
          } else {
            // Last resort: use first image found
            imageUrl = cdnMatches[0][0]
            console.log('⚠️ Using first Amazon CDN image found:', imageUrl)
          }
        }
        
        // Method 1: Look for landingImage (main product image)
        if (!imageUrl) {
          const landingImagePatterns = [
            /<img[^>]*id="landingImage"[^>]*src="([^"]+)"/i,
            /<img[^>]*id="landingImage"[^>]*data-src="([^"]+)"/i,
            /<img[^>]*id="landingImage"[^>]*data-old-src="([^"]+)"/i,
          ]
          
          for (const pattern of landingImagePatterns) {
            const match = html.match(pattern)
            if (match && match[1]) {
              imageUrl = match[1]
              console.log('✅ Found landingImage:', imageUrl)
              break
            }
          }
        }
        
        // Method 2: Look for data-a-dynamic-image (contains multiple sizes)
        if (!imageUrl) {
          const dynamicImageMatch = html.match(/data-a-dynamic-image='([^']+)'/i) || 
                                    html.match(/data-a-dynamic-image="([^"]+)"/i)
          if (dynamicImageMatch && dynamicImageMatch[1]) {
            try {
              // Parse the JSON object that contains image URLs with their dimensions
              const imageData = JSON.parse(dynamicImageMatch[1].replace(/\\/g, ''))
              // The object keys are URLs, values are [width, height] arrays
              // Find the largest image (usually the main product image)
              const urls = Object.keys(imageData)
              if (urls.length > 0) {
                // Prefer Amazon CDN URLs with _AC_SL (size large)
                const slUrl = urls.find(url => url.includes('m.media-amazon.com') && url.includes('_AC_SL'))
                if (slUrl) {
                  imageUrl = slUrl
                  console.log('✅ Found dynamic image (SL):', imageUrl)
                } else {
                  // Find the largest image by dimensions
                  let largestUrl = urls[0]
                  let largestSize = 0
                  for (const url of urls) {
                    if (url.includes('m.media-amazon.com')) {
                      const dimensions = imageData[url]
                      if (Array.isArray(dimensions) && dimensions.length >= 2) {
                        const size = dimensions[0] * dimensions[1]
                        if (size > largestSize) {
                          largestSize = size
                          largestUrl = url
                        }
                      }
                    }
                  }
                  imageUrl = largestUrl
                  console.log('✅ Found dynamic image (largest):', imageUrl)
                }
              }
            } catch (e) {
              // If JSON parsing fails, try to extract URL directly
              // Prefer _AC_SL URLs
              const slUrlMatch = dynamicImageMatch[1].match(/https?:\/\/m\.media-amazon\.com\/[^"'\s]+_AC_SL\d+[^"'\s]*\.(jpg|jpeg|png)/i)
              const urlMatch = slUrlMatch || dynamicImageMatch[1].match(/https?:\/\/m\.media-amazon\.com\/[^"'\s]+/i) ||
                              dynamicImageMatch[1].match(/https?:\/\/[^"'\s]+/i)
              if (urlMatch) {
                imageUrl = urlMatch[0]
                console.log('✅ Extracted URL from dynamic image string:', imageUrl)
              }
            }
          }
        }
        
        // Method 3: Look for mainImage in JSON data
        if (!imageUrl) {
          const mainImageMatch = html.match(/"mainImage":\s*"([^"]+)"/i) ||
                                html.match(/"mainImage":\s*\{[^}]*"url":\s*"([^"]+)"/i)
          if (mainImageMatch && mainImageMatch[1]) {
            imageUrl = mainImageMatch[1]
            console.log('Found mainImage:', imageUrl)
          }
        }
        
        // Method 4: Look for a-dynamic-image class
        if (!imageUrl) {
          const dynamicClassMatch = html.match(/<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*src="([^"]+)"/i)
          if (dynamicClassMatch && dynamicClassMatch[1]) {
            imageUrl = dynamicClassMatch[1]
            console.log('Found a-dynamic-image class:', imageUrl)
          }
        }
        
        // Method 5: Look for data-src attribute
        if (!imageUrl) {
          const dataSrcMatch = html.match(/<img[^>]*data-src="([^"]+)"[^>]*class="[^"]*a-dynamic-image/i)
          if (dataSrcMatch && dataSrcMatch[1]) {
            imageUrl = dataSrcMatch[1]
            console.log('Found data-src:', imageUrl)
          }
        }
        
        // Method 6: Look for image in product images array
        if (!imageUrl) {
          const imagesArrayMatch = html.match(/"images":\s*\[[^\]]*"([^"]+\.(jpg|jpeg|png|webp))"/i)
          if (imagesArrayMatch && imagesArrayMatch[1]) {
            imageUrl = imagesArrayMatch[1]
            console.log('✅ Found image in images array:', imageUrl)
          }
        }
        
        // Method 7: Look for any m.media-amazon.com URL in the HTML (fallback)
        if (!imageUrl) {
          const anyAmazonImage = html.match(/https?:\/\/m\.media-amazon\.com\/images\/I\/[A-Z0-9]+[^"'\s<>]*\.(jpg|jpeg|png|webp)/i)
          if (anyAmazonImage && anyAmazonImage[0]) {
            imageUrl = anyAmazonImage[0]
            console.log('✅ Found Amazon CDN image (fallback):', imageUrl)
          }
        }
        
        // Clean up the URL
        if (imageUrl) {
          // Remove escaped characters
          imageUrl = imageUrl.replace(/\\u002F/g, '/')
                             .replace(/\\"/g, '"')
                             .replace(/\\'/g, "'")
                             .replace(/\\\//g, '/')
          
          // Extract URL from JSON string if needed
          if (imageUrl.includes('"')) {
            const urlMatch = imageUrl.match(/https?:\/\/[^"'\s<>]+/i)
            if (urlMatch) imageUrl = urlMatch[0]
          }
          
          // For Amazon CDN URLs, preserve the full URL including size parameters
          if (imageUrl.includes('m.media-amazon.com')) {
            // Keep the full URL, just clean up any trailing invalid characters
            imageUrl = imageUrl.split(/[,\s\]\}]/)[0].trim()
            // Ensure it ends with the file extension
            if (!imageUrl.match(/\.(jpg|jpeg|png|webp)(\?|$)/i)) {
              // If URL seems incomplete, try to find the complete one
              const completeUrl = html.match(new RegExp(imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^"\'\\s<>]*\\.(jpg|jpeg|png|webp)', 'i'))
              if (completeUrl) imageUrl = completeUrl[0]
            }
          }
          
          // Ensure it's a valid HTTP(S) URL
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            // Remove any trailing characters that aren't part of the URL
            imageUrl = imageUrl.split(/[,\s\]\}]/)[0].trim()
            productData.thumbnail = imageUrl
            console.log('✅ Final extracted thumbnail URL:', imageUrl)
          } else {
            console.log('⚠️ Invalid image URL format:', imageUrl)
          }
        } else {
          console.log('⚠️ No product image found in HTML')
        }
      } else {
        console.log('⚠️ Amazon returned non-OK status:', response.status, response.statusText)
      }
    } catch (fetchError: any) {
      console.log('❌ Could not fetch product page:', fetchError.message)
      console.log('This is expected if Amazon blocks direct scraping')
      // Continue with basic ASIN extraction
    }

    // Calculate cost per sqft if we have price and size
    if (productData.price && productData.size) {
      const sqftMatch = productData.size.match(/(\d+)/)
      if (sqftMatch) {
        const sqft = parseFloat(sqftMatch[1])
        if (sqft > 0) {
          productData.costPerSqft = (productData.price / sqft).toFixed(4)
        }
      }
    }

    return {
      success: true,
      data: productData,
      message: productData.title ? 'Product details extracted successfully.' : 'ASIN extracted successfully. Full product details require API integration.'
    }
  } catch (error: any) {
    console.error('Error processing Amazon product URL:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to process Amazon product URL'
    })
  }
})

