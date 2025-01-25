# FastAPI Ollama Proxy

A FastAPI server that acts as a proxy to Ollama, providing rate-limited access to local large language models.

## Overview

This project demonstrates how to run large language models locally using a sidecar pattern with:

- FastAPI server as the proxy/rate limiter
- Ollama as the model server
- deepseek-r1:7b as the language model

## Prerequisites

- Node.js 23+
- [Ollama](https://ollama.com) installed on the target machine for running the proxy
- At least 8GB RAM for running the model (used g4dn.xlarge on EC2)
- Docker

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run locally:

```bash
npm start
```

3. Run the server from docker (on Mac or Windows):

```bash
docker build -t node-ollama-proxy .
docker run --rm -p 8000:8000 -e OLLAMA_HOST=http://host.docker.internal:11434 -d node-ollama-proxy
```

On Linux and for simplicity, you can carefully use the following command to run the server:

```bash
docker run --rm --network host -e OLLAMA_HOST=http://localhost:11434 -d node-ollama-proxy
# deepseek-chat
