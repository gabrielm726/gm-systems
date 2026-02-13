const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { fork } = require('child_process');

// Logging setup - Production safe
const logPath = path.join(app.getPath('userData'), 'system_log.txt');

function log(msg) {
    try {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
    } catch (e) {
        console.error(e);
    }
}

try {
    fs.writeFileSync(logPath, `[${new Date().toISOString()}] APP STARTED\n`);
} catch (e) { }

log('Arquivo main.cjs carregado.');

// ---------------------------------------------------------
// SERVER SIDE CAR (EMBEDDED BACKEND)
// ---------------------------------------------------------
let serverProcess = null;

function startBackend() {
    log('Iniciando Backend Embarcado...');

    // Caminho para o server.js
    // Dev: root/backend/server.js
    // Prod: resources/app/backend/server.js
    // Fallback: resources/backend/server.js
    const possiblePaths = [
        path.join(__dirname, '../backend/server.js'),
        path.join(process.resourcesPath, 'app/backend/server.js'),
        path.join(process.resourcesPath, 'backend/server.js'),
        path.join(__dirname, 'backend/server.js')
    ];

    let serverPath = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            serverPath = p;
            break;
        }
    }

    log(`Procurando backend. Caminho encontrado: ${serverPath || 'NENHUM'}`);

    if (serverPath) {
        try {
            // Usa fork para rodar o script com o Node do próprio Electron
            serverProcess = fork(serverPath, [], {
                cwd: path.dirname(serverPath),
                env: {
                    ...process.env,
                    PORT: 3002, // Força a porta (Alterado de 3001)
                    IS_ELECTRON_CHILD: 'true',
                    IS_ELECTRON_CHILD: 'true',
                    // SECURITY UPGRADE: API GATEWAY MODE
                    // ---------------------------------------------------
                    // Chaves de Banco de Dados REMOVIDAS do Cliente.
                    // O App agora é obrigado a falar com a Vercel (Nuvem)
                    // ou operar Offline (SQLite).
                    // ---------------------------------------------------
                    NO_LOCAL_DB_ACCESS: 'true'
                },
                stdio: ['pipe', 'pipe', 'pipe', 'ipc']
            });

            log(`Backend iniciado com PID: ${serverProcess.pid}`);

            serverProcess.stdout.on('data', (data) => {
                log(`[BACKEND]: ${data}`);
            });

            serverProcess.stderr.on('data', (data) => {
                log(`[BACKEND ERROR]: ${data}`);
            });

            serverProcess.on('close', (code) => {
                log(`Backend encerrado com código: ${code}`);
            });

        } catch (err) {
            log(`ERRO FATAL ao iniciar backend: ${err.message}`);
            dialog.showErrorBox('Erro no Backend', `Falha ao iniciar servidor interno:\n${err.message}`);
        }
    } else {
        log('ARQUIVO DO BACKEND NÃO ENCONTRADO! Rodando apenas Frontend.');
    }
}

// Inicia o backend antes de tudo
startBackend();

// Tratamento global de erros
process.on('uncaughtException', (error) => {
    log(`CRITICAL UNCAUGHT ERROR: ${error.message}\n${error.stack}`);
    try {
        dialog.showErrorBox('Erro Crítico no Startup', `Ocorreu um erro:\n${error.message}`);
    } catch (e) { }
});

if (process.platform === 'win32') {
    app.setAppUserModelId("com.gmsystems.gestaopatrimonial")
}
app.setName("GM Systems e Gestão Patrimonial")

function createWindow() {
    log('Entering createWindow...');
    try {
        // Create the main window but keep it hidden
        const win = new BrowserWindow({
            width: 1200,
            height: 800,
            title: "GM Systems e Gestão Patrimonial",
            icon: path.join(__dirname, 'icon.png'), // Using PNG for better window rendering
            show: false, // Wait for ready-to-show to avoid white flash
            backgroundColor: '#0f172a', // Dark background to match login screen
            frame: false, // Frameless window (Tela Infinita)
            fullscreen: false,
            autoHideMenuBar: true, // Hide default File/Edit menu
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false, // Legacy requirement
                webSecurity: false // Disable CORS for debugging
            }
        })
        log('BrowserWindow created.');

        const isDev = !app.isPackaged;

        if (false) { // FORCE STATIC LOAD FOR DEBUGGING
            log('Loading Dev Server: http://localhost:3000');
            win.loadURL('http://localhost:3000');
            win.webContents.openDevTools();
        } else {
            const buildPath = path.join(__dirname, '../dist/index.html');
            log(`Target HTML path: ${buildPath}`);

            if (!fs.existsSync(buildPath)) {
                log(`FATAL: File not found at ${buildPath}`);
                dialog.showErrorBox('Erro de Arquivo', `Arquivo não encontrado:\n${buildPath}`);
            }

            win.loadFile(buildPath).catch(err => {
                log(`win.loadFile FAILED: ${err.message}`);
            });
        }

        // Optimize loading - Show as soon as ready
        win.once('ready-to-show', () => {
            log('Window ready to show');
            win.maximize();
            win.show();
            win.focus();
            if (process.env.NODE_ENV === 'development') {
                win.webContents.openDevTools();
            }
        });

        win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            log(`Page failed to load: ${errorCode} - ${errorDescription}`);
        });

        win.webContents.on('render-process-gone', (event, details) => {
            log(`RENDERER CRASHED: ${details.reason} - Exit Code: ${details.exitCode}`);
            dialog.showErrorBox('TELA PRETA (Crash)', `O motor visual travou.\nMotivo: ${details.reason}`);
        });

    } catch (e) {
        log(`Error in createWindow execution: ${e.message}`);
        dialog.showErrorBox('Erro na Janela', e.message);
    }
}

app.whenReady().then(() => {
    log('App ready event fired.');
    app.setAppUserModelId("com.gmsystems.gestaopatrimonial")

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

const { ipcMain } = require('electron');
ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
});
ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        if (win.isMaximized()) win.unmaximize();
        else win.maximize();
    }
});
ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
});

app.on('window-all-closed', () => {
    log('All windows closed. Quitting.');

    // Matar backend
    if (serverProcess) {
        log('Matando processo do backend...');
        serverProcess.kill();
        serverProcess = null;
    }

    if (process.platform !== 'darwin') {
        app.quit()
    }
})
