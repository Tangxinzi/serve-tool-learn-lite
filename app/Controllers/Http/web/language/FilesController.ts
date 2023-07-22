import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'

const fs = require('fs')
const path = require('path')
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
    const files = collection.chain().find({ delete: {'$ne': 1} }).data();

    return view.render('language/files/index', {
      dataset: {
        title: '存储',
        files
      }
    })
  }

  async deleteFile(filePath) {
    try {
      const fullPath = path.join(Application.publicPath(), '', filePath);
      await fs.promises.unlink(fullPath);
      return true; // 文件删除成功
    } catch (error) {
      console.error('Error deleting file:', error);
      return false; // 文件删除失败
    }
  }

  public async destroy({ request, response, session }: HttpContextContract) {  
    const all = request.all()

    try {
      const filePath = all.path;
      const isDeleted = await this.deleteFile(filePath);
  
      if (isDeleted) {
        const collection = await loadCollection('files', db)
        const objectToDelete = collection.get(all.id)
        objectToDelete.delete = 1
  
        if (objectToDelete) {
          collection.update(objectToDelete);
          db.saveDatabase()
        }
  
        session.flash('message', { type: 'success', header: '文件删除成功', message: `${ all.path } 文件已被删除。` })
      } else {
        session.flash('message', { type: 'error', header: '文件删除失败', message: `${ all.path } 文件删除失败。捕获错误信息 ${ JSON.stringify(error) }。` })
      }
    } catch (error) {
      console.log(error);
    }

    response.redirect().back()
  }
}
