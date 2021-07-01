import path from 'path';
import cp from 'child_process';
import { Readable, Writable } from 'stream';
import ytdl, { videoInfo } from 'ytdl-core';
import ffmpeg from 'ffmpeg-static';

import unclutterTitle from '../utils/unclutterTitle';
import itunesSearch from '../utils/itunesSearch';
import createSearchData from '../utils/createSearchData';
import getMetadataParams from '../utils/getMetadataParams';
import generateFileName from '../utils/generateFileName';
import trash from './Trash';

import SearchData from '../types/SearchData';

class Core {
  process?: cp.ChildProcess;

  streams: { source: Readable; target: Writable }[];

  fileName?: string;

  // eslint-disable-next-line no-unused-vars
  onProgress?: (percent: number) => void;

  constructor() {
    this.streams = [];
  }

  public kill() {
    this.streams.forEach((stream) => {
      stream.source.unpipe(stream.target);
    });

    setTimeout(async () => {
      this.process?.kill();
      if (this.fileName) {
        trash.add(this.fileName);
      }
    }, 200);
  }

  public async audio(info: videoInfo, mw: boolean): Promise<string> {
    let mwStatus = mw;

    let metadata: SearchData = {};
    if (mwStatus) {
      const title = unclutterTitle(info.videoDetails.title);
      const search = await itunesSearch(title);
      if (search) {
        metadata = createSearchData(search);
      } else {
        mwStatus = false;
      }
    }

    const astream = ytdl.downloadFromInfo(info, { quality: 'highestaudio' });

    this.fileName = generateFileName(info, 'audio', mwStatus, metadata);

    this.process = cp.spawn(
      ffmpeg,
      Array.prototype.concat(
        ['-loglevel', '8', '-hide_banner'],

        // Inputs
        ['-i', 'pipe:3'],
        ...(mwStatus && metadata.cover ? ['-i', metadata.cover] : []),

        // Codecs
        ['-preset', 'fast'],

        // Metadata
        ...(mwStatus ? getMetadataParams(metadata) : []),

        // Output
        [path.join('temp', this.fileName)]
      ),
      {
        windowsHide: true,
        stdio: [
          'inherit', // stdin
          'inherit', // stdout
          'inherit', // stderr

          'pipe', // pipe:3 -> audio
        ],
      }
    );

    if (this.process === undefined) {
      throw new Error('could not start conversion process');
    }

    astream.on('progress', (_, downloaded: number, total: number) => {
      const percent = Math.floor((downloaded / total) * 100);
      if (this.onProgress) {
        this.onProgress(percent);
      }
    });

    this.process.on('spawn', () => {
      console.log(`[ffmpeg@${this.process!.pid}] is now handling the request`);
    });

    const result = await new Promise<Error | null>((resolve) => {
      astream.pipe(this.process!.stdio[3] as Writable);
      this.streams.push({
        source: astream,
        target: this.process!.stdio[3] as Writable,
      });

      this.process!.on('error', (error) => {
        resolve(error);
      });

      this.process!.on('close', () => {
        resolve(null);
      });
    });

    if (result !== null) {
      throw result;
    } else {
      return this.fileName;
    }
  }

  public async video(info: videoInfo): Promise<string> {
    const astream = ytdl.downloadFromInfo(info, { quality: 'highestaudio' });
    const vstream = ytdl.downloadFromInfo(info, { quality: 'highestvideo' });

    this.fileName = generateFileName(info, 'video', false);

    this.process = cp.spawn(
      ffmpeg,
      Array.prototype.concat(
        ['-loglevel', '8', '-hide_banner'],

        // Inputs
        ['-i', 'pipe:3'],
        ['-i', 'pipe:4'],

        // Codecs
        ['-c:v', 'copy'],
        ['-c:a', 'aac'],
        ['-preset', 'fast'],

        // Output
        [path.join('temp', this.fileName)]
      ),
      {
        windowsHide: true,
        stdio: [
          'inherit', // stdin
          'inherit', // stdout
          'inherit', // stderr

          'pipe', // pipe:3 -> video
          'pipe', // pipe:4 -> audio
        ],
      }
    );

    if (this.process === undefined) {
      throw new Error('could not start conversion process');
    }

    vstream.on('progress', (_, downloaded: number, total: number) => {
      const percent = Math.floor((downloaded / total) * 100);
      if (this.onProgress) {
        this.onProgress(percent);
      }
    });

    this.process.on('spawn', () => {
      console.log(`[ffmpeg@${this.process!.pid}] is now handling the request`);
    });

    const result = await new Promise<Error | null>((resolve) => {
      vstream.pipe(this.process!.stdio[3] as Writable);
      this.streams.push({
        source: vstream,
        target: this.process!.stdio[3] as Writable,
      });

      astream.pipe(this.process!.stdio[4] as Writable);
      this.streams.push({
        source: astream,
        target: this.process!.stdio[4] as Writable,
      });

      this.process!.on('error', (error) => {
        resolve(error);
      });

      this.process!.on('close', () => {
        resolve(null);
      });
    });

    if (result !== null) {
      throw result;
    } else {
      return this.fileName;
    }
  }
}

export default Core;
