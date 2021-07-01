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
    res.status(400).json({ error: 'parameter [v] is required' });
    return;
  }

  if (!isId(req.query.v)) {
    res.status(400).json({ error: 'parameter [v] is not a valid id' });
    return;
  }

  if (!['audio', 'video'].includes(req.query.fmt)) {
    res.status(400).json({ error: 'parameter [fmt] is required' });
    return;
  }

  if (req.query.fmt === 'audio' && req.query.mw === undefined) {
    res.status(400).json({ error: 'parameter [mw] is required' });
    return;
  }

  res.set({
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
  });
  res.flushHeaders();

  let info: videoInfo;
  try {
    info = await ytdl.getInfo(req.query.v);
  } catch (error) {
    res.status(500).json({
      error: 'could not fetch the video',
    });
    return;
  }

  const core = new Core();
  core.onProgress = (percent) => {
    res.write('event: progress\n');
    res.write(`data: ${JSON.stringify({ percent })}`);
    res.write('\n\n');
  };

  req.on('close', () => {
    core.kill();
    console.log('connection closed unexpectedly, killing process');
  });

  req.on('end', () => {
    console.log('connection ended');
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
    return;
  }

  res.write('event: success\n');
  res.write(`data: ${JSON.stringify({ id })}`);
  res.write('\n\n');
}

export default convert;
