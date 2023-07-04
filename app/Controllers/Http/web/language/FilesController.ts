import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
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

export default class FilesController {
  public async index({ view }: HttpContextContract) {
    const collection = await loadCollection('files', db)
    return view.render('language/files/index', {
      dataset: {
        title: '存储',
        files: collection.data
      }
    })
  }
}
