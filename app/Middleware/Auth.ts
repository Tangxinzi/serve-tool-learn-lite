const fs = require("fs");
// const Jwt = require('App/Models/Jwt')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Auth {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, response, session }, next) {
    // call next to advance the request
    try {
      const sign = session.get('login')
      if (sign) {
        await next()
      } else {
        response.redirect().toRoute('web/language/UsersController.login')
      }
    } catch (e) {
      console.log(e);
    } finally {

    }
  }
}

module.exports = Auth
