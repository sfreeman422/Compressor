FROM ubuntu:bionic

WORKDIR /usr/src/compressor
COPY package.json .
RUN apt-get update && apt-get -y install curl dirmngr apt-transport-https lsb-release ca-certificates
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN apt-get update && apt-get install ffmpeg
COPY . .
RUN npm install --only=prod && npm run build
EXPOSE 3001
CMD ["node", "./dist/index.js"]