import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const Moment = require('moment')
const Loki = require('lokijs')
const db = new Loki('public/database/language/grammars.json', { persistenceMethod: 'fs' })
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

export default class GrammarsController {
  public async index({ view, request, route }: HttpContextContract) {
    var all = request.all()
    var grammars = await loadCollection('grammars', db)
    var labels = await loadCollection('labels', dbLabels)
    var total = grammars.count(), pageSize = 10, page = all.page || 1
    if (all.label) {
      grammars = grammars.find({ label: all.label })
      total = grammars.length
    } else {
      grammars = grammars.chain().map(function (grammar) {
        return {
          language: grammar.language,
          title: grammar.title,
          description: grammar.description,
          image: grammar.image,
          label: grammar.label,
          talks: grammar.talks,
          speaks: grammar.speaks,
          words: grammar.words,
        }
      }).simplesort('$loki', true).offset((page - 1) * pageSize).limit(pageSize).data()
    }

    for (let index = 0; index < grammars.length; index++) {
      grammars[index].label = grammars[index].label ? labels.get(grammars[index].label) : {}
      grammars[index].meta.created = Moment(grammars[index].meta.created).format('YYYY-MM-DD HH:mm:ss')
    }

    var dataset = {
      title: '语法',
      grammars: grammars.reverse(),
      labels: labels.data,
      data: {
        total,
        page,
        perPage: parseInt(page) - 1,
        lastPage: parseInt(page) + 1,
      }
    }

    return request.url() == '/web/language/grammar' ? view.render('language/grammar/index', { dataset }) : dataset
  }

  public async create({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    const collection = await loadCollection('grammars', db)
    var setting = await loadCollection('setting', dbSetting)
    setting = setting.get(1)

    const result = collection.insert({
      language: setting.language ? setting.language : 'kor',
      label: all.label,
      title: all.title,
      detail: all.detail,
      description: all.description ? all.description.substring(0, 140) : all.text ? all.text.substring(0, 140) : '',
      image: all.image,
      audio: all.audio,
      video: all.video,
    })
    db.saveDatabase()
    response.redirect().back()
  }

  public async store({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    const collection = await loadCollection('grammars', db)
    var item = collection.get(all.id)

    item.label = all.label,
    item.title = all.title,
    item.detail = all.detail,
    item.description = all.description ? all.description.substring(0, 140) : all.text ? all.text.substring(0, 140) : '',
    item.image = all.image,
    item.audio = all.audio,
    item.video = all.video,

    collection.update(item);
    db.saveDatabase()
    response.redirect().back()
  }

  addDomainToImagePath(str, domain) {
    var pattern = /src="([^"]+)"/gi;
    var result = str.replace(pattern, function(match, path) {
      if (!path.startsWith('http://') && !path.startsWith('https://')) {
        return 'src="' + domain + path + '"';
      }
      return match;
    });

    return result;
  }

  public async show({ params, request, view, route }: HttpContextContract) {
    const collection = await loadCollection('grammars', db)
    const dataset = {
      title: '语法',
      grammar: collection.get(params.id) || {}
    }

    dataset.grammar.detail = this.addDomainToImagePath(dataset.grammar.detail, `${ request.protocol() }://${ request.host() }`)

    return route.pattern == '/web/language/grammar/show/:id' ? view.render('language/grammar/show', { dataset }) : dataset
  }

  public async edit({ params, view }: HttpContextContract) {
    const collection = await loadCollection('grammars', db)
    const labels = await loadCollection('labels', dbLabels)

    return view.render('language/grammar/edit', {
      dataset: {
        title: '语法',
        labels: labels.data,
        grammar: collection.get(params.id) || {}
      }
    })
  }

  public async update({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    const collection = await loadCollection('grammars', db)
    var item = collection.get(all.id)

    if (all.type == 'talk') item.talks = { talk: all.talk, text: all.text, length: all.talk.length }
    if (all.type == 'speak') item.speaks = { speak: all.speak, text: all.text, length: all.speak.length }
    if (all.type == 'word') item.words = { word: all.word, text: all.text, length: all.word.length }

    collection.update(item);
    db.saveDatabase()
    response.redirect().back()
  }

  public async destroy({}: HttpContextContract) {}
}
