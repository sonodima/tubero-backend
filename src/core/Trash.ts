import fs from 'fs';
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
    console.log('performing trash cleanup');
    this.list.forEach((file, index, array) => {
      fs.unlink(path.join('temp', file), (err) => {
        if (!err) {
          array.splice(index, 1);
        } else {
          console.warn(`could not delete file at ${file}`);
        }
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public emptyDir() {
    fs.readdir('temp' as fs.PathLike, (_, files) => {
      console.log('performing initial directory cleanup');
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
