const { app, BrowserWindow, session, screen } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');

// LOGGING SYSTEM
const logFile = path.join(__dirname, 'app.log');
function log(msg) {
  const time = new Date().toISOString();
  const line = `[${time}] ${msg}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch(e) {}
  console.log(msg);
}

log('--- Application Starting ---');

let mainWindow;
let nextServer;
let splashWindow;
let isCreatingWindow = false; // Flag to prevent multiple creation calls

// CONFIGURATION
const PORT = 3000;
const LOCAL_URL = `http://localhost:${PORT}`;
// CHANGE THIS TO YOUR LIVE VERCEL URL FOR AUTOMATIC UPDATES
const REMOTE_URL = 'https://mazar-nine.vercel.app';
const PREFER_REMOTE = true; // Enabled to keep everything in sync by default

const isPackaged = app.isPackaged;
const STANDALONE_DIR = isPackaged
  ? path.join(process.resourcesPath, 'standalone')
  : path.join(__dirname, '.next', 'standalone');

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 600, height: 400, // Slightly larger
    frame: false, 
    alwaysOnTop: true,
    center: true,
    webPreferences: { nodeIntegration: false },
    backgroundColor: '#FDFBF7',
    show: false // Show only when content is ready to avoid white flash
  });
  
  log('Splash window created');
  
  // A simple splash screen using the logo
  const logoPath = isPackaged
    ? path.join(process.resourcesPath, 'standalone', 'public', 'icon.png')
    : path.join(__dirname, 'public', 'icon.png');

  splashWindow.loadURL(`data:text/html;charset=utf-8,
    <body style="margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background:#FDFBF7; border:2px solid #EAE4D9;">
      <img src="file://${logoPath.replace(/\\/g, '/')}" style="width:120px; margin-bottom:20px;" onerror="this.style.display='none'; console.log('Logo failed to load')">
      <h2 style="color:#2A2723; margin:0; font-weight:900; letter-spacing:-1px;">MAZAR BOOKING</h2>
      <p style="color:#C1A68D; font-size:12px; font-weight:bold; letter-spacing:2px; margin-top:5px;">جاري تشغيل النظام...</p>
      <div style="width:150px; height:4px; border-radius:2px; background:#EAE4D9; margin-top:20px; overflow:hidden;">
        <div style="width:100%; height:4px; background:#C1A68D; animation:pulse 1.5s infinite;"></div>
      </div>
      <style>@keyframes pulse { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }</style>
      <script>
        window.onload = () => { setTimeout(() => { if(window.opener) window.opener.postMessage('ready'); }, 100); }
      </script>
    </body>
  `);

  splashWindow.once('ready-to-show', () => {
    log('Splash window ready to show');
    splashWindow.show();
  });
}

function startNextServer() {
  const serverScript = path.join(STANDALONE_DIR, 'server.js');
  log(`Starting Next.js server from: ${serverScript}`);
  
  if (!fs.existsSync(serverScript)) {
    log(`ERROR: server.js not found at ${serverScript}`);
    return;
  }

  // Parse .env since standalone does not automatically load it
  const envVars = {};
  const envPath = path.join(STANDALONE_DIR, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      if (line && line.includes('=')) {
        const [key, ...rest] = line.split('=');
        envVars[key.trim()] = rest.join('=').trim().replace(/['"]/g, '');
      }
    }
    log(`Loaded environment variables from ${envPath}`);
  }

  nextServer = spawn('node', [serverScript], {
    env: {
      ...process.env,
      ...envVars,
      PORT: String(PORT),
      NODE_ENV: 'production',
      HOSTNAME: '127.0.0.1',
      __NEXT_PRIVATE_STANDALONE_CONFIG: path.join(STANDALONE_DIR, '.next', 'required-server-files.json'),
    },
    cwd: STANDALONE_DIR,
    windowsHide: true,
  });

  nextServer.stdout.on('data', (data) => log(`Server STDOUT: ${data}`));
  nextServer.stderr.on('data', (data) => log(`Server STDERR: ${data}`));
  nextServer.on('error', (err) => log(`Server Error: ${err.message}`));
  nextServer.on('close', (code) => log(`Server closed with code ${code}`));
}

function checkConnectivity(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      // Only consider it "online" if it returns 200 OK
      // Vercel 404 (Deployment Not Found) returns 404, which we should treat as OFFLINE
      resolve(res.statusCode === 200);
    }).on('error', (err) => {
      log(`Connectivity check error for ${url}: ${err.message}`);
      resolve(false);
    });
    req.setTimeout(5000, () => { req.destroy(); resolve(false); });
  });
}

async function createWindow() {
  if (mainWindow || isCreatingWindow) return;
  isCreatingWindow = true;
  log('Starting createWindow process...');
  
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 1400, height: 900,
    title: 'Mazar Booking',
    show: false,
    backgroundColor: '#FDFBF7',
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    icon: isPackaged 
      ? path.join(process.resourcesPath, 'standalone', 'public', 'icon.png')
      : path.join(__dirname, 'public', 'icon.png'),
    autoHideMenuBar: true,
  });

  // Decide which URL to load
  let urlToLoad = LOCAL_URL;
  if (PREFER_REMOTE) {
    const isOnline = await checkConnectivity(REMOTE_URL);
    if (isOnline) {
      urlToLoad = REMOTE_URL;
      console.log('Loading Remote System (Live Updates Enabled)');
    } else {
      console.log('Remote system unreachable, falling back to Local Standalone');
    }
  }

  mainWindow.loadURL(urlToLoad + '/admin/dashboard');
  log(`Loading URL: ${urlToLoad}/admin/dashboard`);

  // HANDY: Add Refresh Shortcut (F5 or Ctrl+R) to the desktop app
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
        log('Manual Refresh triggered via keyboard shortcut');
        mainWindow.reload();
        event.preventDefault();
      }
    }
  });

  mainWindow.once('ready-to-show', () => {
    log('Main window ready to show');
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
    }
    isCreatingWindow = false;
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    log(`Failed to load URL: ${validatedURL} - Error: ${errorDescription} (${errorCode})`);
    // If remote fails or returns error, try local immediately as fallback
    if (!validatedURL.includes('localhost')) {
      log('Remote server failed to load, falling back to Local Standalone...');
      mainWindow.loadURL(LOCAL_URL + '/admin/dashboard');
    }
  });

  mainWindow.on('closed', () => { 
    log('Main window closed');
    mainWindow = null; 
  });
}

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise} reason: ${reason}`);
});

app.whenReady().then(async () => {
  createSplash();

  // Network permissions: allow live system and Supabase
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ cancel: false }); // Open for now to allow external resources
  });

  startNextServer();
  
  // Wait for local server to be ready using recursive timeout for better control
  let retries = 30;
  async function checkServer() {
    const available = await checkConnectivity(LOCAL_URL);
    log(`Checking server connectivity (${retries} attempts left)... available: ${available}`);
    
    if (available || retries <= 0) {
      if (retries <= 0 && !available) {
        log('Server connectivity check timed out.');
      }
      createWindow();
    } else {
      retries--;
      setTimeout(checkServer, 1000);
    }
  }

  checkServer();
});

app.on('will-quit', () => { if (nextServer) nextServer.kill('SIGTERM'); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });


