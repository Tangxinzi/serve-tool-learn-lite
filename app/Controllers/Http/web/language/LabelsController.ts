import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const Loki = require('lokijs')
const db = new Loki('public/database/language/labels.json', { persistenceMethod: 'fs' })
const loadCollection = (collectionName, db) => {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const collection = db.getCollection(collectionName) || db.addCollection(collectionName)
      resolve(collection)
    })
  })
}

export default class LabelsController {
  public async index({ view }: HttpContextContract) {
    const collection = await loadCollection('labels', db)
    return view.render('language/label/index', {
      dataset: {
        title: '标签',
        labels: collection.data,
        label: {}
      }
    })
  }

  public async create({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    const collection = await loadCollection('labels', db)
    const result = collection.insert({
      label: all.label,
      description: all.description,
    })
    db.saveDatabase()
    response.redirect().back()
  }
}
