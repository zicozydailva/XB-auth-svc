# Dockerfile

# Stage 1: Build the application
FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN yarn install

# Copy source files
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Run the application
FROM node:18-alpine

WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Set environment variables (optional)
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the NestJS application
CMD ["node", "dist/main"]
