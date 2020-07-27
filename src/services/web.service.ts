import { ChatPostMessageArguments, FilesUploadArguments, WebClient, FilesInfoArguments } from '@slack/web-api';
import { createWriteStream, createReadStream, unlink } from 'fs';
import Axios from 'axios';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import hbjs from 'handbrake-js';

export class WebService {
  public static getInstance(): WebService {
    if (!WebService.instance) {
      WebService.instance = new WebService();
    }
    return WebService.instance;
  }
  private static instance: WebService;
  private web: WebClient = new WebClient(process.env.COMPRESSOR_BOT_TOKEN);
  private videoTypes: string[] = [
    'mkv',
    'flv',
    'vob',
    'ogv',
    'ogg',
    'drc',
    'mng',
    'avi',
    'mov',
    'qt',
    'wmv',
    'yuv',
    'rm',
    'rmvb',
    'asf',
    'amv',
    'mp4',
    'm4p',
    'm4v',
    'mpg',
    'mp2',
    'mpeg',
    'mpe',
    'mpv',
    'mpg',
    'mpeg',
    'm2v',
    'm4v',
    'svi',
    '3gp',
    '3g2',
    'mxf',
    'roq',
    'nsv',
    'f4v',
    'f4p',
    'f4a',
    'f4b',
  ];

  public isVideoFile(fileType: string): boolean {
    return this.videoTypes.includes(fileType.toLowerCase());
  }

  public async startCompression(file: string, channel: string): Promise<void> {
    const options: FilesInfoArguments = {
      file,
    };

    return await this.web.files
      .info(options)
      .then(async (info: any) => {
        console.log('Filetype: ', info.file.filetype);
        if (this.isVideoFile(info.file.filetype)) {
          console.log('Filetype is video, beginning download...');
          // this.sendMessage(channel, 'Compressing...', info.file.shares.public[channel][0].ts);
          console.time('Downloading took');
          const file = await this.downloadFile(info.file.url_private_download, `${info.file.id}.${info.file.filetype}`);
          console.timeEnd('Downloading took');
          console.time('Compression took');
          const compressedFile = await this.compressFile(file, `${info.file.id}`);
          console.timeEnd('Compression took');
          console.log('Uploading...');
          await this.uploadVideoFile(channel, info.file.shares.public[channel][0].ts, compressedFile);
          this.cleanup(file, compressedFile);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  cleanup(raw: string, compressed: string): void {
    unlink(raw, () => console.log(`Successfully removed: ${raw}`));
    unlink(compressed, () => console.log(`Successfully removed: ${compressed}`));
  }

  uploadVideoFile(channel: string, ts: string, location: string): Promise<void> {
    const uploadRequest: FilesUploadArguments = {
      channels: channel,
      file: createReadStream(location),
      token: process.env.COMPRESSOR_BOT_USER_TOKEN,
      // eslint-disable-next-line @typescript-eslint/camelcase
      thread_ts: ts,
    };
    return new Promise((resolve, reject) => {
      console.time('Upload took');
      this.web.files
        .upload(uploadRequest)
        .then(() => {
          console.timeEnd('Upload took');
          resolve();
        })
        .catch((e) => {
          console.error(e);
          reject(e);
        });
    });
  }

  compressFile(rawLocation: string, fileName: string): Promise<string> {
    const location = `${process.env.COMPRESSOR_COMPRESSED_DIR}/${fileName}.mp4`;
    console.log('Compress Location', location);
    return new Promise((resolve, reject) => {
      hbjs
        .spawn({
          input: rawLocation,
          output: location,
          preset: 'Very Fast 480p30',
        })
        .on('error', (e: Error) => reject(e))
        .on('end', () => resolve(location));
    });
  }

  downloadFile(url: string, fileName: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const location = `${process.env.COMPRESSOR_DOWNLOAD_DIR}/${fileName}`;
      console.log('Download Location', location);
      const writer = createWriteStream(location);
      const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers: {
          Authorization: `Bearer ${process.env.COMPRESSOR_BOT_TOKEN}`,
        },
      });
      response.data.pipe(writer);

      writer.on('finish', () => resolve(location));
      writer.on('error', (e) => reject(e));
    });
  }
  /**
   * Handles sending messages to the chat.
   */
  public sendMessage(channel: string, text: string, threadTimeStamp: string): void {
    const token: string | undefined = process.env.COMPRESSOR_BOT_USER_TOKEN;
    const postRequest: ChatPostMessageArguments = {
      token,
      channel,
      text,
      // eslint-disable-next-line @typescript-eslint/camelcase
      thread_ts: threadTimeStamp,
    };
    this.web.chat.postMessage(postRequest).catch((e) => console.error(e));
  }
}
