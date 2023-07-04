import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
const axios = require('axios');
const md5 = require('md5');

export default class TranslateController {
  public async index({ request, response }: HttpContextContract) {
    const appId = '20230704001732947'; // 替换为你的百度翻译 API 应用ID
    const appKey = '1vFcK6_7Vmf7VkfjwU20'; // 替换为你的百度翻译 API 密钥

    const all = request.all()
    const text = all.text || 'Hello, world!';
    const from = all.from || 'en';
    const to = all.to || 'zh';

    // 构建请求 URL
    const url = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
    const params = {
      q: text,
      from,
      to,
      appid: appId,
      salt: Date.now().toString(),
      sign: '',
    };

    params.sign = md5(appId + params.q + params.salt + appKey)

    return new Promise((resolve, reject) => {
      axios.get(url, { params }).then((response) => {
        resolve(response.data)
      })
      .catch((error) => {
        reject(error.message)
      });
    });
  }

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
}
