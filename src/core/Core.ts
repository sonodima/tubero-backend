import path from 'path';
import fsp from 'fs/promises';
import * as youtubedl from 'youtube-dl-exec';
import id3 from 'node-id3';

import unclutterTitle from '../utils/unclutterTitle';
import itunesSearch from '../utils/itunesSearch';
import createSearchData from '../utils/createSearchData';
import generateFileName from '../utils/generateFileName';
import downloadFile from '../utils/downloadFile';

import Converter from './Converter';
import trash from './Trash';

import SearchData from '../types/SearchData';
import ProgressData from '../types/ProgressData';

class Core {
  converter: Converter;

  fileName?: string;

  // eslint-disable-next-line no-unused-vars
  onProgress?: (progress: ProgressData) => void;

  constructor() {
    this.converter = new Converter();
  }

  public kill() {
    this.converter.process?.cancel();
    if (this.fileName) {
      trash.add(this.fileName);
    }
  }

  public async audio(info: youtubedl.YtResponse, mw: boolean): Promise<string> {
    let mwStatus = mw;

    let metadata: SearchData = {};
    if (mwStatus) {
      const title = unclutterTitle(info.title);
      const search = await itunesSearch(title);
      if (search) {
        metadata = createSearchData(search);
      } else {
        mwStatus = false;
      }
    }

    this.converter.onProgress = this.onProgress;
    this.fileName = generateFileName(info.title, mwStatus, metadata);

    await this.converter.execute(info.id, {
      extractAudio: true,
      audioFormat: 'mp3',

      ...(!mwStatus && { addMetadata: true, embedThumbnail: true }),

      output: path.join('temp', `${this.fileName}.%(ext)s`),
    });

    if (mwStatus) {
      const coverPath = path.join('temp', `${this.fileName}.jpg`);

      if (this.onProgress) {
        this.onProgress({
          phase: 'cover',
        });
      }

      let hasCover = false;
      if (metadata.cover) {
        try {
          await downloadFile(metadata.cover, coverPath);
          hasCover = true;
        } catch (error) {
          console.warn(error.message);
        }
      }

      if (this.onProgress) {
        this.onProgress({
          phase: 'metadata',
        });
      }

      const tags = {
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        genre: metadata.genre,
        year: metadata.releaseDate,
        ...(hasCover ? { APIC: coverPath } : {}),
        TRCK: `${metadata.trackNumber}/${metadata.tracksCount}`,
        TPOS: `${metadata.discNumber}/${metadata.discsCount}`,
      };

      const success = id3.write(
        tags,
        path.join('temp', `${this.fileName}.mp3`)
      );

      try {
        await fsp.rm(coverPath);
      } catch (error) {
        console.warn(`could not remove file: ${coverPath}`);
      }

      if (!success) {
        console.warn((success as Error).message);
      }
    }

    return `${this.fileName}.mp3`;
  }

  public async video(info: youtubedl.YtResponse): Promise<string> {
    this.converter.onProgress = this.onProgress;
    this.fileName = generateFileName(info.title, false);

    await this.converter.execute(info.id, {
      mergeOutputFormat: 'mp4',
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]',

      output: path.join('temp', `${this.fileName}.%(ext)s`),
    });

    return `${this.fileName}.mp4`;
  }
}

export default Core;
