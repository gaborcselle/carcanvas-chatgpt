import { useEffect, useState } from 'react'
import './App.css'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useWidgetProps } from './hooks/useWidgetProps'
import useEmblaCarousel from 'embla-carousel-react'

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

function App() {
  const data = useWidgetProps({ count: -1, listings: [] })
	const listings = data?.listings || [] as CarListing[]
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "center",
		loop: false,
		containScroll: "trimSnaps",
		slidesToScroll: "auto",
		dragFree: false,
	})
	const [canPrev, setCanPrev] = useState(false)
	const [canNext, setCanNext] = useState(false)

  const [hasBeenLoaded, setHasBeenLoaded] = useState(false)
  const [comingFromOpenAI, setComingFromOpenAI] = useState(false)

  useEffect(() => {
    setHasBeenLoaded(true)
    if (window.openai) {
      setComingFromOpenAI(true)
    }
  }, [])

  useEffect(() => {
		if (!emblaApi) return
		const updateButtons = () => {
			setCanPrev(emblaApi.canScrollPrev())
			setCanNext(emblaApi.canScrollNext())
		}
		updateButtons()
		emblaApi.on("select", updateButtons)
		emblaApi.on("reInit", updateButtons)
		return () => {
			emblaApi.off("select", updateButtons)
			emblaApi.off("reInit", updateButtons)
		}
	}, [emblaApi])

  if (hasBeenLoaded === false) {
    return (
      <div className="size-full p-24 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!comingFromOpenAI) {
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto mb-16">
          <h1 className="text-center text-5xl font-bold mb-6 flex items-center justify-center gap-3">
            <img src="/favicon.svg" alt="CarCanvas Icon" className="w-12 h-12 rounded-lg" />
            CarCanvas
          </h1>
          <img src="https://carcanvas.gaborcselle.com/homepage_instructions/carcanvas_example.jpg" className="border border-gray-200 mb-8" alt="CarCanvas Usage Example" />
          <p className="text-center text-lg text-gray-700 mb-4">
            CarCanvas is a ChatGPT app written in React + TypeScript + Vite that displays car listings in an interactive carousel. It integrates with ChatGPT via the Model Context Protocol (MCP), allowing users to search and browse used car listings with images, pricing, mileage, and detailed information.
          </p>
          <p className="text-center text-base text-gray-600 mb-4">
            Code available at{' '}
            <a href="https://github.com/gaborcselle/carcanvas-chatgpt" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline">
              https://github.com/gaborcselle/carcanvas-chatgpt
            </a>
          </p>          
        </div>
        <h2 className="text-center text-6xl font-bold mb-12">
          Setup 
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <b>First, go to ChatGPT &gt; Settings &gt; Apps and Connectors &gt; Advanced</b>
            <img src="https://carcanvas.gaborcselle.com/homepage_instructions/carcanvas_setup_0.jpg" className="border border-gray-200 rounded" />
          </div>
          <div className="flex flex-col gap-4">
            <b>To add, go to: </b>
            <span>ChatGPT &gt; Settings &gt; Apps and Connectors &gt; Create</span>
            <b>Type in:</b>
            <p><b>Name:</b> CarCanvas<br />
  <b>MCP Server URL:</b> <code>https://carcanvas.gaborcselle.com/api/mcp</code><br />
<b>Auth:</b> No Authentication<br />
I understand and want to continue &gt; Check</p>
            <img src="https://carcanvas.gaborcselle.com/homepage_instructions/carcanvas_setup_1.jpg" className="border border-gray-200 rounded max-w-128" />
          </div>
        </div>
        <h2 className="text-center text-6xl font-bold mb-12 mt-24">
          Usage
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <img src="https://carcanvas.gaborcselle.com/homepage_instructions/carcanvas_usage_1.jpg" className="border border-gray-200 rounded" />
          </div>
          <div className="flex flex-col gap-4">
            <img src="https://carcanvas.gaborcselle.com/homepage_instructions/carcanvas_usage_2.jpg" className="border border-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (data.count === -1) {
    return (
      <div className="size-full p-24 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  } else if (listings.length === 0) {
    return (
      <div className="size-full p-24 flex items-center justify-center">
        <p>No car listings found.</p>
      </div>
    )
  }

  return (
    <>
      <div className="relative w-full bg-white text-black p-6">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4 items-stretch">
            {listings.map((car: CarListing, index) => (
              <div key={`${car['Make']}-${car['Model']}-${index}`} className="min-w-2xs max-w-2xs self-stretch flex flex-col select-none">
                <div className="w-full">
                  <img src={`${'https://carcanvas.gaborcselle.com'}/images/${car['Image URL 1']}`} className="w-full aspect-square rounded-lg object-cover" />
                </div>
                <div className="mt-2 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold line-clamp-2">{car.Year} {car.Make} {car.Model} {car.Trim}</h2>
                  <p className="text-sm text-gray-600 mt-1 flex-1">{Number(car.Miles || '0').toLocaleString()} miles • {car.Location}</p>
                  <p className="text-md font-medium mt-2">${Number(car.Price || '0').toLocaleString()}</p>
                </div>
                <a href={car['Listing URL']} target="_blank" rel="noreferrer" className="mt-4 inline-block bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                  {car['Dealership'] || 'View Listing'}
                </a>
              </div>
            ))}
          </div>
        </div>
        {/* Navigation buttons */}
			{canPrev && (
				<button
					aria-label="Previous"
					style={{
						position: "absolute",
						left: "8px",
						top: "50%",
						transform: "translateY(-50%)",
						zIndex: 10,
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						height: "32px",
						width: "32px",
						borderRadius: "9999px",
						background: "white",
						color: "black",
						boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
						border: "1px solid rgba(0,0,0,0.05)",
						cursor: "pointer"
					}}
					onClick={() => emblaApi && emblaApi.scrollPrev()}
					type="button"
				>
					<ArrowLeft strokeWidth={1.5} style={{ height: "18px", width: "18px" }} aria-hidden="true" />
				</button>
			)}
			{canNext && (
				<button
					aria-label="Next"
					style={{
						position: "absolute",
						right: "8px",
						top: "50%",
						transform: "translateY(-50%)",
						zIndex: 10,
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						height: "32px",
						width: "32px",
						borderRadius: "9999px",
						background: "white",
						color: "black",
						boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
						border: "1px solid rgba(0,0,0,0.05)",
						cursor: "pointer"
					}}
					onClick={() => emblaApi && emblaApi.scrollNext()}
					type="button"
				>
					<ArrowRight strokeWidth={1.5} style={{ height: "18px", width: "18px" }} aria-hidden="true" />
				</button>
			)}
      </div>
    </>
  )
}

export default App
