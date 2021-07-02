import { Request, Response } from 'express';
import ytdl, { videoInfo } from 'ytdl-core';

import isId from '../utils/isId';

import ConvertQuery from '../types/ConvertQuery';
import Core from '../core/Core';

async function convert(
  req: Request<{}, {}, {}, ConvertQuery>,
  res: Response
): Promise<any> {
  if (req.query.v === undefined) {
    res.status(400).json({ error: 'Parameter [v] is required' });
    return;
  }

  if (!isId(req.query.v)) {
    res.status(400).json({ error: 'Parameter [v] is not a valid id' });
    return;
  }

  if (!['audio', 'video'].includes(req.query.fmt)) {
    res.status(400).json({ error: 'Parameter [fmt] is required' });
    return;
  }

  if (req.query.fmt === 'audio' && req.query.mw === undefined) {
    res.status(400).json({ error: 'Parameter [mw] is required' });
    return;
  }

  let info: videoInfo;
  try {
    info = await ytdl.getInfo(req.query.v);
  } catch (error) {
    res.status(500).json({
      error: 'Could not fetch the video',
    });
    return;
  }

  res.set({
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
  });
  res.flushHeaders();

  const core = new Core();
  core.onProgress = (percent) => {
    res.write('event: progress\n');
    res.write(`data: ${JSON.stringify({ percent })}`);
    res.write('\n\n');
  };

  req.on('close', () => {
    console.log('connection closed unexpectedly, killing ffmpeg process');
    core.kill();
  });

  let id = '';
  try {
    if (req.query.fmt === 'audio') {
      id = await core.audio(info, req.query.mw);
    } else if (req.query.fmt === 'video') {
      id = await core.video(info);
    }
  } catch (error) {
    res.write('event: error\n');
    res.write(`data: ${JSON.stringify({ error: error.message })}`);
    res.write('\n\n');
    res.end();
    return;
  }

  res.write('event: success\n');
  res.write(`data: ${JSON.stringify({ id })}`);
  res.write('\n\n');
  res.end();
}

export default convert;
