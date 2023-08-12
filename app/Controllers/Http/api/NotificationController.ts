import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
const Moment = require('moment')
const axios = require('axios');
const LokidbName = require('../templates/LokidbName')
const LokiCollection = require('../templates/LokiCollection')

export default class NotificationController {
  async token() {
    return await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${ Env.get('AppId') }&secret=${ Env.get('AppSecret') }`)
      .then((response) => {
        return response.data;
      })
      .catch(function (error) {
        console.log(JSON.stringify(error));
      });
  }

  async jscode2session(code) {
    return await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${ Env.get('AppId') }&secret=${ Env.get('AppSecret') }&js_code=${ code }&grant_type=authorization_code`)
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
      console.log(send.data);

      if (send.data.errmsg) {
        var sign = signs.get(element['$loki'])
        sign.status = 1
        sign.errmsg = send.data.errmsg
        signs.update(sign);
        LokidbName.database.signs.saveDatabase()
      }
    }

    return 'ok'
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
