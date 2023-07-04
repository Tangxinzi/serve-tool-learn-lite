/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})

Route.group(() => {
  Route.get('/setting', 'web/language/SettingsController.index')
  Route.post('/setting/store', 'web/language/SettingsController.store')

  Route.get('/article', 'web/language/ArticlesController.index')
  Route.get('/article/edit/:id', 'web/language/ArticlesController.edit')
  Route.post('/article/create', 'web/language/ArticlesController.create')
  Route.post('/article/store', 'web/language/ArticlesController.store')

  Route.get('/grammar', 'web/language/GrammarsController.index')
  Route.get('/grammar/edit/:id', 'web/language/GrammarsController.edit')
  Route.post('/grammar/create', 'web/language/GrammarsController.create')
  Route.post('/grammar/store', 'web/language/GrammarsController.store')
  Route.post('/grammar/update', 'web/language/GrammarsController.update')

  Route.get('/speak', 'web/language/SpeaksController.index')
  Route.get('/speak/edit/:id', 'web/language/SpeaksController.edit')
  Route.post('/speak/create', 'web/language/SpeaksController.create')
  Route.post('/speak/store', 'web/language/SpeaksController.store')

  Route.get('/word', 'web/language/WordsController.index')
  Route.get('/word/edit/:id', 'web/language/WordsController.edit')
  Route.post('/word/create', 'web/language/WordsController.create')
  Route.post('/word/store', 'web/language/WordsController.store')

  Route.get('/file', 'web/language/FilesController.index')

  Route.get('/label', 'web/language/LabelsController.index')
  Route.post('/label', 'web/language/LabelsController.create')
}).prefix('/web/language')

Route.group(() => {
  Route.get('/audio', 'api/TranslateController.audio')
  Route.get('/translate', 'api/TranslateController.index')
  Route.post('/upload', 'api/FileController.upload')

  Route.group(() => {
    Route.get('/pronounce', 'api/PronouncesController.index')

    Route.get('/article', 'web/language/ArticlesController.index')
    Route.get('/article/:id', 'web/language/ArticlesController.show')
    
    Route.get('/setting', 'web/language/SettingsController.index')
    Route.get('/word', 'web/language/WordsController.index')
    Route.get('/word/label', 'web/language/WordsController.label')
    Route.get('/grammar', 'web/language/GrammarsController.index')
    Route.get('/grammar/show/:id', 'web/language/GrammarsController.show')
    Route.get('/speak', 'web/language/SpeaksController.index')
    Route.get('/speak/show/:id', 'web/language/SpeaksController.show')
  }).prefix('/language')
}).prefix('/api')
