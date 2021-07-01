import { Request, Response } from 'express';
import ytdl, { videoInfo } from 'ytdl-core';

import isId from '../utils/isId';

import InfoQuery from '../types/InfoQuery';
import InfoResponse from '../types/InfoResponse';

async function info(
  req: Request<{}, {}, {}, InfoQuery>,
  res: Response<InfoResponse>
): Promise<any> {
  if (req.query.v === undefined) {
    res.status(400).json({
      error: 'parameter [v] is required',
    });
    return;
  }

  if (!isId(req.query.v)) {
    res.status(400).json({
      error: 'parameter [v] is not a valid id',
    });
    return;
  }

  let vinfo: videoInfo;
  try {
    vinfo = await ytdl.getBasicInfo(req.query.v);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: 'could not fetch video',
    });
    return;
  }

  res.status(200).json({
    title: vinfo.videoDetails.title,
    author: vinfo.videoDetails.author.name,
    thumbnail:
      vinfo.videoDetails.thumbnails[vinfo.videoDetails.thumbnails.length - 1]
        .url,
  });
}

export default info;
