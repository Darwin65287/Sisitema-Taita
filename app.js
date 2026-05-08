document.getElementById('ui-main-date').innerText = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });

function abrirApp() {
    document.getElementById('landing-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    window.scrollTo(0, 0);
    volverMenuRoles();
    render(); 
}

function cerrarApp() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('landing-container').style.display = 'block';
    window.scrollTo(0, 0);
}

function volverMenuRoles() {
    document.querySelectorAll('.app-view').forEach(e => e.classList.remove('active'));
    document.getElementById('vista-selector').classList.add('active');
    document.getElementById('btn-volver-web').style.display = 'block';
    document.getElementById('btn-cambiar-rol').style.display = 'none';
    document.getElementById('ui-main-queue').innerText = colaOffline.length;
}

function seleccionarRol(rol) {
    document.querySelectorAll('.app-view').forEach(e => e.classList.remove('active'));
    document.getElementById(`vista-${rol}`).classList.add('active');
    document.getElementById('btn-volver-web').style.display = 'none';
    document.getElementById('btn-cambiar-rol').style.display = 'block';
    render();
}

function login() {
    const u = document.getElementById('log-user').value;
    const p = document.getElementById('log-pass').value;
    
    if(u === 'admin' && p === 'Taita2026') {
        isAdmin = true;
        document.getElementById('vista-admin-login').classList.remove('active');
        document.getElementById('vista-admin-panel').classList.add('active');
        document.getElementById('log-error').style.display = 'none';
        document.getElementById('log-user').value = '';
        document.getElementById('log-pass').value = '';
        render();
    } else { 
        document.getElementById('log-error').style.display = 'block'; 
    }
}

function cerrarSesionAdmin() {
    isAdmin = false;
    volverMenuRoles();
}

let dbCentral = JSON.parse(localStorage.getItem('upn_dbCentral')) || [];
let colaOffline = JSON.parse(localStorage.getItem('upn_colaOffline')) || [];
let isAdmin = false;

function guardarBD() {
    localStorage.setItem('upn_dbCentral', JSON.stringify(dbCentral));
    localStorage.setItem('upn_colaOffline', JSON.stringify(colaOffline));
    document.getElementById('ui-main-queue').innerText = colaOffline.length; 
}

let online = navigator.onLine;
function monitorearRed() {
    online = navigator.onLine;
    const badge = document.getElementById('net-badge');
    const statusMain = document.getElementById('ui-main-status');
    
    if(online) {
        badge.className = 'net-indicator net-on'; badge.innerHTML = '<i class="fa-solid fa-wifi"></i> CONECTADO';
        statusMain.className = 'value green'; statusMain.innerHTML = '<i class="fa-solid fa-check-circle"></i> En Línea';
        
        if(colaOffline.length > 0) { 
            colaOffline.forEach(p => { p.st = 'enviado'; dbCentral.unshift(p); });
            colaOffline = []; guardarBD();
        }
    } else {
        badge.className = 'net-indicator net-off'; badge.innerHTML = '<i class="fa-solid fa-wifi" style="text-decoration: line-through;"></i> SIN SEÑAL';
        statusMain.className = 'value orange'; statusMain.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Offline';
    }
    render();
}
window.addEventListener('online', monitorearRed);
window.addEventListener('offline', monitorearRed);

function enviarPedido() {
    const val = document.getElementById('app-prod').value.split('|');
    const cant = parseInt(document.getElementById('app-cant').value);
    const p = {
        id: Math.random().toString(36).substr(2,6).toUpperCase(),
        nom: val[0], cant: cant, tot: parseFloat(val[1]) * cant,
        st: online ? 'enviado' : 'pendiente'
    };
    if(online) dbCentral.unshift(p); else colaOffline.unshift(p);
    
    // Limpia la cantidad para que se sienta que ya se registró
    document.getElementById('app-cant').value = 1; 
    
    guardarBD(); render();
}

function setEstado(id, est) {
    const p = dbCentral.find(x => x.id === id);
    if(p) { p.st = est; guardarBD(); render(); }
}

function render() {
    document.getElementById('ui-main-queue').innerText = colaOffline.length;

    const rm = document.getElementById('ui-mozo-lista'); rm.innerHTML = '';
    [...colaOffline, ...dbCentral].forEach(p => {
        rm.innerHTML += `<div class="order-card st-${p.st}"><div><h4>${p.cant}x ${p.nom}</h4><p style="font-size:12px; color:var(--text-muted);">ID: ${p.id}</p></div><span class="badge">${p.st}</span></div>`;
    });

    const cn = document.getElementById('ui-cajero-nuevos'); cn.innerHTML = '';
    const cp = document.getElementById('ui-cajero-prep'); cp.innerHTML = '';
    dbCentral.forEach(p => {
        if(p.st === 'enviado') cn.innerHTML += `<div class="order-card st-enviado"><div><h4>${p.cant}x ${p.nom}</h4></div><button onclick="setEstado('${p.id}','preparando')" style="padding:10px; background:var(--info); color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;"><i class="fa-solid fa-play"></i></button></div>`;
        if(p.st === 'preparando') cp.innerHTML += `<div class="order-card st-preparando"><div><h4>${p.cant}x ${p.nom}</h4></div><button onclick="setEstado('${p.id}','entregado')" style="padding:10px; background:purple; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;"><i class="fa-solid fa-check"></i></button></div>`;
    });

    if(isAdmin) {
        const ta = document.getElementById('ui-admin-tabla'); ta.innerHTML = '';
        let t = 0, c = 0;
        dbCentral.forEach(p => {
            t += p.tot; 
            if(p.st === 'entregado') c++;
            ta.innerHTML += `<tr><td>${p.id}</td><td>${p.cant}x ${p.nom}</td><td>S/ ${p.tot.toFixed(2)}</td><td><span class="badge st-${p.st}" style="border: 1px solid">${p.st}</span></td></tr>`;
        });
        document.getElementById('ui-admin-total').innerText = `S/ ${t.toFixed(2)}`;
        document.getElementById('ui-admin-count').innerText = c;
    }
}

monitorearRed();