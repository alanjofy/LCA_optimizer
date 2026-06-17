// -- CONFIG --------------------------------------------------------------------
const EPD_BASE = {
  cs: {
    'NORTEC':         { elec: 9.16, thermal: 13.23, water: 28.13, alpha: 0.93,  beta: 36.08 },
    'FLOOR and more': { elec: 4.43, thermal: 13.40, water: 23.10, alpha: 6.57,  beta: 20.81 },
    'NORIT':          { elec: 4.43, thermal: 13.40, water: 23.10, alpha: 6.57,  beta: 20.81 },
  },
  wf: {
    'LIGNA':    { energy: 0.60, virginWood: 9.3, incinerationBase: 78.56 },
    'LIGNA ST': { energy: 0.60, virginWood: 9.3, incinerationBase: 78.56 },
  },
};

const MATH_INFO = {
  co2_cs_reuse:    { formula: '(A1-C4 orig - A1-C4 ref) x m2', example: 'e.g. (14.60 - 3.41) x 500 = 5,595 kg CO2' },
  energy_cs:       { formula: '(Elec% x base_elec + Thermal% x base_thermal) x m2', example: 'e.g. (0.93x9.16 + 1.00x13.23) x 500 kWh' },
  water_cs:        { formula: 'Water% x base_water_litres x m2', example: 'e.g. 1.00 x 28.13 x 500 = 14,065 L' },
  gypsum_cs:       { formula: '(Alpha% x base_alpha + Beta% x base_beta) x m2', example: 'e.g. (1.00x0.93 + 1.00x36.08) x 500 = 18,505 kg' },
  co2_wf_reuse:    { formula: '(A1-C4 orig - A1-C4 ref) x m2', example: 'e.g. (5.14 - 1.02) x 500 = 2,060 kg CO2' },
  wood_wf:         { formula: 'Wood% x 9.3 kg/m2 x m2', example: 'e.g. 0.50 x 9.3 x 500 = 2,325 kg' },
  energy_wf_reuse: { formula: 'Elec% x base_energy_kWh x m2', example: 'e.g. 1.00 x 0.60 x 500 = 300 kWh' },
  elec_recovery:   { formula: 'ElecRec% x (18.66 kg x 4.21 kWh/kg) x m2', example: 'e.g. 0.25 x 78.56 x 12 = 235.7 kWh' },
  thermal_recovery:{ formula: 'ThermalRec% x (18.66 kg x 4.21 kWh/kg) x m2', example: 'e.g. 0.45 x 78.56 x 12 = 424.2 kWh' },
};

const EOL_INFO = {
  Landfilling: {
    label:'LANDFILLING', title:'End of the Product',
    color:'#e05c5c', fallback:'linear-gradient(160deg,#2a1a1a,#3d2020)',
    bullets:[{icon:'X',text:'No material or energy recovered'},{icon:'!',text:'Worst environmental outcome'}],
  },
  Recycling: {
    label:'RECYCLING', title:'Back into Production',
    color:'#c8b84a', fallback:'linear-gradient(160deg,#1e2010,#2e3518)',
    bullets:[{icon:'*',text:'Raw material recovered and re-entered into production'},{icon:'~',text:'Reduces demand for virgin material'}],
  },
  Reuse: {
    label:'REUSE', title:'A Second Life',
    color:'#4ecca3', fallback:'linear-gradient(160deg,#0d1f1a,#122b22)',
    bullets:[
      {icon:'*',text:'Product refurbished — no new production needed'},
      {icon:'+',text:'Maximum carbon and resource savings'},
    ],
    bulletsCarbonWood:[
      {icon:'*',text:'Panel refurbished — no new production needed'},
      {icon:'🌳',text:'Avoids cutting new trees — virgin Wood demand eliminated'},
      {icon:'🧠',text:'Carbon stored in wood is preserved — no release from burning or decay'},
      {icon:'+',text:'Maximum carbon and resource savings'},
    ],
  },
  Incineration: {
    label:'INCINERATION', title:'Energy Recovery',
    color:'#f7a04a', fallback:'linear-gradient(160deg,#1f1200,#2e1e00)',
    bullets:[{icon:'~',text:'Product burned — energy recovered'},{icon:'*',text:'Generates electricity and District heat'}],
  },
};

const CR_EOL_INFO = {
  Reuse: {
    label:'REUSE', title:'A Second Life',
    color:'#4ecca3', fallback:'linear-gradient(160deg,#0d1f1a,#122b22)',
    bullets:[
      {icon:'*', text:'CAS room refurbished -- no new production needed'},
      {icon:'+', text:'All modular components reused in new configuration'},
      {icon:'~', text:'Maximum energy and material resource savings'},
      {icon:'~', text:'Carbon locked in materials is preserved -- no new extraction'},
    ],
  },
  Recycling: {
    label:'RECYCLING', title:'Material Recycling',
    color:'#c8b84a', fallback:'linear-gradient(160deg,#1e2010,#2e3518)',
    bullets:[
      {icon:'*', text:'CAS room dismantled -- components sorted by material'},
      {icon:'~', text:'Aluminium, glass, steel, wood & stainless steel recovered'},
      {icon:'+', text:'Raw materials re-entered into production cycles'},
    ],
  },
};

const CU_EOL_INFO = {
  Reuse: {
    label:'REUSE', title:'A Second Life',
    color:'#4ecca3', fallback:'linear-gradient(160deg,#0d1f1a,#122b22)',
    bullets:[
      {icon:'*', text:'Cube modules refurbished -- no new production needed'},
      {icon:'+', text:'All components reconfigured for new workspace'},
      {icon:'~', text:'Maximum energy and material resource savings'},
      {icon:'~', text:'Embodied carbon preserved -- zero new extraction'},
    ],
  },
  Recycling: {
    label:'RECYCLING', title:'Material Recovery',
    color:'#c8b84a', fallback:'linear-gradient(160deg,#1e2010,#2e3518)',
    bullets:[
      {icon:'*', text:'Cube dismantled -- materials sorted and recovered'},
      {icon:'~', text:'Steel, aluminium, glass, plastic, fabric & gips separated for recycling'},
      {icon:'+', text:'High-value materials re-entered production cycles'},
    ],
  },
};

// -- LOCAL PHOTO MAP ----------------------------------------------------------
const LOCAL_PHOTOS = {
  cs: { Reuse: 'gypsum_reuse.jpg', Recycling: 'gypsum_recycling.webp', Landfilling: 'gypsum_landfilling.jpg' },
  wf: { Reuse: 'ligna.jpg', Incineration: 'ligna_incineration.avif' },
  cr: { Reuse: 'CAS_reuse.png', Recycling: 'metalrecycling.jpg' },
  cu: { Reuse: 'cube_reuse.jpg', Recycling: 'cube_recycling.jpg' },
};


const CUBE_PRODUCT_PHOTOS = {
  twa310: 'cube1.jpg',
  twa312: 'cube2.jpg',
  twa311: 'cube4+5.jpg',
  twa314: 'cube6.jpg',
  twa301: 'cube7.jpg',
};

function getCubePhoto(product){
  const code = compactText(product).split(' ')[0].toLowerCase();
  return CUBE_PRODUCT_PHOTOS[code] || null;
}

// -- MATERIALS -----------------------------------------------------------------
const MATERIALS = {
  cs:{csvPath:'calcium_sulphate.csv',selProduct:'sel-product-cs',selEol:'sel-eol-cs',results:'results-cs',inner:'results-inner-cs',noData:'no-data-cs',loading:'csv-loading-cs',error:'csv-error-cs',data:{}},
  wf:{csvPath:'wooden_floors.csv',selProduct:'sel-product-wf',selEol:'sel-eol-wf',results:'results-wf',inner:'results-inner-wf',noData:'no-data-wf',loading:'csv-loading-wf',error:'csv-error-wf',data:{}},
  cr:{csvPath:'cas_room.csv',selProduct:'sel-product-cr',selEol:'sel-eol-cr',results:'results-cr',inner:'results-inner-cr',noData:'no-data-cr',loading:'csv-loading-cr',error:'csv-error-cr',data:{}},
  cu:{csvPath:'cubes.csv',selProduct:'sel-product-cu',selEol:'sel-eol-cu',results:'results-cu',inner:'results-inner-cu',noData:'no-data-cu',loading:'csv-loading-cu',error:'csv-error-cu',data:{}},
};

let _pieId=0, _renderStamp=0, _pieRegistry=[];
const parsePct = v=>{const s=(v||'').replace('%','').trim();return s===''?0:parseInt(s,10)||0;};
const compactText = v => String(v || '').replace(/\s+/g,' ').trim();
const normalizeHeader = v => compactText(v).toLowerCase();
const escapeJsString = v => String(v || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");

function parseCSVRows(text){
  const rows=[];
  const normalized=String(text||'').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  let row=[], cell='', inQuotes=false;
  for(let i=0;i<normalized.length;i++){
    const ch=normalized[i];
    if(ch==='"'){
      if(inQuotes && normalized[i+1]==='"'){ cell+='"'; i++; }
      else { inQuotes=!inQuotes; }
    }else if(ch===',' && !inQuotes){
      row.push(cell); cell='';
    }else if(ch==='\n' && !inQuotes){
      row.push(cell); rows.push(row); row=[]; cell='';
    }else{
      cell+=ch;
    }
  }
  if(cell!=='' || row.length){ row.push(cell); rows.push(row); }
  return rows.map(r=>r.map(c=>c.trim()));
}

// -- EOL CARD ------------------------------------------------------------------
function showEolCard(matKey, eol, product='') {
  const area = document.getElementById('eol-card-area-' + matKey);
  if (!area) return;
  if (!eol) { area.style.display='none'; area.innerHTML=''; return; }
  let info = (matKey==='cr' && CR_EOL_INFO[eol]) ? CR_EOL_INFO[eol] : (matKey==='cu' && CU_EOL_INFO[eol]) ? CU_EOL_INFO[eol] : EOL_INFO[eol];
  if (!info) return;
  const activeBullets = (eol==='Reuse' && matKey==='wf' && info.bulletsCarbonWood) ? info.bulletsCarbonWood : info.bullets;
  const eolIcons = { Reuse: ['✨','🌳','🧠','+'], Recycling: ['🏭','♻️','🔵'], Incineration: ['🔥','💡','♻️'], Landfilling: ['❌','📍','⚠️'] };
  const iconArr = eolIcons[eol]||[];
  let localImg = LOCAL_PHOTOS[matKey] && LOCAL_PHOTOS[matKey][eol];
  if (matKey === 'cu' && product) {
    localImg = getCubePhoto(product) || localImg;
  }
  const photoBg = localImg ? `background:${info.fallback};background-image:url('${localImg}');background-size:cover;background-position:center` : `background:${info.fallback}`;
  area.innerHTML = `<div class="eol-single-card" style="border-color:${info.color};box-shadow:0 0 24px ${info.color}28"><div class="eol-card-photo" style="${photoBg}"><div class="eol-photo-overlay"></div></div><div class="eol-card-body"><div class="eol-card-label" style="color:${info.color}">${info.label}</div><div class="eol-card-title">${info.title}</div><ul class="eol-card-bullets">${activeBullets.map((b,i)=>`<li><span class="eol-bullet-icon">${iconArr[i]||'•'}</span>${b.text}</li>`).join('')}</ul></div></div>`;
  area.style.display = 'block';
}

// -- MATERIAL SWITCH -----------------------------------------------------------
function switchMaterial(key){
  const isCS=key==='calcium_sulphate', isWF=key==='wooden_floors', isCR=key==='cas_room', isCU=key==='cubes';
  document.getElementById('btn-cs').classList.toggle('active',isCS);
  document.getElementById('btn-wf').classList.toggle('active',isWF);
  document.getElementById('btn-cr').classList.toggle('active',isCR);
  document.getElementById('btn-cu').classList.toggle('active',isCU);
  document.getElementById('panel-calcium_sulphate').style.display=isCS?'block':'none';
  document.getElementById('panel-wooden_floors').style.display=isWF?'block':'none';
  document.getElementById('panel-cas_room').style.display=isCR?'block':'none';
  document.getElementById('panel-cubes').style.display=isCU?'block':'none';
}

// -- CSV PARSERS ---------------------------------------------------------------
function parseCSV_cs(text){
  const parsed={};
  text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').replace(/^\uFEFF/,'').split('\n').map(r=>r.split(',').map(c=>c.trim())).forEach(cols=>{
    const product=cols[1],eol=cols[2],origVal=parseFloat(cols[3]);
    if(!product||!eol||isNaN(origVal))return;
    if(product.toLowerCase().includes('calcium')||product.toLowerCase().includes('boden')||eol.toLowerCase()==='eol')return;
    if(!parsed[product])parsed[product]={refurbishedTo:'',scenarios:{}};
    if(cols[4])parsed[product].refurbishedTo=cols[4];
    parsed[product].scenarios[eol]={a1c4_orig:origVal,a1c4_ref:eol==='Reuse'?(parseFloat(cols[5])||0):0,
      electricity:parsePct(cols[6]),thermal:parsePct(cols[7]),water:parsePct(cols[8]),alpha:parsePct(cols[9]),beta:parsePct(cols[10])};
  });
  return parsed;
}

function parseCSV_wf(text){
  const parsed={};
  text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').replace(/^\uFEFF/,'').split('\n').map(r=>r.split(',').map(c=>c.trim())).forEach(cols=>{
    const product=cols[1],eol=cols[2],origVal=parseFloat(cols[3]);
    if(!product||!eol||isNaN(origVal))return;
    if(product.toLowerCase().includes('wooden')||product.toLowerCase().includes('boden')||eol.toLowerCase()==='eol')return;
    if(!parsed[product])parsed[product]={refurbishedTo:'',scenarios:{}};
    if(cols[4])parsed[product].refurbishedTo=cols[4].trim();
    parsed[product].scenarios[eol]={a1c4_orig:origVal,a1c4_ref:eol==='Reuse'?(parseFloat(cols[5])||0):0,
      electricity:parsePct(cols[6]),thermal:parsePct(cols[7]),treeSavings:parsePct(cols[8]),steelSavings:parsePct(cols[9]),
      recoveryElec:parsePct(cols[10]),recoveryThermal:parsePct(cols[11])};
  });
  return parsed;
}

function parseCSV_cr(text){
  const parsed={};
  const pct=v=>{const x=(v||'').replace('%','').trim();return x===''?0:parseInt(x,10)||0;};
  text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').forEach(line=>{
    if(!line.trim())return;
    const cols=line.split(',').map(c=>c.trim());
    const product=cols[0], eolRaw=(cols[1]||'').trim(), origVal=parseFloat(cols[2]);
    if(!product||!eolRaw||isNaN(origVal))return;
    if(product.toLowerCase().includes('cas')&&product.toLowerCase().includes('type'))return;
    if(eolRaw.toLowerCase().includes('scenario'))return;
    const eol=eolRaw.toLowerCase().includes('rec')?'Recycling':'Reuse';
    if(!parsed[product])parsed[product]={refurbishedTo:'Refurbished CAS Room',scenarios:{}};
    parsed[product].scenarios[eol]={a1c4_orig:origVal, a1c4_ref:eol==='Reuse'?(parseFloat(cols[3])||0):0, energy:pct(cols[3]),
      aluminium:pct(cols[4]), steel:pct(cols[5]), wood:pct(cols[6]), glass:pct(cols[7]), stainlessSteel:pct(cols[8])};
  });
  return parsed;
}

function parseCSV_cu(text){
  const parsed={};
  const rows=parseCSVRows(text);
  if(!rows.length)return parsed;
  const headers=rows[0].map(normalizeHeader);
  const findIndex=(...aliases)=>{
    const wanted=aliases.map(normalizeHeader);
    return headers.findIndex(h=>wanted.includes(h));
  };
  const getVal=(row,...aliases)=>{
    const idx=findIndex(...aliases);
    return idx>=0?(row[idx]??''):'';
  };

  rows.slice(1).forEach(row=>{
    if(!row.some(c=>compactText(c)))return;
    const product=compactText(getVal(row,'Cube Type','Cube','Product','Type','Cube Name'));
    const eolRaw=compactText(getVal(row,'Scenario','EOL','EOL Scenario'));
    const origVal=parseFloat(getVal(row,'A1-C4','A1C4'));
    if(!product||!eolRaw||isNaN(origVal))return;
    const eol=/rec/i.test(eolRaw)?'Recycling':'Reuse';
    if(!parsed[product])parsed[product]={refurbishedTo:`Refurbished ${product}`,scenarios:{}};
    parsed[product].scenarios[eol]={
      a1c4_orig:origVal,
      a1c4_ref:eol==='Reuse'?(parseFloat(getVal(row,'Refurbished A1-C4','Refurbished A1C4','Refurbished'))||0):0,
      energy:parsePct(getVal(row,'Energy savings','Energy')),
      aluminium:parsePct(getVal(row,'Aluminium','Aluminum')),
      steel:parsePct(getVal(row,'Steel')),
      wood:parsePct(getVal(row,'Wood')),
      glass:parsePct(getVal(row,'Glass')),
      plastic:parsePct(getVal(row,'Plastic')),
      fabric:parsePct(getVal(row,'Fabric','Textile')),
      gips:parsePct(getVal(row,'Gips','Gypsum')),
    };
  });
  return parsed;
}

function populateSelectors(matKey){
  const m=MATERIALS[matKey];
  const selProduct=document.getElementById(m.selProduct), selEol=document.getElementById(m.selEol);
  const products=Object.keys(m.data);
  selProduct.innerHTML='<option value="">— Select product —</option>';
  products.forEach(p=>{const o=document.createElement('option');o.value=p;o.textContent=p;selProduct.appendChild(o);});
  const eolSet=new Set();
  products.forEach(p=>Object.keys(m.data[p].scenarios).forEach(e=>eolSet.add(e)));
  const order=['Reuse','Recycling','Incineration','Landfilling'];
  selEol.innerHTML='<option value="">— Select EOL scenario —</option>';
  order.forEach(e=>{if(eolSet.has(e)){const o=document.createElement('option');o.value=e;o.textContent=e;selEol.appendChild(o);eolSet.delete(e);}});
  eolSet.forEach(e=>{const o=document.createElement('option');o.value=e;o.textContent=e;selEol.appendChild(o);});
  selProduct.value='';selEol.value='';
  document.getElementById(m.results).classList.remove('visible');
  document.getElementById(m.noData).style.display='block';
}

// -- PIE CHARTS ----------------------------------------------------------------
function makePie(pctVal,color){
  const id='pie-'+_renderStamp+'-'+(_pieId++);
  const r=54, circ=2*Math.PI*r;
  const arcColor=pctVal===0?'var(--surface2)':color;
  const textColor=pctVal===0?'var(--text-dim)':'var(--text)';
  const linecap=pctVal>=100?'butt':'round';
  const targetDash=pctVal>=100?circ:(pctVal/100)*circ;
  const glow=pctVal>0?`filter:drop-shadow(0 0 10px ${color}66);`:'';
  _pieRegistry.push({arcId:`${id}-arc`,txtId:`${id}-txt`,targetPct:pctVal,targetDash,fullDash:circ,linecap});
  return `<div class="pie-svg-wrap"><svg viewBox="0 0 140 140" overflow="visible"><circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="13"/><circle id="${id}-arc" cx="70" cy="70" r="${r}" fill="none" stroke="${arcColor}" stroke-width="13" stroke-dasharray="0 ${circ}" stroke-linecap="${linecap}" style="transition:stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1);${glow}"/></svg><div class="pie-pct-text" id="${id}-txt" style="color:${textColor}">0%</div></div>`;
}

function animateAllPies(){
  const registry=[..._pieRegistry];
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    setTimeout(()=>{
      registry.forEach(({arcId,txtId,targetPct,targetDash,fullDash,linecap})=>{
        const arc=document.getElementById(arcId),txt=document.getElementById(txtId);
        if(!arc||!txt)return;
        arc.setAttribute('stroke-linecap',linecap||'round');
        arc.style.strokeDasharray=`${targetDash} ${fullDash}`;
        if(targetPct>0){let cur=0;const inc=Math.max(1,Math.ceil(targetPct/50));const tick=()=>{cur=Math.min(cur+inc,targetPct);txt.textContent=cur+'%';if(cur<targetPct)requestAnimationFrame(tick);else txt.textContent=targetPct+'%';};requestAnimationFrame(tick);}else{txt.textContent='0%';}
      });
    },80);
  }));
}

function animateDonut(stamp,reduction){
  const circ=2*Math.PI*80,filled=(reduction/100)*circ;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    setTimeout(()=>{
      const arc=document.getElementById('donut-arc-'+stamp), pctEl=document.getElementById('donut-pct-'+stamp);
      if(!arc||!pctEl)return;
      arc.style.strokeDasharray=`${filled} ${circ}`;
      let start=0;const inc=Math.max(1,Math.ceil(reduction/60));const step=()=>{start=Math.min(start+inc,reduction);pctEl.textContent=start+'%';if(start<reduction)requestAnimationFrame(step);};requestAnimationFrame(step);
    },120);
  }));
}

function co2Reduction(orig,ref){return Math.round(((orig-ref)/orig)*100);}
function fmt(val,dec=1){
  if(typeof val!=='number'||isNaN(val))return '0';
  const parts=val.toFixed(dec).split('.');let intPart=parts[0],decPart=parts[1]||'';const neg=intPart.startsWith('-');if(neg)intPart=intPart.slice(1);
  let res='';if(intPart.length>3){const last3=intPart.slice(-3);const rest=intPart.slice(0,-3);const groups=[];for(let i=rest.length;i>0;i-=3)groups.unshift(rest.slice(Math.max(0,i-3),i));res=groups.join(',')+','+last3;}else{res=intPart;}
  return (neg?'-':'')+res+(dec>0?'.'+decPart:'');
}
function pieItem(pct,color,label,sub){return `<div class="pie-item">${makePie(pct,color)}<div class="pie-label-block"><span class="pie-label" style="color:${color}">${label}</span><span class="pie-sublabel">${sub}</span></div></div>`;}

// -- MATH TOOLTIP -------------------------------------------------------------
function mathTooltip(key){const info=MATH_INFO[key];if(!info)return'';return`<button class="math-btn" onclick="toggleMath('math-${key}')" title="Show formula">f</button><div class="math-tooltip" id="math-${key}" style="display:none"><div class="math-formula">${info.formula}</div><div class="math-example">${info.example}</div></div>`;}
function toggleMath(id){const el=document.getElementById(id);if(el)el.style.display=el.style.display==='none'?'block':'none';}

// -- SAVINGS CARDS -------------------------------------------------------------
function renderSavingsCS(sc){
  const energyAvg=Math.round((sc.electricity+sc.thermal)/2),gypsumAvg=Math.round((sc.alpha+sc.beta)/2);
  return `<div class="savings-grid-outer savings-3col anim anim-d3"><div class="savings-card-new"><div class="savings-card-top"><div class="savings-card-icon">⚡</div><div class="savings-card-title-block"><div class="savings-card-title">Energy Savings</div><div class="savings-card-desc">Combined electricity and thermal energy avoided vs. new production.</div></div></div><div class="savings-card-body">${pieItem(energyAvg,'#f7c873','Energy Savings','% vs. new production')}</div></div><div class="savings-card-new"><div class="savings-card-top"><div class="savings-card-icon">💧</div><div class="savings-card-title-block"><div class="savings-card-title">Water Savings</div><div class="savings-card-desc">Freshwater consumption avoided vs. manufacturing new.</div></div></div><div class="savings-card-body">${pieItem(sc.water,'#7b9ee8','Water Savings','% vs. new production')}</div></div><div class="savings-card-new"><div class="savings-card-top"><div class="savings-card-icon">🏔️</div><div class="savings-card-title-block"><div class="savings-card-title">Resource Savings</div><div class="savings-card-desc">Alpha and beta gypsum recovered — mining avoided.</div></div></div><div class="savings-card-body">${pieItem(gypsumAvg,'#4ecca3','Resource Savings','% material recovered')}</div></div></div>`;
}

function renderSavingsWF(sc,product){
  const isST=product&&product.toUpperCase().includes('ST');
  const hasEnergy=sc.electricity>0||sc.thermal>0,hasResource=sc.treeSavings>0||sc.steelSavings>0,hasRecovery=sc.recoveryElec>0||sc.recoveryThermal>0;
  const energyAvg=Math.round((sc.electricity+sc.thermal)/2);
  const cardCount=[hasEnergy,hasResource,hasRecovery].filter(Boolean).length;
  const gridClass=cardCount===3?'savings-3col':cardCount===2?'savings-2col':'savings-1col';
  return `<div class="savings-grid-outer ${gridClass} anim anim-d3">${hasEnergy?`<div class="savings-card-new"><div class="savings-card-top"><div class="savings-card-icon">⚡</div><div class="savings-card-title-block"><div class="savings-card-title">Energy Savings</div><div class="savings-card-desc">Manufacturing energy avoided vs. new production.</div></div></div><div class="savings-card-body">${pieItem(energyAvg,'#f7c873','Energy Savings','% vs. new production')}</div></div>`:''}${hasResource?`<div class="savings-card-new"><div class="savings-card-top"><div class="savings-card-icon">🌳</div><div class="savings-card-title-block"><div class="savings-card-title">Resource Savings</div><div class="savings-card-desc">${isST?'Virgin wood and steel avoided.':'Virgin wood avoided.'}</div></div></div><div class="savings-card-body">${pieItem(sc.treeSavings,'#4ecca3','Wood Savings','% virgin wood avoided')}${isST?`<div class="pie-divider"></div>${pieItem(sc.steelSavings,'#a8edcc','Steel Savings','% steel avoided')}`:''}</div></div>`:''}${hasRecovery?`<div class="savings-card-new"><div class="savings-card-top"><div class="savings-card-icon">🔥</div><div class="savings-card-title-block"><div class="savings-card-title">Energy Recovery</div><div class="savings-card-desc">Energy from incineration.</div></div></div><div class="savings-card-body">${pieItem(sc.recoveryElec,'#f7a04a','Electricity','% recovered')}<div class="pie-divider"></div>${pieItem(sc.recoveryThermal,'#e06b75','Thermal Heat','% heat recovered')}</div></div>`:''}</div>`;
}

function renderSavingsCR(sc){
  const hasEnergy=sc.energy>0,resources=[];
  if(sc.aluminium>0)resources.push({pct:sc.aluminium,color:'#a8c5da',label:'Aluminium',sub:'% recovered'});
  if(sc.steel>0)resources.push({pct:sc.steel,color:'#7b9ee8',label:'Steel',sub:'% recovered'});
  if(sc.wood>0)resources.push({pct:sc.wood,color:'#4ecca3',label:'Wood',sub:'% recovered'});
  if(sc.glass>0)resources.push({pct:sc.glass,color:'#a8edcc',label:'Glass',sub:'% recovered'});
  if(sc.stainlessSteel>0)resources.push({pct:sc.stainlessSteel,color:'#e0b87a',label:'Stainless Steel',sub:'% recovered'});
  const cards=[];
  if(hasEnergy)cards.push('<div class="savings-card-new"><div class="savings-card-top"><div class="savings-card-icon">⚡</div><div class="savings-card-title-block"><div class="savings-card-title">Energy Savings</div><div class="savings-card-desc">Manufacturing energy avoided vs. new production.</div></div></div><div class="savings-card-body">'+pieItem(sc.energy,'#f7c873','Energy Savings','% vs. new production')+'</div></div>');
  if(resources.length>0){const ringsHtml=resources.map((r,i)=>(i>0?'<div class="pie-divider"></div>':'')+pieItem(r.pct,r.color,r.label,r.sub)).join('');cards.push('<div class="savings-card-new"><div class="savings-card-top"><div class="savings-card-icon">♻️</div><div class="savings-card-title-block"><div class="savings-card-title">Material Recovery</div><div class="savings-card-desc">Aluminium, steel, wood, glass and stainless steel recovered.</div></div></div><div class="savings-card-body">'+ringsHtml+'</div></div>');}
  const gridClass=cards.length===1?'savings-1col':'savings-2col';
  return'<div class="savings-grid-outer '+gridClass+' anim anim-d3">'+cards.join('')+'</div>';
}

function renderSavingsCU(sc){
  const hasEnergy=sc.energy>0;
  const resources=[
    {pct:sc.aluminium||0,color:'#a8c5da',label:'Aluminium',sub:'% recovered'},
    {pct:sc.steel||0,color:'#7b9ee8',label:'Steel',sub:'% recovered'},
    {pct:sc.wood||0,color:'#4ecca3',label:'Wood',sub:'% recovered'},
    {pct:sc.glass||0,color:'#a8edcc',label:'Glass',sub:'% recovered'},
    {pct:sc.plastic||0,color:'#ffd93d',label:'Plastic',sub:'% recovered'},
    {pct:sc.fabric||0,color:'#e0b87a',label:'Fabric',sub:'% recovered'},
    {pct:sc.gips||0,color:'#c9b37d',label:'Gips',sub:'% recovered'},
  ];
  const cards=[];
  if(hasEnergy)cards.push('<div class="savings-card-new"><div class="savings-card-top"><div class="savings-card-icon">⚡</div><div class="savings-card-title-block"><div class="savings-card-title">Energy Savings</div><div class="savings-card-desc">Manufacturing energy avoided vs. new cube production.</div></div></div><div class="savings-card-body">'+pieItem(sc.energy,'#f7c873','Energy Savings','% vs. new production')+'</div></div>');
  const ringsHtml=resources.map((r,i)=>(i>0?'<div class="pie-divider"></div>':'')+pieItem(r.pct,r.color,r.label,r.sub)).join('');
  cards.push('<div class="savings-card-new"><div class="savings-card-top"><div class="savings-card-icon">🏢</div><div class="savings-card-title-block"><div class="savings-card-title">Material Recovery</div><div class="savings-card-desc">Aluminium, steel, wood, glass, plastic, fabric and gips recovered.</div></div></div><div class="savings-card-body">'+ringsHtml+'</div></div>');
  const gridClass=cards.length===1?'savings-1col':'savings-2col';
  return'<div class="savings-grid-outer '+gridClass+' anim anim-d3">'+cards.join('')+'</div>';
}

// -- ABSOLUTE IMPACT -----------------------------------------------------------
function absStatCard(icon,value,unit,label,color,mathKey){return`<div class="abs-stat-card"><div class="abs-stat-header"><div class="abs-stat-icon">${icon}</div>${mathKey?mathTooltip(mathKey):''}</div><div class="abs-stat-value" style="color:${color}">${value}</div><div class="abs-stat-unit">${unit}</div><div class="abs-stat-label">${label}</div></div>`;}

function renderAbsoluteCS(product,sc,m2){
  const base=EPD_BASE.cs[product]||EPD_BASE.cs['FLOOR and more'],cards=[];
  if(sc.a1c4_ref>0){const co2=(sc.a1c4_orig-sc.a1c4_ref)*m2;if(co2>0)cards.push(absStatCard('🌿',fmt(co2),'kg CO2 avoided','Carbon footprint avoided vs. new production','#4ecca3','co2_cs_reuse'));}
  const elecS=(sc.electricity/100)*base.elec*m2,thermalS=(sc.thermal/100)*base.thermal*m2,energyS=elecS+thermalS;
  if(energyS>0)cards.push(absStatCard('⚡',fmt(energyS),'kWh saved','Electricity + thermal energy avoided','#f7c873','energy_cs'));
  const waterS=(sc.water/100)*base.water*m2;if(waterS>0)cards.push(absStatCard('💧',fmt(waterS),'litres saved','Freshwater consumption avoided','#7b9ee8','water_cs'));
  const gypsumS=((sc.alpha/100)*base.alpha+(sc.beta/100)*base.beta)*m2;if(gypsumS>0)cards.push(absStatCard('🪨',fmt(gypsumS),'kg gypsum saved','Virgin gypsum extraction avoided','#a8edcc','gypsum_cs'));
  if(!cards.length)return'';
  return`<div class="abs-section anim anim-d4"><div class="section-label">Project Impact</div><div class="abs-impact-banner"><div class="abs-impact-banner-icon">🎉</div><div class="abs-impact-banner-text"><strong>Total Impact for ${fmt(m2,0)} m²</strong><span>Estimated savings when refurbishing instead of producing new flooring</span></div></div><div class="abs-grid">${cards.join('')}</div></div>`;
}

function renderAbsoluteWF(product,sc,eol,m2){
  const base=EPD_BASE.wf[product]||EPD_BASE.wf['LIGNA'],cards=[];
  if(eol==='Reuse'){
    if(sc.a1c4_ref>0){const co2=(sc.a1c4_orig-sc.a1c4_ref)*m2;if(co2>0)cards.push(absStatCard('🌿',fmt(co2),'kg CO2 avoided','Carbon footprint avoided','#4ecca3','co2_wf_reuse'));}
    const woodS=(sc.treeSavings/100)*base.virginWood*m2;if(woodS>0)cards.push(absStatCard('🌳',fmt(woodS),'kg wood saved','Virgin Wood extraction avoided','#a8edcc','wood_wf'));
    const energyS=(sc.electricity/100)*base.energy*m2;if(energyS>0)cards.push(absStatCard('⚡',fmt(energyS),'kWh saved','Manufacturing energy avoided','#f7c873','energy_wf_reuse'));
  }else{
    const inc=base.incinerationBase;
    const elecG=(sc.recoveryElec/100)*inc*m2,thermalG=(sc.recoveryThermal/100)*inc*m2;
    if(elecG>0)cards.push(absStatCard('💡',fmt(elecG),'kWh electricity','Electricity generated','#f7a04a','elec_recovery'));
    if(thermalG>0)cards.push(absStatCard('🔥',fmt(thermalG),'kWh heat','Thermal energy recovered','#e06b75','thermal_recovery'));
  }
  if(!cards.length)return'';
  const bannerText=eol==='Reuse'?'Estimated savings when refurbishing instead of producing new flooring':'Energy generated from biomass incineration at end of life';
  return`<div class="abs-section anim anim-d4"><div class="section-label">Project Impact</div><div class="abs-impact-banner"><div class="abs-impact-banner-icon">${eol==='Reuse'?'🎉':'⚡'}</div><div class="abs-impact-banner-text"><strong>Total Impact for ${fmt(m2,0)} m²</strong><span>${bannerText}</span></div></div><div class="abs-grid">${cards.join('')}</div></div>`;
}

function renderAbsoluteCR(product,sc,eol,m2){
  const cards=[];
  if(eol==='Reuse'){const co2=(sc.a1c4_orig-sc.a1c4_ref)*m2;if(co2>0)cards.push(absStatCard('🌿',fmt(co2),'kg CO2 avoided','Full carbon footprint avoided -- CAS room fully reused','#4ecca3',null));}
  if(!cards.length)return'';
  return`<div class="abs-section anim anim-d4"><div class="section-label">Project Impact</div><div class="abs-impact-banner"><div class="abs-impact-banner-icon">🎉</div><div class="abs-impact-banner-text"><strong>Total Impact for ${fmt(m2,0)} m²</strong><span>${eol==='Reuse'?'Full CO2 savings -- CAS Room fully reused, no new production':'Material recovery savings'}</span></div></div><div class="abs-grid">${cards.join('')}</div></div>`;
}

function renderAbsoluteCU(product,sc,eol,m2){
  const cards=[];
  if(eol==='Reuse'){const co2=(sc.a1c4_orig-sc.a1c4_ref)*m2;if(co2>0)cards.push(absStatCard('🌿',fmt(co2),'kg CO2 avoided','Carbon footprint avoided vs. new cube production','#4ecca3',null));const energyS=(sc.energy/100)*m2;if(energyS>0)cards.push(absStatCard('⚡',fmt(energyS),'kWh saved','Manufacturing energy avoided','#f7c873',null));}
  if(!cards.length)return'';
  return`<div class="abs-section anim anim-d4"><div class="section-label">Project Impact</div><div class="abs-impact-banner"><div class="abs-impact-banner-icon">🎉</div><div class="abs-impact-banner-text"><strong>Total Impact for ${fmt(m2,0)} Units</strong><span>${eol==='Reuse'?'Full savings -- Cube modules fully reused, no new production':'Material recovery savings'}</span></div></div><div class="abs-grid">${cards.join('')}</div></div>`;
}

function updateAbsoluteSingle(matKey,product,eol){
  const input=document.getElementById('mlinput-'+matKey),absEl=document.getElementById('mlabs-'+matKey);
  if(!input||!absEl)return;const m2=parseFloat(input.value);if(!m2||m2<=0){absEl.innerHTML='';return;}
  const sc=MATERIALS[matKey].data[product].scenarios[eol];
  if(matKey==='cs')absEl.innerHTML=renderAbsoluteCS(product,sc,m2);
  else if(matKey==='cr')absEl.innerHTML=renderAbsoluteCR(product,sc,eol,m2);
  else if(matKey==='cu')absEl.innerHTML=renderAbsoluteCU(product,sc,eol,m2);
  else absEl.innerHTML=renderAbsoluteWF(product,sc,eol,m2);
}

function updateAbsoluteCompare(matKey,product,eol,side){
  const input=document.getElementById('mlinput-'+matKey+'-'+side),absEl=document.getElementById('mlabs-'+matKey+'-'+side);
  if(!input||!absEl)return;const m2=parseFloat(input.value);if(!m2||m2<=0){absEl.innerHTML='';return;}
  const sc=MATERIALS[matKey].data[product].scenarios[eol];
  if(matKey==='cs')absEl.innerHTML=renderAbsoluteCS(product,sc,m2);
  else if(matKey==='cr')absEl.innerHTML=renderAbsoluteCR(product,sc,eol,m2);
  else if(matKey==='cu')absEl.innerHTML=renderAbsoluteCU(product,sc,eol,m2);
  else absEl.innerHTML=renderAbsoluteWF(product,sc,eol,m2);
}

// -- PROJECT AREA INPUT -------------------------------------------------------
function m2CardHtml(inputId,absId,product,eol,onInputCall,isCube){
  const eolInfo=isCube?(CU_EOL_INFO[eol]||EOL_INFO[eol]):EOL_INFO[eol];
  const eolColor=eolInfo.color||'var(--accent)';
  const label=isCube?'Project Quantity':'Project Area';
  const unit=isCube?'units':'m²';
  const desc=isCube?`Enter number of cubes to see total impact for <strong style="color:${eolColor}">${eol}</strong> scenario`:`Enter floor area to see total impact for <strong style="color:${eolColor}">${eol}</strong> scenario`;
  return`<div class="m2-card anim anim-d4" style="border-color:${eolColor}20;box-shadow:0 0 20px ${eolColor}08"><div class="m2-card-label" style="color:${eolColor}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>${label}<span class="m2-badge" style="background:${eolColor}18;border-color:${eolColor}40;color:${eolColor}">optional</span></div><div class="m2-card-body"><div class="m2-card-desc">${desc}</div><div class="m2-input-group"><input type="number" id="${inputId}" class="m2-input-field" placeholder="0" min="1" max="99999" oninput="${onInputCall}"/><span class="m2-input-unit" style="color:${eolColor}">${unit}</span></div></div></div><div id="${absId}"></div>`;
}

function makeM2Input(matKey,product,eol){
  const safeProduct=escapeJsString(product), safeEol=escapeJsString(eol);
  return m2CardHtml('mlinput-'+matKey,'mlabs-'+matKey,product,eol,"updateAbsoluteSingle('"+matKey+"','"+safeProduct+"','"+safeEol+"')",matKey==='cu');
}
function makeM2InputCompare(matKey,product,eol,side){
  const inputId='mlinput-'+matKey+'-'+side,absId='mlabs-'+matKey+'-'+side;
  const safeProduct=escapeJsString(product), safeEol=escapeJsString(eol);
  return m2CardHtml(inputId,absId,product,eol,"updateAbsoluteCompare('"+matKey+"','"+safeProduct+"','"+safeEol+"','"+side+"')",matKey==='cu');
}

// -- RENDER --------------------------------------------------------------------
function buildSections(matKey,product,eol,stamp){
  const m=MATERIALS[matKey],pd=m.data[product],sc=pd.scenarios[eol];
  const refName=pd.refurbishedTo,isReuse=eol==='Reuse';
  let a1c4Html='',contextHtml='';
  if(isReuse){
    const reduction=co2Reduction(sc.a1c4_orig,sc.a1c4_ref);
    contextHtml=`<div class="co2-donut-wrap"><div class="donut-center"><svg viewBox="0 0 200 200" style="transform:rotate(-90deg);filter:drop-shadow(0 0 18px rgba(78,204,163,0.22))"><circle cx="100" cy="100" r="80" fill="none" stroke="var(--surface2)" stroke-width="20"/><circle cx="100" cy="100" r="80" fill="none" stroke="#e06b75" stroke-width="20" stroke-dasharray="502.65 502.65" stroke-linecap="round" opacity="0.3"/><circle id="donut-arc-${stamp}" cx="100" cy="100" r="80" fill="none" stroke="#4ecca3" stroke-width="20" stroke-dasharray="0 502.65" stroke-linecap="round" style="transition:stroke-dasharray 1.4s cubic-bezier(.22,1,.36,1)"/></svg><div class="donut-inner-text"><div class="donut-pct" id="donut-pct-${stamp}">0%</div><div class="donut-sub">CO₂ savings</div></div></div><div class="donut-legend"><div class="legend-item"><div class="legend-dot" style="background:#e06b75"></div><div><div class="legend-item-label">Original</div><div class="legend-item-name">${product}</div><div class="legend-item-val" style="color:#e06b75">${sc.a1c4_orig.toFixed(2)} <span class="legend-unit">${matKey==='cr'||matKey==='cu'?'kg CO₂ / unit':'kg CO₂/m²'}</span></div></div></div><div class="legend-item"><div class="legend-dot" style="background:#4ecca3"></div><div><div class="legend-item-label">Refurbished To</div><div class="legend-item-name">${refName}</div><div class="legend-item-val" style="color:#4ecca3">${sc.a1c4_ref.toFixed(2)} <span class="legend-unit">${matKey==='cr'||matKey==='cu'?'kg CO₂ / unit':'kg CO₂/m²'}</span></div></div></div></div></div>`;
  }else{
    const isInc=eol==='Incineration',hlColor=isInc?'rgba(247,160,74,0.25)':eol==='Recycling'?'rgba(200,184,74,0.2)':'rgba(139,148,158,0.2)',hlBg=isInc?'rgba(247,160,74,0.05)':eol==='Recycling'?'rgba(200,184,74,0.04)':'rgba(139,148,158,0.04)',hlIcon=isInc?'🔥':eol==='Recycling'?'♻️':'⚠️',hlTitle=isInc?`<div class="ctx-title" style="color:#f7a04a">⚡ Energy Recovery</div>`:eol==='Recycling'?`<div class="ctx-title" style="color:#c8b84a">♻️ Material Recycling</div>`:`<div class="ctx-title" style="color:#e06b75">⚠️ Landfilling</div>`;
    const hlText=isInc?`<span class="ctx-product">${product}</span> is <span class="ctx-action" style="color:#f7a04a;font-weight:700">incinerated</span> at end of life.<br><span class="ctx-benefit" style="color:#f7c873">✓ Generates Electricity &amp; District heat</span>`:eol==='Recycling'?(matKey==='cr'?`<span class="ctx-product">${product}</span> CAS room is <span class="ctx-action" style="color:#c8b84a;font-weight:700">recycled</span>.<br><span class="ctx-benefit" style="color:#c8b84a">✓ Aluminium, steel, wood, glass &amp; stainless steel recovered and re-entered into production</span>`:matKey==='cu'?`<span class="ctx-product">${product}</span> Cube is <span class="ctx-action" style="color:#c8b84a;font-weight:700">recycled</span>.<br><span class="ctx-benefit" style="color:#c8b84a">✓ Aluminium, steel, wood, glass, plastic, fabric &amp; gips recovered and re-entered into production cycles</span>`:`<span class="ctx-product">${product}</span> is <span class="ctx-action" style="color:#c8b84a;font-weight:700">recycled</span>.<br><span class="ctx-benefit" style="color:#c8b84a">✓ Raw gypsum recovered &amp; re-entered into production</span>`):`<span class="ctx-product">${product}</span> is <span class="ctx-action" style="color:#e06b75;font-weight:700">sent to landfill</span>.<br><span class="ctx-warn">✗ No material or energy is recovered</span>`;
    a1c4Html=`<div class="a1c4-grid" style="grid-template-columns:1fr"><div class="a1c4-card original"><div class="card-tag">${matKey==='cr'?'Original CAS Room':matKey==='cu'?'Original Cube':'Original Boden'}</div><div class="product-name">${product}</div><div class="co2-value">${sc.a1c4_orig.toFixed(2)}</div><div class="co2-unit">kg CO₂ eq. ${matKey==='cr'||matKey==='cu'?'/ unit':'/ m²'}</div></div></div>`;
    contextHtml=`<div class="loop-highlight" style="border-color:${hlColor};background:${hlBg};margin-bottom:0"><div class="loop-icon">${hlIcon}</div><div class="loop-text">${hlTitle}<p class="ctx-body">${hlText}</p></div></div>`;
  }
  const savingsHtml=matKey==='cs'?renderSavingsCS(sc):matKey==='cr'?renderSavingsCR(sc):matKey==='cu'?renderSavingsCU(sc):renderSavingsWF(sc,product);
  return{a1c4Html,contextHtml,savingsHtml,sc,isReuse,reduction:isReuse?co2Reduction(sc.a1c4_orig,sc.a1c4_ref):0};
}

function render(matKey,product,eol){
  const stamp=_renderStamp;
  const{a1c4Html,contextHtml,savingsHtml}=buildSections(matKey,product,eol,stamp);
  const m2Html=matKey==='cr'?'':makeM2Input(matKey,product,eol);
  return`<div class="section-label anim anim-d1">A1 – C4 Carbon Footprint</div>${a1c4Html}${contextHtml}<hr class="divider"><div class="section-label anim anim-d3">Savings Overview</div>${savingsHtml}${m2Html}`;
}

function renderCompare(matKey,product,eolA,eolB){
  const stampA=_renderStamp,stampB=_renderStamp+1;
  const sA=buildSections(matKey,product,eolA,stampA),sB=buildSections(matKey,product,eolB,stampB);
  const eolColor=e=>{if(matKey==='cu'&&CU_EOL_INFO[e])return CU_EOL_INFO[e].color;if(matKey==='cr'&&CR_EOL_INFO[e])return CR_EOL_INFO[e].color;return EOL_INFO[e]?EOL_INFO[e].color:'var(--accent)';};
  const header=(eol,color)=>`<div class="cmp-header" style="border-color:${color};color:${color}">${eol.toUpperCase()}</div>`;
  return`<!-- ROW: A1-C4 --><div class="section-label anim anim-d1">A1 – C4 Carbon Footprint</div><div class="cmp-row"><div class="cmp-cell">${header(eolA,eolColor(eolA))}${sA.a1c4Html}</div><div class="cmp-divider"></div><div class="cmp-cell">${header(eolB,eolColor(eolB))}${sB.a1c4Html}</div></div><!-- ROW: Context --><div class="cmp-row cmp-row-context"><div class="cmp-cell">${sA.contextHtml}</div><div class="cmp-divider"></div><div class="cmp-cell">${sB.contextHtml}</div></div><hr class="divider"><!-- ROW: Savings --><div class="section-label anim anim-d3">Savings Overview</div><div class="cmp-row cmp-row-savings"><div class="cmp-cell">${sA.savingsHtml}</div><div class="cmp-divider"></div><div class="cmp-cell">${sB.savingsHtml}</div></div>${matKey!=='cr'?`<hr class="divider"><div class="section-label anim anim-d5">Project Impact</div><div class="cmp-row"><div class="cmp-cell">${makeM2InputCompare(matKey,product,eolA,'a')}</div><div class="cmp-divider"></div><div class="cmp-cell">${makeM2InputCompare(matKey,product,eolB,'b')}</div></div>`:''}`;
}

// -- SELECTION CHANGE ----------------------------------------------------------
function onSelectionChange(matKey){
  const m=MATERIALS[matKey],product=document.getElementById(m.selProduct).value,eol=document.getElementById(m.selEol).value;
  const results=document.getElementById(m.results),noData=document.getElementById(m.noData),inner=document.getElementById(m.inner);
  if(!product||!eol){results.classList.remove('visible');noData.style.display='block';showEolCard(matKey,null);return;}
  noData.style.display='none';_pieId=0;_renderStamp=Date.now();_pieRegistry=[];
  const eolB=_compareActive[matKey]?document.getElementById('sel-eol-'+matKey+'-b').value:'';
  if(_compareActive[matKey]&&eolB){
    inner.innerHTML=renderCompare(matKey,product,eol,eolB);
    animateAllPies();
    if(buildSections(matKey,product,eol,_renderStamp).isReuse)animateDonut(_renderStamp,co2Reduction(m.data[product].scenarios[eol].a1c4_orig,m.data[product].scenarios[eol].a1c4_ref));
    if(buildSections(matKey,product,eolB,_renderStamp+1).isReuse)animateDonut(_renderStamp+1,co2Reduction(m.data[product].scenarios[eolB].a1c4_orig,m.data[product].scenarios[eolB].a1c4_ref));
  }else{
    inner.innerHTML=render(matKey,product,eol);
    animateAllPies();
    if(eol==='Reuse'){const sc=m.data[product].scenarios[eol];animateDonut(_renderStamp,co2Reduction(sc.a1c4_orig,sc.a1c4_ref));}
  }
  results.classList.add('visible');
  showEolCard(matKey,eol,product);
  const cmpBtn=document.getElementById('compare-btn-'+matKey);if(cmpBtn)cmpBtn.style.display='block';
  showExportBar();
  if(_compareActive[matKey])populateCompareSelector(matKey);
}

// -- LOAD CSV ------------------------------------------------------------------
async function fetchCSV(path){try{const res=await fetch(path);if(res.ok)return await res.text();}catch(e){console.warn('Failed to fetch:',path,e);}return null;}

async function loadCSV(matKey){
  const m=MATERIALS[matKey],loadingEl=document.getElementById(m.loading),errorEl=document.getElementById(m.error),noDataEl=document.getElementById(m.noData);
  if(loadingEl)loadingEl.style.display='block';if(errorEl)errorEl.style.display='none';
  let text=null;
  if(m.csvPath){text=await fetchCSV(m.csvPath);}
  if(!text){if(loadingEl)loadingEl.style.display='none';if(errorEl){errorEl.style.display='block';errorEl.innerHTML='<span class="big">⚠️</span><strong>Error:</strong> Could not load '+matKey+' data. Please ensure '+m.csvPath+' exists.';}return;}
  try{
    if(matKey==='cs')m.data=parseCSV_cs(text);else if(matKey==='wf')m.data=parseCSV_wf(text);else if(matKey==='cr')m.data=parseCSV_cr(text);else if(matKey==='cu')m.data=parseCSV_cu(text);
    if(Object.keys(m.data).length===0)throw new Error('No valid data rows found');
    populateSelectors(matKey);if(noDataEl)noDataEl.style.display='block';if(errorEl)errorEl.style.display='none';
  }catch(err){console.error('Parse error for',matKey,err);if(errorEl){errorEl.style.display='block';errorEl.innerHTML='<span class="big">⚠️</span><strong>Error:</strong> '+err.message;}}
  finally{if(loadingEl)loadingEl.style.display='none';}
}

// -- INIT ----------------------------------------------------------------------
window.addEventListener('DOMContentLoaded',()=>{
  loadCSV('cs');
  loadCSV('wf');
  loadCSV('cr');
  loadCSV('cu');
});

// -- THEME & LANGUAGE ----------------------------------------------------------
function toggleTheme(){const isDark=document.documentElement.getAttribute('data-theme')==='dark',next=isDark?'light':'dark';document.documentElement.setAttribute('data-theme',next);document.getElementById('theme-icon').textContent=next==='dark'?'☀️':'🌙';try{localStorage.setItem('bo-theme',next);}catch(_){}}
(function initTheme(){try{const s=localStorage.getItem('bo-theme');if(s){document.documentElement.setAttribute('data-theme',s);const i=document.getElementById('theme-icon');if(i)i.textContent=s==='dark'?'☀️':'🌙';}}catch(_){}})();

const I18N={en:{'eyebrow':'Lifecycle Data','mat-cs':'Calcium Sulphate Floors','mat-wf':'Wooden Floors','mat-cr':'CAS Room','mat-cu':'Cubes','label-product':'Boden Type','label-eol':'EOL Scenario','label-compare-eol':'Compare with EOL','no-data':'Select a product and EOL scenario to view the analysis.','btn-compare':'⇄ Compare Scenarios','btn-export':'Export PNG'},de:{'eyebrow':'Lebenszyklus-Daten','mat-cs':'Calciumsulfatböden','mat-wf':'Holzböden','mat-cr':'CAS Raum','mat-cu':'Würfel','label-product':'Produkttyp','label-eol':'EOL-Szenario','label-compare-eol':'Vergleich mit EOL','no-data':'Wählen Sie Produkt und EOL-Szenario.','btn-compare':'⇄ Szenarien vergleichen','btn-export':'PNG exportieren'}};
let _lang='en';
function setLang(lang){_lang=lang;document.getElementById('btn-en').classList.toggle('active',lang==='en');document.getElementById('btn-de').classList.toggle('active',lang==='de');document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(I18N[lang][k])el.textContent=I18N[lang][k];});['cs','wf','cr','cu'].forEach(mk=>{const m=MATERIALS[mk];const p=document.getElementById(m.selProduct).value,e=document.getElementById(m.selEol).value;if(p&&e)onSelectionChange(mk);});try{localStorage.setItem('bo-lang',lang);}catch(_){}}
(function initLang(){try{const s=localStorage.getItem('bo-lang');if(s&&I18N[s]){_lang=s;setLang(s);}}catch(_){}})();

// -- COMPARE -------------------------------------------------------------------
const _compareActive={cs:false,wf:false,cr:false,cu:false};
function toggleCompare(matKey){const btn=document.getElementById('compare-btn-'+matKey),panel=document.getElementById('compare-panel-'+matKey),isActive=_compareActive[matKey];_compareActive[matKey]=!isActive;btn.classList.toggle('active',!isActive);if(isActive){panel.style.display='none';const m=MATERIALS[matKey],product=document.getElementById(m.selProduct).value,eol=document.getElementById(m.selEol).value;if(product&&eol)onSelectionChange(matKey);}else{panel.style.display='block';populateCompareSelector(matKey);}}
function populateCompareSelector(matKey){const m=MATERIALS[matKey],product=document.getElementById(m.selProduct).value,currentEol=document.getElementById(m.selEol).value,sel=document.getElementById('sel-eol-'+matKey+'-b');sel.innerHTML='<option value="">— Select scenario to compare —</option>';if(!product)return;const eols=Object.keys(m.data[product].scenarios);['Reuse','Recycling','Incineration','Landfilling'].forEach(e=>{if(eols.includes(e)&&e!==currentEol){const o=document.createElement('option');o.value=e;o.textContent=e;sel.appendChild(o);}});}
function onCompareChange(matKey){const m=MATERIALS[matKey],product=document.getElementById(m.selProduct).value,eolB=document.getElementById('sel-eol-'+matKey+'-b').value;if(!product||!eolB)return;onSelectionChange(matKey);}

// -- EXPORT --------------------------------------------------------------------
function showExportBar(){const btn=document.getElementById('export-btn-header');if(btn)btn.style.display='flex';}
async function exportPDF(){
  const btn=document.getElementById('export-btn-header');if(!btn)return;
  const orig=btn.innerHTML;btn.innerHTML='<span>⏳</span><span>Capturing...</span>';btn.style.opacity='0.7';btn.style.pointerEvents='none';
  try{
    if(!window.html2canvas){await new Promise((resolve,reject)=>{const sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';sc.onload=resolve;sc.onerror=reject;document.head.appendChild(sc);});}
    const container=document.querySelector('.container'),isDark=document.documentElement.getAttribute('data-theme')!=='light';
    const canvas=await html2canvas(container,{scale:2,useCORS:true,allowTaint:true,backgroundColor:isDark?'#0d1117':'#f4f6f8',logging:false,windowWidth:container.scrollWidth,height:container.scrollHeight,scrollY:0});
    const activeMatKey=document.getElementById('btn-cs').classList.contains('active')?'cs':document.getElementById('btn-wf').classList.contains('active')?'wf':document.getElementById('btn-cr').classList.contains('active')?'cr':'cu';
    const m=MATERIALS[activeMatKey],product=(document.getElementById(m.selProduct).value||'export').replace(/\s+/g,'_'),eol=document.getElementById(m.selEol).value||'';
    const link=document.createElement('a');link.download='Savings_Optimizer_'+product+(eol?'_'+eol:'')+'.png';link.href=canvas.toDataURL('image/png');link.click();
  }catch(err){console.error('Export failed:',err);alert('Export failed: '+err.message);}
  finally{btn.innerHTML=orig;btn.style.opacity='';btn.style.pointerEvents='';}
}
