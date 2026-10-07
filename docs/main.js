// Farbhelfer – Desktop-Hülle (Electron). Speichert Exporte über die normalen KDE-Dialoge.
const {app,BrowserWindow,Menu,ipcMain,dialog,shell,nativeTheme}=require('electron');
const path=require('path'),fs=require('fs');
app.setName('Farbhelfer');
app.setDesktopName('farbhelfer.desktop');
let win=null,lastDir=null;
function exportDir(){
  if(lastDir&&fs.existsSync(lastDir))return lastDir;
  const d=path.join(app.getPath('documents'),'Farbhelfer-Export');
  try{fs.mkdirSync(d,{recursive:true})}catch(_){}
  return d;
}
if(!app.requestSingleInstanceLock())app.quit();
else{
  app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus()}});
  app.whenReady().then(()=>{
    Menu.setApplicationMenu(null);nativeTheme.themeSource='system';
    win=new BrowserWindow({width:1480,height:940,minWidth:1000,minHeight:640,show:false,title:'Farbhelfer',
      icon:path.join(__dirname,'icon-512.png'),autoHideMenuBar:true,
      webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true,spellcheck:false}});
    win.once('ready-to-show',()=>win.show());
    win.loadFile(path.join(__dirname,'index.html'));
    win.webContents.on('before-input-event',(e,i)=>{
      if(i.type!=='keyDown')return;
      if(i.key==='F11'){win.setFullScreen(!win.isFullScreen());e.preventDefault()}
      else if(i.control&&i.shift&&i.key.toLowerCase()==='i'){win.webContents.toggleDevTools();e.preventDefault()}
      else if(i.control&&i.key.toLowerCase()==='q'){app.quit();e.preventDefault()}
    });
    win.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/.test(url))shell.openExternal(url);return {action:'deny'}});
    win.webContents.on('will-navigate',e=>e.preventDefault());
  });
  ipcMain.handle('save-file',async(_e,{name,data,filters})=>{
    const r=await dialog.showSaveDialog(win,{title:'Speichern',defaultPath:path.join(exportDir(),name),filters});
    if(r.canceled||!r.filePath)return null;
    fs.writeFileSync(r.filePath,Buffer.from(data));lastDir=path.dirname(r.filePath);return r.filePath;
  });
  ipcMain.handle('save-many',async(_e,{files})=>{
    const r=await dialog.showOpenDialog(win,{title:'Ordner für den Export wählen',defaultPath:exportDir(),properties:['openDirectory','createDirectory']});
    if(r.canceled||!r.filePaths[0])return null;
    const dir=r.filePaths[0];
    for(const f of files)fs.writeFileSync(path.join(dir,f.name),Buffer.from(f.data));
    lastDir=dir;return dir;
  });
  ipcMain.handle('show-in-folder',(_e,p)=>{try{fs.statSync(p).isDirectory()?shell.openPath(p):shell.showItemInFolder(p)}catch(_){}});
  app.on('window-all-closed',()=>app.quit());
}
