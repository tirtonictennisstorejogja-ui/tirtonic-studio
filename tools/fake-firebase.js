// In-memory stand-in for the Firebase compat SDK, for local UI testing only.
(function(){
  const store = window.__STORE = window.__STORE || {};      // path -> data
  const listeners = [];                                       // {kind:'doc'|'col', path, fn}
  const writes = window.__WRITES = [];
  const violations = window.__VIOLATIONS = [];
  let auto = 0;
  const clone = o => JSON.parse(JSON.stringify(o));
  const user = () => window.__USER || null;
  const memberOf = email => store['members/' + email];
  const isAdmin = () => { const u = user(); if (!u) return false; const m = memberOf(u.email); return (window.__OWNERS||[]).includes(u.email) || (m && m.role === 'admin'); };
  function check(path, before, after, op){
    const u = user(); if (!u) { violations.push({path, op, why:'no auth'}); return false; }
    const col = path.split('/')[0];
    if (col === 'members') { const email = path.split('/')[1]; if (op==='set' && (window.__OWNERS||[]).includes(u.email) && email===u.email) return true; if (!isAdmin()) { violations.push({path,op,why:'member write'}); return false; } return true; }
    if (isAdmin()) return true;
    const mm = memberOf(u.email) || {}; const idcc = mm.idcc === true;
    if (col === 'idcc' && op === 'set' && !before && idcc) return true;
    if (col === 'items' && op === 'set' && !before && idcc && after && after.old === true) return true;
    if (col === 'tasks' && op === 'set' && !before && idcc && after && after.source==='lama' && after.reason==='idcc' && ['idc','idf'].includes(after.type) && ['Rencana','Terdata'].includes(after.status)) return true;
    if (col !== 'tasks' || op !== 'update' || !before) { violations.push({path, op, why:'non-admin '+op+' on '+col}); return false; }
    const m = memberOf(u.email) || {}; const code = m.code;
    if (![before.producer,before.editor,before.talent,before.script].includes(code)) { violations.push({path,op,why:'not assignee'}); return false; }
    const allowed = ['status','shotAt','readyAt','note','driveUrl','history','updatedAt','updatedBy'];
    const changed = Object.keys(Object.assign({}, before, after)).filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
    const bad = changed.filter(k => !allowed.includes(k));
    const early = ['Rencana','Siap Produksi','Diproduksi','Editing','QC','Terdata','Ready'];const allowedTo=['Terdata','Diproduksi','Editing','Ready'];
    if (bad.length || !early.includes(before.status) || before.metaAt || !(allowedTo.includes(after.status)||after.status===before.status)) { violations.push({path,op,why:'fields '+bad.join(',')+' status '+after.status}); return false; }
    return true;
  }
  function docSnap(path){ const d = store[path]; return { id: path.split('/').pop(), exists: d !== undefined, data: () => d === undefined ? undefined : clone(d), ref: { path } }; }
  function colSnap(path){ const pre = path + '/'; const docs = Object.keys(store).filter(k => k.startsWith(pre) && !k.slice(pre.length).includes('/')).sort().map(k => docSnap(k)); return { docs, size: docs.length, empty: !docs.length }; }
  function fire(changedPath){ const col = changedPath.split('/').slice(0,-1).join('/');
    listeners.forEach(l => { if (l.kind==='doc' && l.path===changedPath) setTimeout(()=>l.fn(docSnap(l.path)),0); if (l.kind==='col' && l.path===col) setTimeout(()=>l.fn(colSnap(l.path)),0); }); }
  function err(){ const e = new Error('Missing or insufficient permissions.'); e.code = 'permission-denied'; return e; }
  function docRef(path){ return {
    id: path.split('/').pop(), path,
    get: async () => { const u=user(); const col=path.split('/')[0]; if (col==='members' && u && path!=='members/'+u.email && !isAdmin()) throw err(); return docSnap(path); },
    set: async d => { if (!check(path, store[path], d, 'set')) throw err(); store[path] = clone(d); writes.push({op:'set', path, d}); fire(path); },
    update: async d => { if (store[path]===undefined) { const e=new Error('No document'); e.code='not-found'; throw e; } const after = Object.assign(clone(store[path]), clone(d)); if (!check(path, store[path], after, 'update')) throw err(); store[path] = after; writes.push({op:'update', path, d}); fire(path); },
    delete: async () => { if (!check(path, store[path], null, 'delete')) throw err(); delete store[path]; writes.push({op:'delete', path}); fire(path); },
    onSnapshot: (fn, e) => { const l={kind:'doc', path, fn}; listeners.push(l); setTimeout(()=>fn(docSnap(path)),0); return ()=>listeners.splice(listeners.indexOf(l),1); },
    collection: p => colRef(path + '/' + p)
  }; }
  function colRef(path){ return {
    path,
    doc: id => docRef(path + '/' + (id || ('auto' + (++auto)))),
    add: async d => { const r = docRef(path + '/auto' + (++auto) + Math.random().toString(36).slice(2,7)); await r.set(d); return r; },
    onSnapshot: (fn, e) => { const l={kind:'col', path, fn}; listeners.push(l); setTimeout(()=>fn(colSnap(path)),0); return ()=>listeners.splice(listeners.indexOf(l),1); },
    get: async () => colSnap(path)
  }; }
  const fs = { settings(){}, collection: colRef, doc: docRef,
    runTransaction: async fn => fn({ get: async r => docSnap(r.path), set: (r,d) => { store[r.path] = clone(d); } }) };
  const authCbs = [];
  const auth = {
    get currentUser(){ const u=user(); return u?Object.assign({getIdToken:async()=>'tok-'+u.email},u):null; },
    onAuthStateChanged: cb => { authCbs.push(cb); setTimeout(()=>cb(user()),0); },
    signInWithPopup: async () => { window.__USER = window.__NEXT_USER; authCbs.forEach(cb=>cb(user())); },
    signInWithRedirect: async () => {},
    signOut: async () => { window.__USER = null; authCbs.forEach(cb=>cb(null)); }
  };
  function GoogleAuthProvider(){ this.setCustomParameters = () => {}; }
  window.firebase = { initializeApp(){}, auth: Object.assign(() => auth, { GoogleAuthProvider }), firestore: () => fs };
})();
