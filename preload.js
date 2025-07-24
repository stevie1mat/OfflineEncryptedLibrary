const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  register: (username, password) => ipcRenderer.invoke('register', username, password),
  getBooks: () => ipcRenderer.invoke('getBooks'),
  getBookCover: (id) => ipcRenderer.invoke('getBookCover', id),
  readBook: (id) => ipcRenderer.invoke('readBook', id),
  logout: () => ipcRenderer.invoke('logout'),
  isFirstRun: () => ipcRenderer.invoke('isFirstRun'),
  downloadBooks: () => ipcRenderer.invoke('downloadBooks'),
}); 