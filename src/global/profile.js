import electron from 'electron'
import path from 'path'
import fs from 'fs-extra'

class Profile {
  constructor (filepath, defaults) {
    const userData = (electron.app || electron.remote.app).getPath('userData')
    if (!defaults) {
      defaults = {}
    }
    this.path = path.join(userData, `${filepath}.json`)
    this.data = parseDataFile(this.path, defaults)
  }

  // This will just return the property on the `data` object
  get (key, defaultVal) {
    if (key in this.data) {
      return this.data[key]  
    } else {
      if (defaultVal !== undefined) {
        return defaultVal
      } else {
        return null
      }
    }
  }

  // ...and this will set it
  set (key, val) {
    this.data[key] = val
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    fs.outputJSONSync(this.path, this.data)
  }
}

function parseDataFile (filePath, defaults) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return fs.readJSONSync(filePath)
  } catch (error) {
    // if there was some kind of error, return the passed in defaults instead.
    fs.outputJsonSync(filePath, defaults)
    return defaults
  }
}

export default function loadProfile (path, defaults) {
  return new Profile(path, defaults)
}

// module.export = loadProfile
