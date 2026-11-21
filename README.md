
# Basic Node.js HTTP Server

A basic HTTP server built with Node.js core modules (`node:http`, `node:fs/promises`, `node:path`) and `npm` scripts, created as a Node.js learning deliverable[cite: 1, 2, 3].

## Mentor Checklist Coverage

- **Basic HTTP server (`node:http`):** Handles incoming requests, routes by HTTP method and path, parses JSON request bodies, and returns JSON responses with appropriate status codes[cite: 1, 2, 3].
- **Node.js event loop:** Uses non-blocking asynchronous I/O so the single-threaded JavaScript execution stays responsive while disk and network operations run via libuv and the OS[cite: 1, 2, 3].
- **File read/write (`node:fs/promises`):** Initializes `data/items.json` and reads/writes items asynchronously on disk[cite: 1, 2, 3].
- **`npm` & `package.json` scripts:** Defines repeatable `start` and `dev` scripts in `package.json`[cite: 1, 2, 3].

## Project Structure

```text
.
├── .gitignore
├── package.json
├── README.md
└── server.js
