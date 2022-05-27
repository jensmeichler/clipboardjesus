const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');

app.on('ready',  async () => {
  const win = new BrowserWindow({width: 1200, height: 800});
  await win.loadURL(url.format({
    pathname: path.join(
      __dirname,
      'dist/clipboard/index.html'),
    protocol: 'file:',
    slashes: true
  }));
  win.reload();
});
