import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const Moment = require('moment')
Moment.locale('zh-cn')
const Loki = require('lokijs')
const db = new Loki('public/database/language/words.json', { persistenceMethod: 'fs' })
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

export default class WordsController {
  public async label({ view, request }: HttpContextContract) {
    var query = []
    var labels = await loadCollection('labels', dbLabels)
    await labels.where(function(label) {
      if ([3, 4, 5, 6, 7, 8, 9, 10, 11].includes(label['$loki'])) {
        query.push(label)
      }
    })

    return {
      dataset: {
        labels: query
      }
    }
  }

  public async index({ view, request }: HttpContextContract) {
    var all = request.all()
    var words = await loadCollection('words', db)
    var labels = await loadCollection('labels', dbLabels)
    var total = words.count(), pageSize = 10, page = all.page || 1
    if (all.label) {
      words = words.find({ label: all.label })
      total = words.length
    } else {
      words = words.chain().simplesort('$loki', true).offset((page - 1) * pageSize).limit(pageSize).data()
    }

    for (let index = 0; index < words.length; index++) {
      words[index].label = words[index].label ? labels.get(words[index].label) : {}
      words[index].audio = `${ request.protocol() }://${ request.host() }/api/audio?lan=${ words[index].language }&text=${ words[index].word }`
      words[index].meta.created = Moment(words[index].meta.created).format('YYYY-MM-DD HH:mm:ss')
    }

    const dataset = {
      title: '单词',
      words: words.reverse(),
      labels: labels.data,
      data: {
        total,
        page,
        perPage: parseInt(page) - 1,
        lastPage: parseInt(page) + 1,
      }
    }

    return request.url() == '/web/language/word' ? view.render('language/word/index', { dataset }) : dataset
  }

  public async create({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    var setting = await loadCollection('setting', dbSetting)
    setting = setting.get(1)

    const collection = await loadCollection('words', db)
    const result = collection.insert({
      language: setting.language ? setting.language : 'kor',
      label: all.label,
      word: all.word,
      description: all.description,
      color: all.color,
      image: all.image,
      media: all.media,
    })
    db.saveDatabase()
    response.redirect().back()
  }

  public async store({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    const collection = await loadCollection('words', db)
    var item = collection.get(all.id)

    item.label = all.label,
    item.word = all.word,
    item.description = all.description,
    item.color = all.color,
    item.image = all.image,
    item.media = all.media

    collection.update(item);
    db.saveDatabase()
    response.redirect().back()
  }

  public async show({ params, view }: HttpContextContract) {}

  public async edit({ params, view }: HttpContextContract) {
    const collection = await loadCollection('words', db)
    const labels = await loadCollection('labels', dbLabels)
    const word = collection.get(params.id)

    return view.render('language/word/edit', {
      dataset: {
        title: '单词',
        labels: labels.data,
        word
      }
    })
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
