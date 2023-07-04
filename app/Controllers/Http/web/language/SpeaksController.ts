import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const LokidbName = require('../../templates/LokidbName')
const LokiCollection = require('../../templates/LokiCollection')
const Moment = require('moment')

export default class SpeaksController {
  public async index({ view, request }: HttpContextContract) {
    var all = request.all()
    var speaks = await LokiCollection.speaks()
    var labels = await LokiCollection.labels()
    var setting = await LokiCollection.setting()
    var total = speaks.count(), pageSize = 10, page = all.page || 1

    if (all.label) {
      speaks = speaks.find({ label: all.label })
      total = speaks.length
    } else {
      speaks = speaks.chain().find({ language: setting.language ? setting.language : 'kor' }).simplesort('$loki', true).offset((page - 1) * pageSize).limit(pageSize).data()
    }

    for (let index = 0; index < speaks.length; index++) {
      speaks[index].label = speaks[index].label ? labels.get(speaks[index].label) : {}
      speaks[index].audio = `${ request.protocol() }://${ request.host() }/api/audio?lan=${ speaks[index].language }&text=${ encodeURIComponent(speaks[index].speak) }`
      speaks[index].meta.created = Moment(speaks[index].meta.created).format('YYYY-MM-DD HH:mm:ss')
    }

    const dataset = {
      title: '口语',
      speaks: speaks,
      labels: labels.data,
      data: {
        total,
        page,
        perPage: parseInt(page) - 1,
        lastPage: parseInt(page) + 1,
      }
    }

    return request.url() == '/web/language/speak' ? view.render('language/speak/index', { dataset }) : dataset
  }

  public async create({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    const setting = await LokiCollection.setting()
    const speaks = await LokiCollection.loadCollection('speaks', LokidbName.database.speaks)
    const result = speaks.insert({
      language: setting.language ? setting.language : 'kor',
      label: all.label,
      speak: all.speak,
      description: all.description,
      image: all.image,
      media: all.media,
    })

    LokidbName.database.speaks.saveDatabase()
    response.redirect().back()
  }

  public async store({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    const speaks = await LokiCollection.loadCollection('speaks', LokidbName.database.speaks)
    var item = speaks.get(all.id)

    item.label = all.label,
    item.speak = all.speak,
    item.description = all.description,
    item.image = all.image,
    item.media = all.media

    speaks.update(item);
    LokidbName.database.speaks.saveDatabase()
    response.redirect().back()
  }

  public async show({ params, view }: HttpContextContract) {}

  public async edit({ params, view, request }: HttpContextContract) {
    const speaks = await LokiCollection.speaks()
    const labels = await LokiCollection.labels()

    return view.render('language/speak/edit', {
      dataset: {
        title: '口语',
        labels: labels.data,
        speak: speaks.get(params.id)
      }
    })
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
