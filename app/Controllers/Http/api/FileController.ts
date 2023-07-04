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
