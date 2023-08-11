const {app, BrowserWindow, Menu, shell, ipcMain, nativeTheme} = require('electron');
var path = require('path')

let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 412,
        height: 766,
        resizable: false,
        fullscreenable: false,
        minimizable: true,
        closable: true,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
            worldSafeExecuteJavaScript: true
        },
        frame: false,
        transparent: true,
        titleBarStyle: 'hiddenInset',
        setWindowButtonVisibility: false,
        icon: path.join(__dirname, './assets/instagram.icns')
    });

    mainWindow.loadFile('index.html')

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    //mainWindow.webContents.openDevTools();
    mainWindow.setMenuBarVisibility(false);
}

ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })
  
  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

const template = [
    {
        label: app.getName(),
        submenu: [
            {role: 'about'},
            {type: 'separator'},
            {role: 'reload'},
            {role: 'forceReload'},
            {type: 'separator'},
            {role: 'minimize'},
            {role: 'hide'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'services'},
            {type: 'separator'},
            {type: 'separator'},
            {role: 'quit'}
        ]
    },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// ---------

// Context Menu
const contextMenu = require('electron-context-menu');

app.on('web-contents-created', (e, contents) => {
    if (contents.getType() === 'webview') {
        // Open link with external browser in webview
        contents.on('new-window', (e, url) => {
            e.preventDefault();
            const protocol = require('url').parse(url).protocol
            if (protocol === 'http:' || protocol === 'https:') {
                shell.openExternal(url)
            }
        });

        // Set context menu in webview
        contextMenu({
            window: contents,
            append: (defaultActions, params, browserWindow) => [
                {role: 'copyLink', visible: params.linkText},
                {role: 'copyImage', visible: params.hasImageContents},
                {type: 'separator'},
                {role: 'reload'},
                {type: 'separator'},
                {role: 'about'},
            ],
            showCopyImage: true,
            showCopyImageAddress: true,
            showSaveImageAs: true,
            showLookUpSelection: true,
        });
    }
});
