# Multi-stage build for Go application
FROM golang:1.23-alpine AS builder


# Set working directory
WORKDIR /app

# Copy go mod and sum files first (for better caching)
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage - minimal runtime image
FROM alpine:latest

# Install ca-certificates for HTTPS calls and curl for health checks
RUN apk --no-cache add ca-certificates curl

# Set working directory
WORKDIR /root/

# Copy binary from builder stage
COPY --from=builder /app/main .

# Expose port 8080
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Run the application
CMD ["./main"]
