FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY go.mod ./
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/replio-api ./cmd/api

FROM alpine:3.21
RUN addgroup -S app && adduser -S -G app app
USER app
COPY --from=builder /out/replio-api /usr/local/bin/replio-api
EXPOSE 8080
CMD ["replio-api"]
