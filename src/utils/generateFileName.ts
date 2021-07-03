import crypto from 'crypto';

import SearchData from '../types/SearchData';

function generateFileName(title: string, mw: boolean, metadata?: SearchData) {
  const id = crypto.randomBytes(16).toString('hex');
  const fileName = `${id}@${mw && metadata ? metadata.title : title}`;

  return fileName;
}

export default generateFileName;
