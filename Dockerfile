FROM node:18-bullseye-slim AS build-env
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci --omit=dev

FROM gcr.io/distroless/nodejs20-debian11
COPY --from=build-env /app /app
WORKDIR /app
COPY . .
EXPOSE 8443
CMD ["src/index.js"]