import crypto from 'crypto';
import ytdl from 'ytdl-core';

import SearchData from '../types/SearchData';

function generateFileName(
  info: ytdl.videoInfo,
  format: 'audio' | 'video',
  mw: boolean,
  metadata?: SearchData
) {
  const id = crypto.randomBytes(16).toString('hex');
  let fileName = `${id}@${
    mw && metadata ? metadata.title : info.videoDetails.title
  }`;

  if (format === 'audio') {
    fileName += '.mp3';
  } else if (format === 'video') {
    fileName += '.mp4';
  }

  return fileName;
}

export default generateFileName;
