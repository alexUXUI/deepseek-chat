import http from "http";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Add this to get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const MODEL = "deepseek-r1:7b";
const PORT = process.env.PORT || 8000;

// Helper function to stream data to the client
async function streamResponse(req, res) {
  const { prompt } = JSON.parse(req.body);

  if (!prompt || typeof prompt !== "string") {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Invalid prompt: A non-empty string is required.",
      })
    );
    return;
  }

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      res.writeHead(response.status, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: `Error from Ollama: ${response.statusText}` })
      );
      return;
    }

    res.writeHead(200, { "Content-Type": "text/plain" });

    for await (const chunk of response.body) {
      res.write(chunk);
    }

    res.end();
  } catch (err) {
    console.error("Error:", err.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

// Add CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Simple HTTP server
const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // Add CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Clean up URL to handle potential query parameters
  const urlPath = req.url.split("?")[0];

  // Serve index.html for root path and explicit index.html requests
  if (req.method === "GET" && (urlPath === "/" || urlPath === "/index.html")) {
    fs.readFile(path.join(__dirname, "index.html"), (err, content) => {
      if (err) {
        console.error("Error reading index.html:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/generate") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      req.body = body;
      streamResponse(req, res);
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
