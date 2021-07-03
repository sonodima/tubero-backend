import fs from 'fs';
import axios from 'axios';

async function downloadFile(url: string, filePath: string) {
  const file = fs.createWriteStream(filePath);

  const result = await new Promise<true | Error>((resolve) => {
    axios({
      url,
      method: 'GET',
      responseType: 'stream',
    }).then((res) => {
      res.data.pipe(file);

      file.on('finish', () => {
        resolve(true);
      });

      file.on('error', (error) => {
        resolve(error);
      });
    });
  });

  if (result !== true) {
    throw result;
  }
}

export default downloadFile;
