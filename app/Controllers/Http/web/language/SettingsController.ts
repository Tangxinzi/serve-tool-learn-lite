import View from '@ioc:Adonis/Core/View'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const Moment = require('moment')
Moment.locale('zh-cn')
const Loki = require('lokijs')
const db = new Loki('public/database/language/setting.json', { persistenceMethod: 'fs' })
const dbSigns = new Loki('public/database/language/signs.json', { persistenceMethod: 'fs' })
const dbLabels = new Loki('public/database/language/labels.json', { persistenceMethod: 'fs' })
const loadCollection = (collectionName, db) => {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const collection = db.getCollection(collectionName) || db.addCollection(collectionName)
      resolve(collection)
    })
  })
}

export default class SettingsController {
  public async index({ view, request }: HttpContextContract) {
    const all = request.all()
    const labels = await loadCollection('labels', dbLabels)
    const collection = await loadCollection('setting', db)
    const dataset = {
      title: '设置',
      labels: labels.data,
      setting: collection.get(1)
    }

    return request.url() == '/web/language/setting' ? view.render('language/setting/index', { dataset }) : dataset.setting
  }

  public async notification({ view, request }: HttpContextContract) {
    const all = request.all()
    const signs = await loadCollection('signs', dbSigns)
    // signs.chain().simplesort('date', 1)
    signs.find({ date: 1 })

    for (let index = 0; index < signs.data.length; index++) {
      signs.data[index].meta.created = Moment(signs.data[index].meta.created).format('YYYY-MM-DD HH:mm:ss')
      signs.data[index].meta.updated = signs.data[index].meta.updated ? Moment(signs.data[index].meta.updated).format('YYYY-MM-DD HH:mm:ss') : ''
    }

    const dataset = {
      title: '消息通知 - 设置',
      signs: signs.data,
    }

    return view.render('language/setting/notification', { dataset })
  }

  public async store({ view, response, request, session }: HttpContextContract) {
    const all = request.all()
    const collection = await loadCollection('setting', db)
    var item = collection.get(1)
    item.language = all.language
    item.articles = all.articles
    item.grammars = all.grammars
    item.speaks = all.speaks
    item.words = all.words
    item.notice = all.notice

    collection.update(item)
    db.saveDatabase()

    session.flash('message', { type: 'success', header: '更新成功', message: `设置已更新。` })
    response.redirect().back()
  }
}
