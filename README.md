# CarCanvas

CarCanvas is a ChatGPT widget written in React + TypeScript + Vite that displays car listings in an interactive carousel. It integrates with ChatGPT via the Model Context Protocol (MCP), allowing users to search and browse used car listings with images, pricing, mileage, and detailed information. 

The widget supports searching by make and miles.

The live version is available at [https://carcanvas.gaborcselle.com/](https://carcanvas.gaborcselle.com/), where you can also find instructions on how to set it up and use it.

## Setup

To add, go to:

ChatGPT > Settings > Apps and Connectors > Create

Type in:

Name: CarCanvas
MCP Server URL: `https://carcanvas.gaborcselle.com/api/mcp`
Auth: No Authentication
I understand and want to continue > Check
*Create*

## Architecture

This project is deployed on Vercel and uses Vercel's serverless functions for the MCP server endpoint. The frontend is a single-page React application that gets bundled into a single HTML file using Vite's single-file plugin.

### Deployment

- **Platform**: Vercel
- **Vercel Features Used**:
  - Serverless Functions: The `api/mcp.ts` file is automatically deployed as a Vercel serverless function at `/api/mcp`
  - Environment Variables: Uses `VERCEL_PROJECT_PRODUCTION_URL` to determine the base URL for fetching resources
- **`@modelcontextprotocol/sdk`** (^1.21.1): The official Model Context Protocol SDK
- **`mcp-handler`** (^1.0.3): A helper library that simplifies creating MCP handlers with tool and resource registration

### Key Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Carousel**: Embla Carousel React
- **Icons**: Lucide React
- **Data Parsing**: PapaParse (for CSV parsing)
- **Validation**: Zod (for schema validation)
- **Build**: Vite with `vite-plugin-singlefile` to bundle everything into a single HTML file
# carcanvas-chatgpt
