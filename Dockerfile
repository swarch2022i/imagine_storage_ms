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

ENV GCS_BUCKET=arqui
ENV GCS_FILE=clean-framework-340802-d71f73f1694f.json
ENV GCS_PROJECT_ID=clean-framework-340802
ENV GCS_ENDPOINT=https://storage.googleapis.com/

CMD [ "node", "server.js" ]