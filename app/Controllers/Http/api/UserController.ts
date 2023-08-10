import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
const Moment = require('moment')
const LokidbName = require('../templates/LokidbName')
const LokiCollection = require('../templates/LokiCollection')

const axios = require('axios');
const appId = 'wx26bac2472f16d2d4';
const appSecret = 'f1e489d2b843fd956a58dbbdc8ccfe2a';

export default class UserController {
  async jscode2session(code) {
    return await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`)
      .then((response) => {
        return response.data;
      })
      .catch(function (error) {
        console.log(JSON.stringify(error));
      });
  }

  public async userinfo({ request, response }: HttpContextContract) {
    const all = request.all()
    const session = await this.jscode2session(all.code)
    const signs = await LokiCollection.loadCollection('signs', LokidbName.database.signs)
    const users = signs.find({ openid: session.openid })

    return {
      sign: signs.find({ openid: session.openid, status: 0, date: Moment().add(1, 'days').format('YYYY-MM-DD') }),
      count: users.length
    }
  }
}
