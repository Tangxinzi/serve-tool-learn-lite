const Loki = require('lokijs')

const database = {
  signs: new Loki('public/database/language/signs.json', { persistenceMethod: 'fs' }),
  labels: new Loki('public/database/language/labels.json', { persistenceMethod: 'fs' }),
  speaks: new Loki('public/database/language/speaks.json', { persistenceMethod: 'fs' }),
  setting: new Loki('public/database/language/setting.json', { persistenceMethod: 'fs' }),
}

export { database }
