import {app, BrowserWindow} from 'electron'
import Profile from '../global/profile'
//import {sendLogToWindow} from '../main/index.js'

class WindowManager {
  constructor () {
    this.windows = {}
    this.windowStates = {}
    
    this.idMap = {}
    this.nameMap = {}
    
    this.mainWin = null
    this.mainWinName = null
    this.settingsStore = Profile('layout/windows', {})
    
    this.aboutToClose = null
    this.lastOpen = []
    
    app.on('quit', () => {
      this._saveWindowStates()
    })
  }

  /**
    *
    * @param {Object} opt
    * @param {String} url
    * @param {String} name
    * @param {Function} onShowCallback
    */
  create (opt, url, name) {
    
    let win
    
    if (typeof this.getWindow(name) !== BrowserWindow) {
      
      if (this.mainWinName === null) {
        if (this.settingsStore.get('MainWindow') === null) {
          this.mainWinName = name
        } else {
          this.mainWinName = this.settingsStore.get('MainWindow')
        }
      }
      
      
      let managedWindows = this.settingsStore.get('managed', {})
      if (name in this.windowStates) {
        // Already Managed - Reopening
        managedWindows[name].profile = this.windowStates[name].profile
        managedWindows[name].state = this.windowStates[name].state
        managedWindows[name].options = this.windowStates[name].options
      } 
      
      if (managedWindows[name] !== undefined) {
        let opts = managedWindows[name]
        
        let profile = Object.assign({}, opts.profile, opts.state)
        profile.show = false
        
        win = new BrowserWindow(profile)
        url = opts.options.url
      } else {
        opt.show = false
        win = new BrowserWindow(opt)
      }
      
      //sendLogToWindow("Created Window")
      win.loadURL(url)
      this.showWhenReady(win)
      this.manage(win, name, opt)
      
    } else {
      console.warn("This window must already be opened!")
      win = this.getWindow(name)
    }
    
    return win
  }

  /**
    *
    * @param {BrowserWindow} win
    * @param {String} name
    */
  manage (win, name, passedOpts) {
    
    this.windows[name] = win
      
    this.windowStates[name] = {}
    this.windowStates[name].profile = passedOpts
    
    this.nameMap[win.id] = name
    this.idMap[name] = win.id
    
    if (name === this.mainWinName) {
      this.mainWin = win
    }
    
    win.on('show', () => {
      this.lastOpen.push(name)
    })
    
    
    win.on('close', () => {
      // NOTE: I cannot put these in 'closed' event. In Windows, the getBounds will return
      //       zero width and height in 'closed' event
      this.aboutToClose = win.id
      this._saveWindowState(win)
      
    })

    win.on('closed', () => {
      /* if (this.mainWin === this.nameMap[win.id]) {
        this.mainWin = null
        app.quit();
      } */
      
      if (this.aboutToClose !== null) {
        
        let winName = this.nameMap[this.aboutToClose]
        
        this.lastOpen.splice(this.lastOpen.indexOf(winName, 1))
        
        /* if (winName === this.mainWinName) {
          this.mainWin = null
          this.mainWinName = null
        } */
        
        delete this.windows[winName]
        delete this.idMap[winName]
        delete this.nameMap[this.aboutToClose]
        this.aboutToClose = null
        
      } else {
        console.warn("Can't delete references to this window... Something is wrong...")  
      }
      
    })

    // if we failed to load main window, go to failed page and clear the settingsStore.
    win.webContents.on('did-fail-load', () => {
      if (this.mainWin === this.nameMap[win.id]) {
        _mainWindowFailed() // TODO
      }
    })
    
    //Save init state
    this._saveWindowState(win)

    return win
  }

  /**
    *
    * @param {BrowserWindow} win
    */
  showWhenReady (win) {
    win.once('ready-to-show', e => {
      win.show()
    })
  }

  getWindow (winName) {
    //console.log(winName)
    if (typeof winName === 'number') {
      return this.windows[this.nameMap[winName]]
    } else {
      //console.log(this.windows[winName])
      return this.windows[winName]
    }
  }

  // Save current window's state to settingsStore `layout.windows.json` at `local`
  _saveWindowStates () {
    
    this.settingsStore.set("MainWindow", this.mainWinName)
    
    this.settingsStore.set('managed', this.windowStates)
    
    this.settingsStore.set("LastOpen", this.lastOpen)
    
  }
  
  
  _saveWindowState (win) {

    let winBounds = win.getBounds()

    if (!winBounds.width) {
      console.warn(`Failed to commit window state. Invalid window width: ${winBounds.width}`)
      winBounds.width = 800
    }

    if (!winBounds.height) {
      console.warn(`Failed to commit window state. Invalid window height ${winBounds.height}`)
      winBounds.height = 600
    }

    this.windowStates[this.nameMap[win.id]].profile = this.windows[this.nameMap[win.id]].profile
    
    //sendLogToWindow("Saving Win State")
    this.windowStates[this.nameMap[win.id]].state = {
      x: winBounds.x,
      y: winBounds.y,
      width: winBounds.width,
      height: winBounds.height,
      fullscreen: win.isFullScreen(),
      maximized: win.isMaximized()
    }
    
    //sendLogToWindow("Saving Win Options")
    this.windowStates[this.nameMap[win.id]].options = {
      url: win.url || win.webContents.getURL()
    }
    
  }
  
}

let windowManager = new WindowManager()

export {windowManager as default}
