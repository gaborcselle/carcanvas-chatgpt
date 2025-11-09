import { z } from 'zod'
import { createMcpHandler } from 'mcp-handler'
import Papa from 'papaparse'

// Type for car listing
type CarListing = {
  VIN: string
  Year: string
  Make: string
  Model: string
  Type: string
  Trim: string
  Miles: string
  Price: string
  Location: string
  Dealership: string
  Engine: string
  Transmission: string
  Drivetrain: string
  "Exterior Color": string
  "Interior Color": string
  "Seating Capacity": string
  "Fuel Economy City": string
  "Fuel Economy Highway": string
  Features: string
  "Listing URL": string
  "Image URL 1": string
  "Image URL 2": string
  "Image URL 3": string
}

// Seeded random number generator
function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

// Shuffle array with a fixed seed
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array]
  const random = seededRandom(seed)
  
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

export async function fetchCarListingsCsv() {
  const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'
  const response = await fetch(`${BASE_URL}/listings.csv`)
  const csvText = await response.text()

  const result = Papa.parse<CarListing>(csvText, {
    header: true,
    skipEmptyLines: true,
  })
  
  return result.data
}

export function searchCarListings(
  listings: CarListing[],
  filters: {
    make?: string
    minYear?: number
    maxYear?: number
    model?: string
    type?: string
    minMiles?: number
    maxMiles?: number
    minPrice?: number
    maxPrice?: number
    location?: string
    dealership?: string
  }
): CarListing[] {
  const filtered = listings.filter(listing => {
    // Make filter (substring match) - skip if empty string
    if (filters.make && filters.make.trim() !== '' && !listing.Make.toLowerCase().includes(filters.make.toLowerCase())) {
      return false
    }

    // Year filters - handle invalid years
    const year = Number(listing.Year || '')
    if (isNaN(year) || !listing.Year || listing.Year.trim() === '') {
      // If year is invalid and filters are set, exclude this listing
      if (filters.minYear || filters.maxYear) {
        return false
      }
    } else {
      if (filters.minYear && year < filters.minYear) {
        return false
      }
      if (filters.maxYear && year > filters.maxYear) {
        return false
      }
    }

    // Model filter (substring match) - skip if empty string
    if (filters.model && filters.model.trim() !== '' && !listing.Model.toLowerCase().includes(filters.model.toLowerCase())) {
      return false
    }

    // Type filter (exact match)
    if (filters.type && listing.Type !== filters.type) {
      return false
    }

    // Miles filters
    const miles = Number(listing.Miles || '0')
    if (isNaN(miles)) {
      // If miles is invalid and filters are set, exclude this listing
      if (filters.minMiles || filters.maxMiles) {
        return false
      }
    } else {
      if (filters.minMiles && miles < filters.minMiles) {
        return false
      }
      if (filters.maxMiles && miles > filters.maxMiles) {
        return false
      }
    }

    // Price filters
    const price = Number(listing.Price || '0')
    if (isNaN(price)) {
      // If price is invalid and filters are set, exclude this listing
      if (filters.minPrice || filters.maxPrice) {
        return false
      }
    } else {
      if (filters.minPrice && price < filters.minPrice) {
        return false
      }
      if (filters.maxPrice && price > filters.maxPrice) {
        return false
      }
    }

    // Location filter (substring match) - skip if empty string
    if (filters.location && filters.location.trim() !== '' && !listing.Location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }

    // Dealership filter (substring match) - skip if empty string
    if (filters.dealership && filters.dealership.trim() !== '' && !listing.Dealership.toLowerCase().includes(filters.dealership.toLowerCase())) {
      return false
    }

    return true
  })
  
  // Shuffle results with a fixed seed for consistent randomization
  const FIXED_SEED = 42
  return shuffleWithSeed(filtered, FIXED_SEED)
}

const handler = createMcpHandler(
  (server) => {
    // register tools
    server.registerTool('echo', {
      description: '',
      _meta: {},
      title: '',
      inputSchema: {
        message: z.string()
      }
    }, async () => {
      return {
        content: [{ type: 'text', text: 'Echo!' }]
      }
    })

    // register resouce
    server.registerResource('car-listings-widget', 'ui://widget/car-listings.html', {}, async () => {
      const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'
      const response = await fetch(`${BASE_URL}/index.html`)
      const htmlContent = await response.text()

      return {
        contents: [
          {
            uri: 'ui://widget/car-listings.html',
            mimeType: 'text/html+skybridge',
            text: htmlContent,
            _meta: {
              'openai/widgetPrefersBorder': true,
              'openai/widgetDescription': 'Displays an interactive carousel of car listings with images, pricing, mileage, and detailed information for each vehicle.'
            }
          }
        ]
      }
    })

    // register tool to search car listings
    server.registerTool('searchCar', {
      title: 'Search for used cars',
      description: 'Search for car listings with optional filters. If no filters are provided, all listings are returned. All filter parameters are optional and can be combined.',
      inputSchema: {
        make: z.string().optional().describe('The make of the car to search for (substring match). Optional - if not provided, all makes are included. Examples: "BMW", "Ford", "Audi", "Toyota", "Chevrolet"'),
        minYear: z.number().optional().describe('The minimum year of the car. Optional - if not provided, no minimum year limit. Example: 2020'),
        maxYear: z.number().optional().describe('The maximum year of the car. Optional - if not provided, no maximum year limit. Example: 2025'),
        model: z.string().optional().describe('The model of the car to search for (substring match). Optional - if not provided, all models are included. Examples: "X1", "Edge", "Q7", "Camaro", "4Runner", "Equinox", "i4"'),
        type: z.enum(['SUV', 'convertible', 'coupe', 'minivan', 'sedan', 'truck']).optional().describe('The type of vehicle. Optional - if not provided, all types are included. Possible values: SUV, convertible, coupe, minivan, sedan, truck'),
        minMiles: z.number().optional().describe('The minimum mileage of the car. Optional - if not provided, no minimum mileage limit. Example: 10000'),
        maxMiles: z.number().optional().describe('The maximum mileage of the car. Optional - if not provided, no maximum mileage limit. Example: 50000'),
        minPrice: z.number().optional().describe('The minimum price of the car. Optional - if not provided, no minimum price limit. Example: 20000'),
        maxPrice: z.number().optional().describe('The maximum price of the car. Optional - if not provided, no maximum price limit. Example: 50000'),
        location: z.string().optional().describe('The location to search for (substring match). Optional - if not provided, all locations are included. Examples: "Oakland CA", "Berkeley CA", "San Francisco CA"'),
        dealership: z.string().optional().describe('The dealership name to search for (substring match). Optional - if not provided, all dealerships are included. Examples: "Audi Oakland", "Toyota of Berkeley", "Royal Motors SF"')
      },
      _meta: {
        'openai/outputTemplate': 'ui://widget/car-listings.html',
				'openai/toolInvocation/invoking': 'Searching for cars...',
				'openai/toolInvocation/invoked': 'Found car listings',
      }
    }, async (filters) => {
      const listings = await fetchCarListingsCsv()
      const results = searchCarListings(listings, filters)

      return {
        content: [{ type: 'text', text: `Found ${results.length} cars matching your criteria.` }],
        structuredContent: {
          count: results.length,
          listings: results
        },
        _meta: {
          'openai/toolInvocation/invoking': 'Searching for cars...',
          'openai/toolInvocation/invoked': `Found ${results.length} car listings`
        }
      }
    })

  },
  {},
  { basePath: '/api', verboseLogs: true }
)

const wrappedHandler = async (req: Request) => {
  const res = await handler(req)
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, mcp-protocol-version')
  return res
}

export { wrappedHandler as GET, wrappedHandler as POST }

export function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, mcp-protocol-version',
    }
  })
}
