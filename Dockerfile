FROM node:14.1.0-stretch

WORKDIR /usr/src/compressor
COPY package.json .
RUN apt-get update && apt-get install -y software-properties-common
RUN add-apt-repository --yes ppa:stebbins/handbrake-releases
RUN apt-get install -qq handbrake-cli
COPY . .
RUN npm install --only=prod && npm run build
EXPOSE 3001
RUN mkdir /usr/src/compressor/dist/output
RUN mkdir /usr/src/compressor/dist/output/raw
RUN mkdir /usr/src/compressor/dist/output/compressed
ENV COMPRESSOR_DOWNLOAD_DIR=/usr/src/compressor/dist/output/raw
ENV COMPRESSOR_COMPRESSED_DIR=/usr/src/compressor/dist/output/compressed
CMD ["node", "./dist/index.js"]