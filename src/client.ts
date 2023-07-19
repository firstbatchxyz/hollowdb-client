import {Base} from './base';

export class Client<T> extends Base<T> {
  public async get(key: string): Promise<T> {
    return await this.read(key);
  }

  public async put(key: string, value: T) {
    await this.write('put', JSON.stringify({key, value}));
  }

  public async update(key: string, value: T) {
    await this.write('update', JSON.stringify({key, value}));
  }

  public async remove(key: string) {
    await this.write('remove', JSON.stringify({key}));
  }
}
