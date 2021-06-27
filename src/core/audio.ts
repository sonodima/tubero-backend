import path from 'path';
import cp from 'child_process';
import crypto from 'crypto';
import ytdl, { videoInfo } from 'ytdl-core';
import ffmpeg from 'ffmpeg-static';

import unclutterTitle from '../utils/unclutterTitle';
import itunesSearch from '../utils/itunesSearch';
import createSearchData from '../utils/createSearchData';
import getMetadataParams from '../utils/getMetadataParams';

import SearchData from '../types/SearchData';

async function audio(
  info: videoInfo,
  mw: boolean,
  // eslint-disable-next-line no-unused-vars
  onProgress: (percent: number) => void
): Promise<string> {
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

  const id = crypto.randomBytes(16).toString('hex');
  const fileName = `${id}@${
    mwStatus ? metadata.title : info.videoDetails.title
  }.mp3`;

  const ffproc = cp.spawn(
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
      [path.join('temp', fileName)]
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

  astream.on('progress', (_, downloaded: number, total: number) => {
    const percent = (downloaded / total) * 100;
    onProgress(percent);
  });

  ffproc.on('spawn', () => {
    console.log(`[ffmpeg@${ffproc.pid}] is now handling the request`);
  });

  const result = await new Promise<Error | null>((resolve) => {
    astream.pipe(ffproc.stdio[3] as any);

    ffproc.on('error', (error) => {
      resolve(error);
    });

    ffproc.on('close', () => {
      resolve(null);
    });
  });

  if (result !== null) {
    throw result;
  } else {
    return fileName;
  }
}

export default audio;
