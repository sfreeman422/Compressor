import { ChatPostMessageArguments, FilesUploadArguments, WebClient } from '@slack/web-api';
import { createWriteStream, createReadStream, unlink } from 'fs';
import Axios, { AxiosResponse } from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { Writable } from 'stream';

export class WebService {
  public static getInstance(): WebService {
    if (!WebService.instance) {
      WebService.instance = new WebService();
    }
    return WebService.instance;
  }
  private static instance: WebService;
  private web: WebClient = new WebClient(process.env.COMPRESSOR_BOT_TOKEN);

  public isVideoFile(fileType: string): boolean {
    const videoTypes: string[] = [
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
    return videoTypes.includes(fileType);
  }

  public getFileInfo(file: string): Promise<any> {
    return this.web.files.info({ file });
  }

  public async startCompression(file: string, channel: string): Promise<void> {
    const fileInfo: any = await this.getFileInfo(file);

    if (this.isVideoFile(fileInfo.file.filetype)) {
      console.log('Filetype: ', fileInfo.file.filetype);
      // this.sendMessage(channel, 'Compressing...', info.file.shares.public[channel][0].ts);
      console.time('downloading and compressing took');
      const file = await this.downloadAndCompressFile(fileInfo.file.url_private_download, `${fileInfo.file.id}.mp4`);
      console.timeEnd('downloading and compressing took');
      // console.time('Compression took');
      // const compressedFile = await this.compressFile(file, `${info.file.id}`);
      // console.timeEnd('Compression took');
      console.log('Uploading...');
      await this.uploadVideoFile(channel, fileInfo.file.shares.public[channel][0].ts, file);
      this.cleanup(file);
    }
  }

  cleanup(file: string): void {
    unlink(file, () => console.log(`Successfully removed: ${file}`));
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

  downloadAndCompressFile(url: string, fileName: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const location = `${process.env.COMPRESSOR_DOWNLOAD_DIR}/${fileName}`;
      console.log('Download Location', location);
      const writer = createWriteStream(location);
      const response: AxiosResponse = await Axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers: {
          Authorization: `Bearer ${process.env.COMPRESSOR_BOT_TOKEN}`,
        },
      });
      const compress: Writable = ffmpeg()
        .format('mp4')
        .size('640x480')
        .fps(29.7)
        .autoPad()
        .pipe(writer)
        .on('error', (e: any) => {
          console.error('ffmpeg error');
          console.error(e);
        });

      response.data.pipe(compress);

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
