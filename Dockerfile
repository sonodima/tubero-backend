#
# build stage
#
# FROM node:14-buster-slim AS build
FROM node:14-alpine AS build
WORKDIR /app
# install all dependencies
COPY package*.json ./
RUN npm install
# build the application
COPY tsconfig.json ./
COPY src /app/src
RUN npm run build

#
# deps stage
#
# FROM node:14-buster-slim AS deps
FROM node:14-alpine AS deps
WORKDIR /app
# install the required production dependencies
COPY package*.json ./
RUN npm install --production

#
# final stage
#
# FROM node:14-buster-slim
FROM node:14-alpine
WORKDIR /app
# copy data from the previous stages
COPY --from=deps /app/node_modules ./node_modules/
COPY --from=build /app/dist ./dist/
# set port and start command
EXPOSE 8080
CMD [ "node", "./dist/main.js" ]