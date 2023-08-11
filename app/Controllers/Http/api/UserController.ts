import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
const Moment = require('moment')
const axios = require('axios');
const LokidbName = require('../templates/LokidbName')
const LokiCollection = require('../templates/LokiCollection')

export default class UserController {
  async jscode2session(code) {
    return await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${ Env.get('AppId') }&secret=${ Env.get('AppSecret') }&js_code=${ code }&grant_type=authorization_code`)
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
