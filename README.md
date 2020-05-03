# Compressor

Slack Extension to Compress Video Files into an easily viewable format

## Local Development

1. Add COMPRESSOR_DOWNLOAD_DIR and COMPRESSOR_COMPRESSED_DIR to your environment variables. These should be the paths in which you'd like your downloaded videos and compressed videos to live. These are temporary directories that will be cleaned up after each download and compression. Be sure that these directories exist and are writeable.
2. Set yourself up via Ngrok per Slack Docs: https://api.slack.com/tutorials/tunneling-with-ngrok
3. Add COMPRESSOR_BOT_TOKEN and COMPRESSOR_BOT_USER_TOKEN for your OAuth Access Token and Bot User OAuth Access Token respectively.
4. Npm install
5. Npm run start
6. Begin testing your app
