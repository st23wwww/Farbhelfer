const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('native',{
  saveFile:o=>ipcRenderer.invoke('save-file',o),
  saveMany:o=>ipcRenderer.invoke('save-many',o),
  showInFolder:p=>ipcRenderer.invoke('show-in-folder',p)
});
