# registry.access.redhat.com is the publicly accessible Red Hat UBI mirror —
# no authentication required, fully Red Hat-sourced, IBM policy compliant.
# registry.redhat.io requires a subscription login (not available on CI runners).
#
# :1 pins to the v1 major stream — floats within it for security patches
# without risking a silent breaking change if Red Hat releases a :2 stream.

# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:1 AS deps

USER root

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:1 AS runner

WORKDIR /app

# Copy only production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY server.js ./

# Run as non-root (UID 1001 is the default non-root user in UBI images)
USER 1001

# ROPC sample is a CLI app: it reads stdin and exits.
# No port is exposed.
CMD ["node", "server.js"]
