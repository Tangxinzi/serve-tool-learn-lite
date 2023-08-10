import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
const Moment = require('moment')
const LokidbName = require('../templates/LokidbName')
const LokiCollection = require('../templates/LokiCollection')

const axios = require('axios');
const appId = 'wx26bac2472f16d2d4';
const appSecret = 'f1e489d2b843fd956a58dbbdc8ccfe2a';

export default class NotificationController {
  async token() {
    return await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${ appId }&secret=${ appSecret }`)
      .then((response) => {
        return response.data;
      })
      .catch(function (error) {
        console.log(JSON.stringify(error));
      });
  }

  async jscode2session(code) {
    return await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`)
      .then((response) => {
        return response.data;
      })
      .catch(function (error) {
        console.log(JSON.stringify(error));
      });
  }

  public async signCreate({ request, response }: HttpContextContract) {
    try {
      const all = request.all()
      const session = await this.jscode2session(all.code)
      const signs = await LokiCollection.loadCollection('signs', LokidbName.database.signs)
      const users = signs.find({ openid: session.openid, date: Moment().add(1, 'days').format('YYYY-MM-DD') })

      if (!users.length && session.openid) {
        signs.insert({ openid: session.openid, date: Moment().add(1, 'days').format('YYYY-MM-DD'), status: 0 })
        LokidbName.database.signs.saveDatabase()
        return all
      }

      return users[0]
    } catch (error) {
      console.log(error);
    }
  }

  public async signSendmessage({ request, response }: HttpContextContract) {
    const all = request.all()
    const signs = await LokiCollection.loadCollection('signs', LokidbName.database.signs)
    const users = signs.find({ status: 0, date: Moment().format('YYYY-MM-DD') })
    for (let index = 0; index < users.length; index++) {
      const element = users[index];
      const number3 = signs.find({ openid: element.openid });

      const data = {
        touser: element.openid || '',
        template_id: 'ddx-Tqu0mq9kd_hrjm-5V4W2zkoVU6GM-vyVeyDS0tw',
        page: "/pages/index/index",
        miniprogram_state: 'formal',
        lang: "zh_CN",
        data: {
          number3: {
            value: number3.length || "0",
          },
          thing10: {
            value: "如需取消提醒，可在设置中关闭订阅服务",
          },
        },
      };

      // 发送
      const token = await this.token();
      const send = await axios.post(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token.access_token}`, data);
      if (send.errcode == '0') {
        var sign = signs.get(element.id)
        sign.status = 1
        signs.update(sign);
        LokidbName.database.signs.saveDatabase()
      }
    }

    return all
  }

  public async signUserinfo({ request, response }: HttpContextContract) {
    const all = request.all()
    const session = await this.jscode2session(all.code)
    const signs = await LokiCollection.loadCollection('signs', LokidbName.database.signs)
    const users = signs.find({ status: 1 })

    return {
      sign: signs.find({ openid: session.openid, status: 0, date: Moment().add(1, 'days').format('YYYY-MM-DD') }),
      count: users.length
    }
  }
}
