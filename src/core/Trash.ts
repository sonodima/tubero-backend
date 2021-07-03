import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

class Trash {
  list: string[];

  constructor() {
    this.list = [];
  }

  public add(file: string) {
    this.list.push(file);
  }

  public clear() {
    this.list.forEach(async (file, index, array) => {
      const filePath = path.join('temp', file);

      try {
        await fsp.stat(filePath);

        fs.unlink(filePath, (err) => {
          if (!err) {
            array.splice(index, 1);
          } else {
            console.warn(`could not delete file at ${file}`);
          }
        });
      } catch (error) {
        array.splice(index, 1);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public emptyDir() {
    fs.readdir('temp' as fs.PathLike, (_, files) => {
      files.forEach((file) => {
        fs.unlink(path.join('temp', file), (err) => {
          if (err) {
            console.warn(`could not delete file at ${file}`);
          }
        });
      });
    });
  }
}

export default new Trash();
