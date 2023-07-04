const Loki = require('lokijs')

const database = {
  labels: new Loki('public/database/language/labels.json', { persistenceMethod: 'fs' }),
  speaks: new Loki('public/database/language/speaks.json', { persistenceMethod: 'fs' }),
  setting: new Loki('public/database/language/setting.json', { persistenceMethod: 'fs' }),
}

export { database }
