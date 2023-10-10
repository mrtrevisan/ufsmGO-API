FROM node:18-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
COPY yarn.lock ./
RUN yarn

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "yarn", "server" ]