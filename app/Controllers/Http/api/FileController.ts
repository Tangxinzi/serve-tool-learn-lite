import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import RandomString from 'randomstring'
const Loki = require('lokijs')
const db = new Loki('public/database/language/files.json', { persistenceMethod: 'fs' })
const loadCollection = (collectionName, db) => {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const collection = db.getCollection(collectionName) || db.addCollection(collectionName)
      resolve(collection)
    })
  })
}

export default class FileController {
  downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      const https = require('https');

      https.get(url, (response) => {
        const fileStream = fs.createWriteStream(destination);
        response.pipe(fileStream);

        // 监听下载完成事件
        response.on('end', () => {
          console.log('音频文件下载完成！');
          resolve(destination);
        });

        // 监听错误事件
        response.on('error', (error) => {
          console.error('下载过程中发生错误：', error);
          reject(error);
        });
      });
    });
  }

  public async audio({ request, response }: HttpContextContract) {
    const all = request.all();
    const audioUrl = `https://fanyi.baidu.com/gettts?lan=${ all.lan }&text=${ all.text }&spd=${ all.spd || 3 }&source=web`; // 百度翻译音频文件的 URL
    const destinationPath = Application.publicPath('downloads/language/files/') + 'audio.mp3'; // 下载后保存的文件路径
    await this.downloadFile(audioUrl, destinationPath);

    setTimeout(() => {}, 1000);
    response.download(destinationPath, true)
  }

  public async upload({ request, response }: HttpContextContract) {
    const file = request.file('file', {
      size: '10mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3']
    })

    if (!file) return

    if (!file.isValid) return file.errors

    if (file) {
      const name = RandomString.generate(32) + '.' + file.extname
      await file.move(Application.publicPath('uploads/language/files'), {
        name,
        overwrite: true
      })

      const collection = await loadCollection('files', db)
      const data = {
        name,
        clientName: file.data.clientName,
        size: file.size,
        extname: file.extname,
        type: file.type,
        subtype: file.subtype,
        path: '/uploads/language/files/' + name
      }
      const result = collection.insert(data)
      db.saveDatabase()

      return {
        errno: 0,
        data: {
          url: data.path,
          alt: data.clientName,
          href: ''
        }
      }
    }
  }
}
