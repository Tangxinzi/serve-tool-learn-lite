import View from '@ioc:Adonis/Core/View'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const Moment = require('moment')
Moment.locale('zh-cn')
const Loki = require('lokijs')
const db = new Loki('public/database/language/setting.json', { persistenceMethod: 'fs' })
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

    return view.render('language/setting/index', {
      dataset: {
        title: '设置',
        labels: labels.data,
        setting: collection.get(1)
      }
    })
  }

  public async store({ view, response, request }: HttpContextContract) {
    const all = request.all()
    const collection = await loadCollection('setting', db)
    var item = collection.get(1)
    item.language = all.language
    item.speaks = all.speaks
    item.words = all.words
    item.notice = all.notice
    
    collection.update(item);
    db.saveDatabase()
    response.redirect().back()
  }
}
