import { app, BrowserWindow, ipcMain } from 'electron'
import WindowManager from './window-manager'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {  
  
  let winOpts = {
    height: 563,
    useContentSize: true,
    width: 1000
  }

  mainWindow = WindowManager.create(winOpts, winURL, 'Main')
  mainWindow.on('closed', () => {
    app.quit()
  })
  
  /* const logURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/logger`
  : `file://${__dirname}/#/logger`
  
  WindowManager.create(winOpts, logURL, 'Log').once('ready-to-show', e => {
    
  }) */
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('log', (e, arg) => {
  e.returnValue = 'Logging From Main'
  console.log(arg)
})

ipcMain.on('work', () => {
  
  let bgWin = new BrowserWindow({
    show: false,
    webPreferences : {
      webSecurity : false
    }
  })
  
  const winBG_URL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/work.html`
  : `file://${__dirname}/work.html`
  
  bgWin.loadURL(winBG_URL)
  
  bgWin.once('ready-to-show', e => {
    bgWin.webContents.send('doWork', "Start Working")
  })
  
})


/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
