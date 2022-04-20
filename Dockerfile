FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080

ENV GCS_BUCKET=
ENV GCS_FILE=
ENV GCS_PROJECT_ID=
ENV GCS_ENDPOINT=https://storage.googleapis.com/

CMD [ "node", "server.js" ]