FROM node:18-alpine as installer
# Create app directory
WORKDIR /app
# Install app dependencies
COPY package*.json ./
COPY yarn.lock ./
RUN yarn

FROM node:18-alpine
WORKDIR /app
# copy from installer
COPY --chown=node:node --from=installer /app/node_modules ./node_modules
# app source
COPY --chown=node:node . .
# start server
RUN chmod -R 755 /app/script \
    && chown node:node /app
USER node
ENTRYPOINT ["/app/script/startup.sh"]