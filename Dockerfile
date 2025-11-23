# Stage 1: Build the application
FROM node:lts-alpine AS builder

WORKDIR /app

# Copy server package.json and package-lock.json
COPY server/package.json server/package-lock.json ./server/

# Install all dependencies and build the server
RUN cd server && npm install
COPY server/ ./server/
RUN cd server && npm run build

# Stage 2: Create the production image
FROM node:lts-alpine

WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy only the built application and production dependencies from the builder stage
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/build ./build
COPY --from=builder /app/server/package.json ./package.json

EXPOSE 3000
CMD ["node", "build/index.js"]
