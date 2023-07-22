import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const LokidbName = require('../../templates/LokidbName')
const LokiCollection = require('../../templates/LokiCollection')

export default class LabelsController {
  public async index({ view, request }: HttpContextContract) {
    var all = request.all()
    var labels = await LokiCollection.labels(), label = {}

    if (all.label) label = labels.get(all.label)

    return view.render('language/label/index', {
      dataset: {
        title: '标签',
        labels: labels.data,
        label
      }
    })
  }

  public async create({ request, response, session, view }: HttpContextContract) {
    const all = request.all()
    const labels = await LokiCollection.loadCollection('labels', LokidbName.database.labels)

    if (all.submit == 'create') {
      labels.insert({
        label: all.label,
        description: all.description,
      })
    }

    if (all.submit == 'update') {
      var label = labels.get(all.id)
      label.label = all.label,
      label.description = all.description
      labels.update(label);
    }

    LokidbName.database.labels.saveDatabase()

    session.flash('message', { type: 'success', header: '操作成功', message: `${ all.label }${ all.submit == 'create' ? '已创建' : '已更新' }` })
    response.redirect().back()
  }
}
