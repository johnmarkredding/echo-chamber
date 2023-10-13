FROM node:18-bullseye-slim AS build-env
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci --omit=dev

FROM gcr.io/distroless/nodejs20-debian11
COPY --from=build-env /app/node_modules /app/node_modules
WORKDIR /app
COPY /src /src
CMD ["src/index.js"]