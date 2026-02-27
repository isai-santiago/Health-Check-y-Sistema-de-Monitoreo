import express from 'express';
const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>System Dashboard | API Monitor</title>
        <link href="/styles.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            .pulse-green { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); animation: pulse-g 2s infinite; }
            .pulse-red { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); animation: pulse-r 2s infinite; }
            @keyframes pulse-g { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
            @keyframes pulse-r { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: #0f172a; border-radius: 4px; }
            ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        </style>
    </head>
    <body class="bg-slate-900 text-slate-300 font-sans min-h-screen pb-10">
        
        <nav class="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
            <div class="flex items-center gap-3">
                <i class="fa-solid fa-server text-blue-500 text-xl"></i>
                <h1 class="text-xl font-bold text-white tracking-wide">API Dashboard</h1>
            </div>
            <div class="flex items-center gap-4">
                <span class="hidden sm:inline text-sm text-slate-400">Actualizando automáticamente</span>
                <button onclick="fetchHealth()" class="text-slate-400 hover:text-white transition cursor-pointer">
                    <i id="refresh-icon" class="fa-solid fa-rotate-right"></i>
                </button>
                <a href="/" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition">Inicio</a>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto px-6 mt-8 space-y-6">
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
                    <div class="px-6 py-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                        <h3 class="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <i class="fa-solid fa-gear text-blue-400"></i> Configuración de Alertas
                        </h3>
                        <span id="webhook-status-badge" class="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">No detectado</span>
                    </div>
                    <div class="p-6 flex flex-col sm:flex-row gap-4 flex-grow items-center">
                        <div class="flex-1 w-full">
                            <input type="password" id="webhook-input" placeholder="https://discord.com/api/webhooks/..." 
                                   class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-emerald-400 focus:outline-none focus:border-blue-500 transition-all font-mono">
                        </div>
                        <button onclick="saveWebhook()" class="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                            <i class="fa-solid fa-floppy-disk"></i> Guardar
                        </button>
                    </div>
                </div>

                <div class="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
                    <i class="fa-brands fa-discord absolute -right-4 -bottom-4 text-8xl text-blue-500/5 transition-transform group-hover:scale-110"></i>
                    <h4 class="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                        <i class="fa-solid fa-circle-info"></i> ¿Cómo obtener el Webhook?
                    </h4>
                    <ol class="text-xs text-slate-400 space-y-2 list-decimal ml-4">
                        <li>En Discord, ve a <b>Ajustes del Canal</b> > <b>Integraciones</b>.</li>
                        <li>Crea un <b>Webhook</b> y copia la URL.</li>
                        <li>Pégala aquí para recibir alertas si la API cae.</li>
                    </ol>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="md:col-span-1 bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex flex-col items-center justify-center text-center">
                    <div id="global-pulse" class="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-slate-700 transition-all duration-500">
                        <i id="global-icon" class="fa-solid fa-spinner fa-spin text-3xl text-slate-400"></i>
                    </div>
                    <h2 class="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Estado Global</h2>
                    <p id="global-status" class="text-2xl font-black text-white italic">ESPERANDO...</p>
                </div>

                <div class="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
                        <div class="p-3 bg-blue-500/10 w-fit rounded-lg text-blue-400 mb-4"><i class="fa-solid fa-clock"></i></div>
                        <p class="text-slate-500 text-xs font-bold uppercase tracking-tighter">Uptime Servidor</p>
                        <p id="sys-uptime" class="text-3xl font-bold text-white mt-1">--</p>
                    </div>
                    <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
                        <div class="p-3 bg-purple-500/10 w-fit rounded-lg text-purple-400 mb-4"><i class="fa-solid fa-microchip"></i></div>
                        <p class="text-slate-500 text-xs font-bold uppercase tracking-tighter">Uso de CPU</p>
                        <p id="sys-cpu" class="text-3xl font-bold text-white mt-1">--</p>
                    </div>
                    <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
                        <div class="p-3 bg-emerald-500/10 w-fit rounded-lg text-emerald-400 mb-4"><i class="fa-solid fa-memory"></i></div>
                        <p class="text-slate-500 text-xs font-bold uppercase tracking-tighter">Uso de RAM</p>
                        <p id="sys-ram" class="text-3xl font-bold text-white mt-1">--</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-bold text-white mb-4 mt-8 border-b border-slate-700 pb-2 flex items-center gap-2">
                    <i class="fa-solid fa-network-wired text-slate-500"></i> Estado de Componentes
                </h3>
                <div id="services-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="text-slate-500 text-sm animate-pulse"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Consultando microservicios...</div>
                </div>
            </div>

            <div class="mt-8">
                <h3 class="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                    <i class="fa-solid fa-code text-slate-500"></i> Raw JSON Payload
                </h3>
                <div class="bg-[#0f172a] rounded-xl border border-slate-700 p-4 shadow-inner relative group">
                    <button onclick="copyJSON()" class="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded opacity-0 group-hover:opacity-100 transition shadow-lg">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                    <pre id="json-data" class="text-emerald-500/80 text-xs font-mono overflow-x-auto whitespace-pre-wrap">Sincronizando...</pre>
                </div>
            </div>

        </main>

        <script>
            let lastData = "";

            const getIconForService = function(name) {
                const map = {
                    'database': 'fa-database text-blue-400',
                    'redis': 'fa-layer-group text-red-400',
                    'application': 'fa-box text-purple-400',
                    'memory': 'fa-memory text-emerald-400',
                    'disk': 'fa-hard-drive text-amber-400'
                };
                return map[name.toLowerCase()] || 'fa-cube text-slate-400';
            };

            const formatUptime = function(seconds) {
                if (!seconds) return '--';
                const d = Math.floor(seconds / (3600*24));
                const h = Math.floor(seconds % (3600*24) / 3600);
                const m = Math.floor(seconds % 3600 / 60);
                if (d > 0) return d + 'd ' + h + 'h';
                if (h > 0) return h + 'h ' + m + 'm';
                return m + 'm ' + Math.floor(seconds % 60) + 's';
            };

            async function saveWebhook() {
                const url = document.getElementById('webhook-input').value;
                const badge = document.getElementById('webhook-status-badge');
                if(!url) return alert("Ingresa una URL válida");

                try {
                    const res = await fetch('/config/webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: url })
                    });
                    if(res.ok) {
                        badge.textContent = "Configurado";
                        badge.className = "text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        alert("✅ Webhook guardado!");
                    }
                } catch(e) { alert("Error al conectar con el servidor"); }
            }

            async function fetchHealth() {
                const icon = document.getElementById('refresh-icon');
                if(icon) icon.classList.add('fa-spin');

                try {
                    const res = await fetch('/health/detailed');
                    const data = await res.json();
                    lastData = JSON.stringify(data, null, 2);
                    
                    const isHealthy = data.status === 'healthy';
                    
                    const pulseDiv = document.getElementById('global-pulse');
                    pulseDiv.className = 'w-20 h-20 rounded-full flex items-center justify-center mb-4 ' + (isHealthy ? 'bg-emerald-500/20 pulse-green' : 'bg-rose-500/20 pulse-red');
                    
                    const globalIcon = document.getElementById('global-icon');
                    globalIcon.className = 'fa-solid ' + (isHealthy ? 'fa-check text-emerald-500' : 'fa-triangle-exclamation text-rose-500') + ' text-4xl';
                    
                    const statusText = document.getElementById('global-status');
                    statusText.textContent = data.status.toUpperCase();
                    statusText.className = 'text-2xl font-black ' + (isHealthy ? 'text-emerald-400' : 'text-rose-500');

                    if(data.system) {
                        document.getElementById('sys-uptime').textContent = formatUptime(data.system.uptime);
                        document.getElementById('sys-cpu').textContent = data.system.cpu.count + ' Cores';
                        document.getElementById('sys-ram').textContent = data.system.memory.usedPercent;
                    }

                    if(data.details && data.details.length > 0) {
                        const grid = document.getElementById('services-grid');
                        let gridHtml = '';
                        
                        data.details.forEach(function(service) {
                            const isOk = service.status === 'healthy';
                            const badgeColor = isOk ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                            
                            let extraInfo = service.duration || '--';
                            if(service.details && service.details.usedPercent) extraInfo = service.details.usedPercent;
                            if(service.details && service.details.latency) extraInfo = service.details.latency;

                            gridHtml += '<div class="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300">';
                            gridHtml += '  <div class="flex justify-between items-start mb-2">';
                            gridHtml += '    <div class="flex items-center gap-3">';
                            gridHtml += '      <div class="w-10 h-10 rounded bg-slate-900 flex items-center justify-center border border-slate-700">';
                            gridHtml += '        <i class="fa-solid ' + getIconForService(service.name) + ' text-lg"></i>';
                            gridHtml += '      </div>';
                            gridHtml += '      <h4 class="text-white font-semibold text-sm capitalize">' + service.name + '</h4>';
                            gridHtml += '    </div>';
                            gridHtml += '    <span class="text-[9px] px-2 py-0.5 rounded border ' + badgeColor + ' font-bold uppercase tracking-widest">' + service.status + '</span>';
                            gridHtml += '  </div>';
                            gridHtml += '  <div class="mt-4 flex justify-between items-end border-t border-slate-700/50 pt-3">';
                            gridHtml += '    <span class="text-[10px] text-slate-500">' + (service.description || 'Monitor activo') + '</span>';
                            gridHtml += '    <span class="text-xs font-mono text-slate-300">' + extraInfo + '</span>';
                            gridHtml += '  </div>';
                            gridHtml += '</div>';
                        });
                        grid.innerHTML = gridHtml;
                    }
                    document.getElementById('json-data').textContent = lastData;

                } catch(e) {
                    document.getElementById('global-pulse').className = "w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-rose-500/20 pulse-red";
                    document.getElementById('global-icon').className = "fa-solid fa-plug-circle-xmark text-rose-500 text-4xl";
                    document.getElementById('global-status').textContent = "OFFLINE";
                } finally {
                    if(icon) setTimeout(() => icon.classList.remove('fa-spin'), 500);
                }
            }

            function copyJSON() {
                navigator.clipboard.writeText(lastData).then(() => {
                    alert('¡JSON copiado al portapapeles!');
                });
            }

            fetchHealth();
            setInterval(fetchHealth, 5000);
        </script>
    </body>
    </html>
  `);
});

export default router;