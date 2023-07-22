// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
  public async login({ view, request, response, session }: HttpContextContract) {
    if (request.method() == 'GET') {
      session.put('login', false)
      return view.render('language/user/login', {
        dataset: {
          title: '登录',
        }
      })
    } else {
      const all = request.all()
      if (all.user == 'Jiangkun' && all.password == '55555jkl') {
        session.put('login', true)

        session.flash('message', { type: 'success', header: '登录成功', message: `好心情伴随您，云海荡朝日，春色任天涯。加油~ 😊` })
        return response.redirect().toRoute('web/language/ArticlesController.index')
      } else {
        response.redirect().back()
      }
    }
  }
}
