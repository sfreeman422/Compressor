FROM ubuntu:bionic

WORKDIR /usr/src/compressor
COPY package.json .
RUN apt-get update && apt-get -y install curl dirmngr apt-transport-https lsb-release ca-certificates
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN apt-get update && apt-get install -y software-properties-common && add-apt-repository ppa:stebbins/handbrake-git-snapshots && apt-get update -qq && apt-get install -qq handbrake-cli
COPY . .
RUN npm install --only=prod && npm run build
EXPOSE 3001
RUN mkdir /usr/src/compressor/dist/output
RUN mkdir /usr/src/compressor/dist/output/raw
RUN mkdir /usr/src/compressor/dist/output/compressed
ENV COMPRESSOR_DOWNLOAD_DIR=/usr/src/compressor/dist/output/raw
ENV COMPRESSOR_COMPRESSED_DIR=/usr/src/compressor/dist/output/compressed
CMD ["node", "./dist/index.js"]