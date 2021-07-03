import { Request, Response } from 'express';
import youtubedl, { YtResponse } from 'youtube-dl-exec';

import isId from '../utils/isId';

import InfoQuery from '../types/InfoQuery';
import InfoResponse from '../types/InfoResponse';

async function info(
  req: Request<{}, {}, {}, InfoQuery>,
  res: Response<InfoResponse>
): Promise<any> {
  if (req.query.v === undefined) {
    res.status(400).json({
      error: 'Parameter [v] is required',
    });
    return;
  }

  if (!isId(req.query.v)) {
    res.status(400).json({
      error: 'Parameter [v] is not a valid id',
    });
    return;
  }

  let vinfo: YtResponse;
  try {
    vinfo = await youtubedl(req.query.v, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      youtubeSkipDashManifest: true,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Could not fetch the video',
    });
    return;
  }

  res.status(200).json({
    title: vinfo.title,
    author: vinfo.channel,
    thumbnail: vinfo.thumbnails[vinfo.thumbnails.length - 1].url,
  });
}

export default info;
