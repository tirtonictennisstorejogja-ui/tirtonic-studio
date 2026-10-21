/* ===== SIMULASI: data contoh, tanpa Firebase. Perubahan hanya tersimpan selama halaman terbuka. ===== */
(function(){
  const pad=n=>String(n).padStart(2,'0');
  const D=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
  const now=Date.now(),H=36e5;
  const S={};
  S['members/kepala@tirtonic.id']={name:'Zaki',code:'Z',role:'admin',email:'kepala@tirtonic.id'};
  S['members/rayhan@tirtonic.id']={name:'Rayhan',code:'R',role:'member',email:'rayhan@tirtonic.id'};
  S['members/aulia@tirtonic.id']={name:'Aulia',code:'A',role:'member',email:'aulia@tirtonic.id',idcc:true};
  S['members/salma@tirtonic.id']={name:'Salma',code:'S',role:'member',email:'salma@tirtonic.id'};
  S['settings/main']={idccQty:10,idccDays:90,idccDay:3};
  const items=[
    ['i1','Asics Gel Resolution 9','putih-biru','sepatu','men',12,-2],
    ['i2','Asics Gel Challenger 15','white/cherry tomato','sepatu','women',8,-1],
    ['i3','Yonex Ezone 100 2024','biru','raket','',6,-3],
    ['i4','Wilson Pro Staff 97 v14','hitam','raket','',4,-4],
    ['i5','Head Tour 9R','hitam-kuning','tas','',5,-6],
    ['i6','Nike Vapor Pro 3','putih','sepatu','men',10,-2],
    ['i7','Babolat Pure Aero 2023','kuning','raket','',15,-120],
    ['i8','Mizuno Wave Exceed Tour 6','pink','sepatu','women',7,-5]];
  items.forEach(([id,name,color,cat,gender,qty,arr])=>{S['items/'+id]={name,color,cat,gender,hot:true,qty,arrived:D(arr),old:arr<-60,thumb:'',createdAt:now-Math.abs(arr)*24*H}});
  const ROLE={ktl:['R','Z',''],igf:['R','R','S'],vpr:['R','Z','S'],vrv:['A','R','S'],idc:['A','A','S'],idf:['R','R','S']};
  const CAP='Langkah ringan, rally makin panjang! 🎾\n✅ Bantalan GEL di tumit\n✅ Upper mesh yang adem\n✅ Stabil untuk hard court\nCobain langsung di toko, ukuran masih lengkap!\n\n📍 Tirtonic Tennis Store Jogja\n💬 Info & order: DM atau WhatsApp (link di bio)\n\n#asicstennis #gelresolution9 #sepatutenis #tirtonic #tenisjogja';
  let n=0;
  const T=(item,type,status,shoot,edit,post,extra)=>{const [p,e,tal]=ROLE[type];const it=S['items/'+item];const id='t'+(++n);
    const hist=[];if(status!=='Terdata')hist.push({at:now-30*H,by:p,name:{R:'Rayhan',A:'Aulia',Z:'Zaki',S:'Salma'}[p],from:'Terdata',to:'Diproduksi'});
    if(['Editing','Ready','Tayang'].includes(status))hist.push({at:now-20*H,by:e,name:{R:'Rayhan',A:'Aulia',Z:'Zaki',S:'Salma'}[e],from:'Diproduksi',to:'Editing'});
    if(['Ready','Tayang'].includes(status))hist.push({at:now-6*H,by:e,name:{R:'Rayhan',A:'Aulia',Z:'Zaki',S:'Salma'}[e],from:'Editing',to:'Ready'});
    S['tasks/'+id]=Object.assign({itemId:item,title:it.name+' '+it.color,cat:it.cat,type,prio:{ktl:1,igf:2,vpr:3,vrv:4,idc:4,idf:4}[type],status,
      producer:p,editor:e,talent:tal,script:(type==='vrv'||type==='idc')?(type==='vrv'?'S':'A'):'',shootPlan:D(shoot),editPlan:D(edit),due:D(edit),target:type==='ktl'?D(edit):'',
      shotAt:status!=='Terdata'?D(Math.min(shoot,0)):'',readyAt:['Ready','Tayang'].includes(status)?D(Math.min(edit,0)):'',postAt:post==null?'':D(post),
      eventKey:'',source:'baru',reason:'',history:hist,createdAt:now-3*24*H,updatedAt:now-2*H},extra||{})};
  const drv='https://drive.google.com/file/d/contoh/view';
  T('i1','ktl','Ready',-2,-1,null,{checked:true,driveUrl:drv});
  T('i1','igf','Ready',-2,-1,1,{checked:true,driveUrl:drv,caption:CAP,metaAt:now-3*H,postTime:'09:00'});
  T('i1','vpr','Editing',-1,0,2);
  T('i1','vrv','Terdata',1,3,5);
  T('i2','ktl','Editing',-1,0,null);
  T('i2','igf','Diproduksi',0,1,3);
  T('i2','vpr','Terdata',1,2,4);
  T('i2','vrv','Terdata',2,5,7);
  T('i3','ktl','Ready',-3,-2,null,{driveUrl:drv});
  T('i3','igf','Ready',-2,-1,2,{driveUrl:drv});
  T('i3','vpr','Diproduksi',0,1,3);
  T('i4','igf','Terdata',-1,-1,2);
  T('i4','vrv','Editing',-2,-1,1);
  T('i5','igf','Tayang',-5,-4,-1,{checked:true,driveUrl:drv,metaAt:now-50*H,postTime:'15:00'});
  T('i5','vpr','Tayang',-5,-3,-2,{checked:true,driveUrl:drv,metaAt:now-70*H,postTime:'12:00'});
  T('i6','igf','Terdata',1,1,3);
  T('i6','vrv','Editing',-1,1,4);
  T('i7','idc','Terdata',1,2,6,{source:'lama',reason:'idcc'});
  T('i8','vrv','Ready',-3,-1,3,{checked:true,driveUrl:drv,caption:CAP.replace('Langkah ringan','Ringan dan responsif')});
  S['logs/balance']={updatedAt:now-2*H,entries:[]};
  const who={rayhan:'rayhan@tirtonic.id',aulia:'aulia@tirtonic.id',salma:'salma@tirtonic.id'}[location.hash.slice(1)]||'kepala@tirtonic.id';
  window.__STORE=S;window.__OWNERS=['kepala@tirtonic.id'];window.__USER={email:who,displayName:who};window.__NEXT_USER=window.__USER;
  window.__DEMO_WHO=who;
  addEventListener('hashchange',()=>location.reload());
  /* AI tiruan untuk simulasi (website asli memakai fungsi Netlify + Claude) */
  const realFetch=window.fetch.bind(window);
  window.fetch=async(url,opt)=>{if(String(url).includes('idcc-ai')){const b=JSON.parse((opt&&opt.body)||'{}');await new Promise(r=>setTimeout(r,900));let out;
      if(b.mode==='caption')out={caption:(b.nama||'Barang ini')+' siap nemenin sesi latihanmu! 🎾\n✅ '+String(b.deskripsi||'').split(/[.\n]/).filter(Boolean).slice(0,2).map(x=>x.trim()).join('\n✅ ')+'\nCek langsung di toko ya!',hashtag:['tenis','tennisindonesia',String(b.kategori||'').toLowerCase()].filter(Boolean)};
      else if(b.mode==='nilai'){const R=['video','foto','pantau','keduanya'];out={items:(b.barang||[]).map((x,i)=>({id:x.id,rekomendasi:R[i%4],prioritas:1+i%3,alasan:'Stok lebih dari 90 hari: '+x.stok_lebih_90_hari+' unit dari total '+x.stok+'.',ide_konten:'Contoh ide: try-on singkat semua ukuran yang tersedia.'}))}}
      else out={ringkasan:'Ringkasan contoh dari simulasi. Di website asli, ringkasan ini ditulis AI.'};
      return new Response(JSON.stringify(out),{status:200,headers:{'content-type':'application/json'}})}
    return realFetch(url,opt)};
})();
