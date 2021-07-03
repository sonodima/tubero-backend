import execa from 'execa';
import * as youtubedl from 'youtube-dl-exec';

import ProgressData from '../types/ProgressData';

class Converter {
  process?: execa.ExecaChildProcess;

  // eslint-disable-next-line no-unused-vars
  onProgress?: (progress: ProgressData) => void;

  public async execute(id: string, flags: any) {
    const result = await new Promise<true | Error>((resolve) => {
      this.process = youtubedl.raw(id, flags);

      this.process.on('error', (error) => {
        resolve(error);
      });

      this.process.stderr!.on('error', (error) => {
        resolve(error);
      });

      this.process.stdout!.on('data', (data: string) => {
        const lines = data.toString().split(/\r|\n/g).filter(Boolean);
        lines.forEach((line) => {
          if (line[0] === '[') {
            const progress = line.match(
              /\[download\] *(.*) of (.*) at (.*) ETA (.*) */
            );

            if (progress && progress.length >= 5) {
              const percent = parseFloat(progress[1].replace('%', ''));
              const size = progress[2].replace('~', '');
              const speed = progress[3];
              const eta = progress[4];

              if (this.onProgress) {
                this.onProgress({ percent, size, speed, eta });
              }
            }
          }
        });
      });

      this.process.stdout!.on('end', () => {
        resolve(true);
      });
    });

    if (result !== true) {
      throw result;
    }
  }
}

export default Converter;
