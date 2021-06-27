import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import { Request, Response } from 'express';

import DownloadQuery from '../types/DownloadQuery';

async function download(
  req: Request<{}, {}, {}, DownloadQuery>,
  res: Response
): Promise<any> {
  if (req.query.id === undefined) {
    res.status(400).json({
      error: 'parameter [id] is required',
    });
    return;
  }

  const filePath = path.join('temp', req.query.id);
  const title = filePath.substr(filePath.lastIndexOf('@') + 1);

  let stats: fs.Stats;
  try {
    stats = await fsp.stat(filePath);
  } catch (error) {
    res.status(404).json({ error: 'resource not available' });
    return;
  }

  res.writeHead(200, {
    'Content-Disposition': `attachment; filename="${title}"`,
    'Content-Length': stats.size,
  });

  const stream = fs.createReadStream(filePath);
  await new Promise((resolve) => {
    stream.pipe(res);
    stream.on('end', resolve);
    stream.on('close', resolve);
  });

  try {
    await fsp.rm(filePath);
  } catch (error) {
    console.warn(`could not remove file: ${filePath}`);
  }
}

export default download;
