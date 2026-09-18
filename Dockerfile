# NOTE: For production/CI use registry.redhat.io/ubi9/nodejs-22-minimal:latest
# (requires `docker login registry.redhat.io` with a Red Hat account).
# node:22-slim (Debian) is used here for local/CI runner compatibility.
# Alpine is NOT suitable: readline-sync's read.sh requires perl and a full
# stty implementation, neither of which are available in busybox/Alpine.

# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:22-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:22-slim AS runner

WORKDIR /app

# Copy only production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY server.js ./

# Run as non-root (node user is built into the official node image)
USER node

# ROPC sample is a CLI app: it reads stdin and exits.
# Start with -i so stdin can be piped in by the test runner.
# No port is exposed.
CMD ["node", "server.js"]
