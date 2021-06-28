import path from 'path';
import cp from 'child_process';
import ytdl, { videoInfo } from 'ytdl-core';
import ffmpeg from 'ffmpeg-static';

import generateFileName from '../utils/generateFileName';

async function video(
  info: videoInfo,
  // eslint-disable-next-line no-unused-vars
  onProgress: (percent: number) => void
): Promise<string> {
  const astream = ytdl.downloadFromInfo(info, { quality: 'highestaudio' });
  const vstream = ytdl.downloadFromInfo(info, { quality: 'highestvideo' });

  const fileName = generateFileName(info, 'video', false);

  const ffproc = cp.spawn(
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
      [path.join('temp', fileName)]
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

  vstream.on('progress', (_, downloaded: number, total: number) => {
    const percent = (downloaded / total) * 100;
    onProgress(percent);
  });

  ffproc.on('spawn', () => {
    console.log(`[ffmpeg@${ffproc.pid}] is now handling the request`);
  });

  const result = await new Promise<Error | null>((resolve) => {
    vstream.pipe(ffproc.stdio[3] as any);
    astream.pipe(ffproc.stdio[4] as any);

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

export default video;
