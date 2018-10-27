FROM node:alpine AS api-builder

RUN mkdir -p /build
COPY package.json ./build/
COPY src/ ./build/src

WORKDIR /build
RUN yarn install
RUN yarn build

FROM node:alpine
COPY --from=api-builder /build/package.json ./
COPY --from=api-builder /build/dist/js ./
COPY --from=api-builder /build/node_modules ./node_modules

ENTRYPOINT ["npm","run","start"]