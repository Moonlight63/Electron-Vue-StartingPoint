import {ipcRenderer, remote} from 'electron'

console.log('window loaded')
ipcRenderer.send('log', 'Worker Ready')

ipcRenderer.on('doWork', (e, args) => {
    console.log(args)
    ipcRenderer.send('log', 'GotMessage')
    ipcRenderer.send('log', mySlowFunction(15))
    workDone()
})

function mySlowFunction(baseNumber) {
    let result = 0;
    let progress = 0
    for (var i = Math.pow(baseNumber, 7); i >= 0; i--) {		
        result += Math.atan(i) * Math.tan(i)
        progress++
        if (progress == 1708593) {
            progress = 0
            ipcRenderer.send('log', i)
        }
    }
    
    return result
}


function workDone () {
    ipcRenderer.send('log', 'Work Done... Closing')
    
    remote.getCurrentWindow().close()
}