# ---- Base image ----
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy the rest of the application source
COPY . .

# The app reads PORT from env, defaulting to 5000
ENV PORT=5000
EXPOSE 5000

# Run as the built-in non-root "node" user
USER node

CMD ["node", "server.js"]
