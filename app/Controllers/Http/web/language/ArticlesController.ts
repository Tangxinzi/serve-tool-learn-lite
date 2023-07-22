import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const Moment = require('moment')
const Loki = require('lokijs')
const db = new Loki('public/database/language/articles.json', { persistenceMethod: 'fs' })
const dbLabels = new Loki('public/database/language/labels.json', { persistenceMethod: 'fs' })
const dbSetting = new Loki('public/database/language/setting.json', { persistenceMethod: 'fs' })
const loadCollection = (collectionName, db) => {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const collection = db.getCollection(collectionName) || db.addCollection(collectionName)
      resolve(collection)
    })
  })
}

export default class articlesController {
  public async index({ view, request }: HttpContextContract) {
    var all = request.all()
    var articles = await loadCollection('articles', db)
    var labels = await loadCollection('labels', dbLabels)
    var total = articles.count(), pageSize = 10, page = all.page || 1
    if (all.label) {
      articles = articles.find({ label: all.label })
      total = articles.length
    } else {
      articles = articles.chain().simplesort('').offset((page - 1) * pageSize).limit(pageSize).data()
    }

    for (let index = 0; index < articles.length; index++) {
      articles[index].image = `${ request.protocol() }://${ request.host() }` + articles[index].image
      articles[index].label = articles[index].label ? labels.get(articles[index].label) : {}
      articles[index].meta.created = Moment(articles[index].meta.created).format('YYYY-MM-DD HH:mm:ss')
    }

    const dataset = {
      title: '文章',
      articles: articles.reverse(),
      labels: labels.data,
      data: {
        total,
        page,
        perPage: parseInt(page) - 1,
        lastPage: parseInt(page) + 1,
      }
    }

    return request.url() == '/web/language/article' ? view.render('language/article/index', { dataset }) : dataset
  }

  public async create({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    var setting = await loadCollection('setting', dbSetting)
    setting = setting.get(1)

    const collection = await loadCollection('articles', db)
    const result = collection.insert({
      language: setting.language ? setting.language : 'kor',
      label: all.label,
      title: all.title,
      detail: all.detail,
      description: all.description ? all.description : all.text.substring(0, 140),
      image: all.image,
      media: all.media,
    })
    db.saveDatabase()

    session.flash('message', { type: 'success', header: '创建成功', message: `${ all.title } 已创建。` })
    response.redirect().back()
  }

  public async store({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    const collection = await loadCollection('articles', db)
    var item = collection.get(all.id)

    item.label = all.label,
    item.title = all.title,
    item.detail = all.detail,
    item.description = all.description,
    item.image = all.image,
    item.media = all.media

    collection.update(item);
    db.saveDatabase()

    session.flash('message', { type: 'success', header: '更新成功', message: `${ all.title } 已更新。` })
    response.redirect().back()
  }

  public async show({ params, view }: HttpContextContract) {
    const collection = await loadCollection('articles', db)
    const labels = await loadCollection('labels', dbLabels)
    const dataset = {
      title: '文章',
      labels: labels.data,
      article: collection.get(params.id) || {}
    }

    return dataset.article
  }

  public async edit({ params, view }: HttpContextContract) {
    const collection = await loadCollection('articles', db)
    const labels = await loadCollection('labels', dbLabels)

    return view.render('language/article/edit', {
      dataset: {
        title: '文章',
        labels: labels.data,
        article: collection.get(params.id) || {}
      }
    })
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
