const Loki = require('lokijs')

const loadCollection = (collectionName, db) => {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const collection = db.getCollection(collectionName) || db.addCollection(collectionName)
      resolve(collection)
    })
  })
}

// 标签
const labels = () => {
  return new Promise(async (resolve) => {
    const dbLabels = new Loki('public/database/language/labels.json', { persistenceMethod: 'fs' })
    var labels = await loadCollection('labels', dbLabels)
    resolve(labels)
  })
}

// 签到
const signs = () => {
  return new Promise(async (resolve) => {
    const dbSigns = new Loki('public/database/language/signs.json', { persistenceMethod: 'fs' })
    var signs = await loadCollection('signs', dbSigns)
    resolve(signs)
  })
}

// 口语
const speaks = () => {
  return new Promise(async (resolve) => {
    const db = new Loki('public/database/language/speaks.json', { persistenceMethod: 'fs' })
    var speaks = await loadCollection('speaks', db)
    resolve(speaks)
  })
}

// 设置
const setting = () => {
  return new Promise(async (resolve) => {
    const dbSetting = new Loki('public/database/language/setting.json', { persistenceMethod: 'fs' })
    var setting = await loadCollection('setting', dbSetting)
    setting = setting.get(1)
    resolve(setting)
  })
}

export { loadCollection, labels, speaks, setting, signs }
