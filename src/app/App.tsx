import { lazy, Suspense, useEffect, useState } from 'react';
import { WorldScene } from '../components/atlas/WorldScene';
import { continents } from '../data/world/continents';
import { nations } from '../data/world/nations';
import type { Continent, Duchy, LayerKey, Nation } from '../types/geography';
import { DuchyPanel } from '../components/atlas/DuchyPanel';
import { duchies } from '../data/viremont/duchies';
import '../components/terrain/terrain.css';
const DuchyTerrain=lazy(()=>import('../components/terrain/DuchyTerrain'));

const initialLayers: Record<LayerKey,boolean> = { names:true, relief:true, biomes:true, rivers:true, borders:false, countries:true,cities:true,nationNames:false,duchies:true };
const layerLabels: Record<LayerKey,string> = { names:'Nomes geográficos', countries:'Fronteiras das nações',duchies:'Fronteiras ducais',cities:'Locais de cidades',nationNames:'Nomes das nações',relief:'Relevo', biomes:'Biomas', rivers:'Rios e lagos', borders:'Contornos continentais' };
const menu = ['Mapa-Múndi','Continentes','Nações','Cidades','Religiões','Raças','História','Biblioteca'];

export function App() {
  useEffect(()=>{history.scrollRestoration='manual';window.scrollTo(0,0);},[]);
  const [selected,setSelected]=useState<Continent|null>(null);
  const [nation,setNation]=useState<Nation|null>(null);
  const [duchyId,setDuchyId]=useState<string|null>(null);
  const [terrainMode,setTerrainMode]=useState(false);
  const [terrainDuchyId,setTerrainDuchyId]=useState<string|null>(null);
  const duchy=duchies.find(record=>record.id===duchyId)??null;
  const terrainDuchy=duchies.find(record=>record.id===terrainDuchyId)??null;
  const [layers,setLayers]=useState(initialLayers);
  const [focusSignal,setFocusSignal]=useState(0);
  const [section,setSection]=useState<'Mapa-Múndi'|'Continentes'|'Nações'>('Mapa-Múndi');
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [illustrated,setIllustrated]=useState(true);
  const focus=(continent: Continent|null) => {setTerrainMode(false);setDuchyId(null);setNation(null);setSelected(continent); setFocusSignal(v=>v+1); };
  const focusNation=(record:Nation)=>{setTerrainMode(false);setDuchyId(null);setNation(record);setSelected(continents.find(c=>c.id===record.continentId)!);if(record.id==='aetheria-07')setFocusSignal(v=>v+1);};
  const focusDuchy=(record:Duchy)=>{setTerrainMode(true);setTerrainDuchyId(record.id);setDuchyId(record.id);setNation(nations.find(n=>n.id===record.parentNationId)!);setSelected(continents.find(c=>c.id==='aetheria')!);setFocusSignal(v=>v+1);};
  const backToViremont=()=>focusNation(nations.find(n=>n.id==='aetheria-07')!);
  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen?'open':''}`}>
      <div className="brand"><div className="brand-icon">✦</div><div><span>O MUNDO DE</span><strong>ELARION</strong></div></div>
      <div className="sidebar-rule"/>
      <p className="nav-caption">EXPLORAR O ATLAS</p>
      <nav aria-label="Seções do atlas">{menu.map((item,index)=>{
        const enabled=index<3; return <button key={item} className={`nav-item ${section===item&&enabled?'current':''}`} disabled={!enabled} onClick={()=>{setSection(item as typeof section);setSidebarOpen(false);if(index===0) focus(null);if(index===1){setTerrainMode(false);setDuchyId(null);setNation(null);}if(index===2){setTerrainMode(false);setDuchyId(null);setLayers(v=>({...v,countries:true,cities:true}));if(!selected)focus(continents[0]);}}}>
          <span className="nav-icon">{['◎','◈','▦','♜','✝','✧','⌛','▤'][index]}</span><span>{item}</span>{!enabled&&<small>EM BREVE</small>}
        </button>;
      })}</nav>
      <button className="viremont-entry" onClick={backToViremont}><span>♜</span><div>Reino de Viremont<small>EXPLORAR SEIS DUCADOS</small></div><b>›</b></button>
      <div className="sidebar-footer"><span>✧</span><p>Um mundo inteiro<br/>à espera de ser descoberto.</p><small>ATLAS • VERSÃO 0.1</small></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" aria-label="Abrir menu" onClick={()=>setSidebarOpen(v=>!v)}>☰</button><div className="breadcrumb">ATLAS <span>/</span> {section.toUpperCase()}</div><div className="topbar-right"><span className="status-dot"/> MAPA-MÚNDI <span className="topbar-divider"/> 7 CONTINENTES · {nations.length} NAÇÕES</div></header>
      <div className={`world-stage ${terrainMode&&duchy?'exploring-terrain':''}`}>
        <div className="stage-heading"><p>{nation?.id==='aetheria-07'?'VIREMONT · DIVISÃO DUCAL':'ATLAS GEOGRÁFICO'}</p><h1>{duchy?.name??nation?.name??selected?.name ?? 'Mundo de Elarion'}</h1><span>{duchy?'DUCADO PROVISÓRIO':nation?.id==='aetheria-07'?'6 ducados · 24 condados e 96 baronias planejados':nation?'TERRITÓRIO PROPOSTO':selected ? 'CONTINENTE SELECIONADO' : 'Explore os sete continentes do mundo conhecido'}</span></div>
        <div className={`globe-base ${terrainMode&&duchy?'globe-hidden':''}`} aria-hidden={!!(terrainMode&&duchy)}><WorldScene paused={!!(terrainMode&&duchy)} selected={selected} onSelect={focus} layers={layers} focusSignal={focusSignal} view="globe" illustrated={illustrated} nation={nation} onNationSelect={focusNation} duchy={duchy} onDuchySelect={focusDuchy}/></div>
        {terrainDuchy&&<Suspense fallback={terrainMode?<div className="terrain-loading" role="status">Preparando a exploração…</div>:null}><DuchyTerrain active={!!(terrainMode&&duchy)} duchy={terrainDuchy} focusSignal={focusSignal} onAtlas={()=>setTerrainMode(false)}/></Suspense>}
        <div className="compass" aria-label="Rosa dos ventos"><span>N</span><div>✦</div><span>S</span></div>
        {nation?.id==='aetheria-07'&&<div className="local-navigation">{duchy&&<button onClick={backToViremont}>← Viremont</button>}<button onClick={()=>focus(null)}>◎ Planeta</button></div>}
        <div className="interaction-hint">↔ Arraste para {nation?.id==='aetheria-07'?'mover':'girar'} <i/> ◇ Role para aproximar <i/> ✧ Clique em {nation?.id==='aetheria-07'&&layers.duchies?'um ducado':'um território'}</div>
        <div className="world-caption">CARTOGRAFIA DE ELARION <span>•</span> ESCALA MUNDIAL</div>
      </div>
    </main>

    <aside className={`right-panel ${nation?.id==='aetheria-07'?'ducal-mode':''}`}>
      <div className="panel-scroll" key={duchy?.id??nation?.id??selected?.id??'world'}>
        <div className="panel-kicker">✦ &nbsp; GUIA DO EXPLORADOR</div>
        {nation?.id==='aetheria-07'?<DuchyPanel selected={duchy} onSelect={focusDuchy} onNation={backToViremont} onWorld={()=>focus(null)} onCenter={()=>setFocusSignal(v=>v+1)}/>:selected ? <section className="selected-card"><p className="eyebrow">{nation?`${selected.name} · NAÇÃO`:`CONTINENTE · ${String(continents.indexOf(selected)+1).padStart(2,'0')}`}</p><h2>{nation?.name??selected.name}</h2><div className="ornament">✦ ───── ✦ ───── ✦</div><div className="stat"><strong>{nation?'1':selected.nationCount}</strong><span>{nation?'LOCAL DE CIDADE RESERVADO':'NAÇÕES DELIMITADAS'}</span></div><p>{nation?'Fronteira provisória. O ponto de cidade foi escolhido em uma área aberta da pintura, com espaço livre ao redor. Posição sujeita à revisão geográfica.':'Cada nação possui um local de cidade proposto. Selecione um território no globo para inspecionar sua divisão.'}</p><button className="primary-button" onClick={()=>setFocusSignal(v=>v+1)}>◎ &nbsp; Centralizar continente</button><button className="text-button" onClick={()=>nation?setNation(null):focus(null)}>{nation?'← Voltar ao continente':'← Voltar à visão mundial'}</button></section>
        : <section className="intro-card"><p className="eyebrow">BEM-VINDO AO ATLAS</p><h2>Um mundo para explorar.</h2><div className="ornament">✦ ───── ✦ ───── ✦</div><p>Gire o planeta e selecione um continente para começar sua jornada cartográfica.</p><div className="world-stats"><div><strong>07</strong><span>CONTINENTES</span></div><div><strong>94</strong><span>NAÇÕES</span></div></div></section>}
        <section className="continent-list"><div className="section-title"><h3>Continentes</h3><span>07 REGIÕES</span></div>{continents.map((c,i)=><button key={c.id} className={selected?.id===c.id?'chosen':''} onClick={()=>focus(c)}><span className="list-index">{String(i+1).padStart(2,'0')}</span><span>{c.name}</span><small>{c.nationCount} nações</small><b>›</b></button>)}</section>
        {selected&&<section className="continent-list"><div className="section-title"><h3>Nações de {selected.name}</h3></div>{nations.filter(n=>n.continentId===selected.id).map(record=><button key={record.id} className={record.id===nation?.id?'chosen':''} onClick={()=>focusNation(record)}><span>{record.name}</span><small>1 cidade proposta</small><b>›</b></button>)}</section>}
        <section className="layers"><div className="section-title"><h3>Camadas do mapa</h3><span>VISUALIZAÇÃO</span></div><label><span>Ilustração original</span><input type="checkbox" checked={illustrated} onChange={()=>setIllustrated(v=>!v)}/><i/></label>{(Object.keys(layerLabels) as LayerKey[]).map(key=><label key={key} title={illustrated&&['biomes','relief','rivers'].includes(key)?'Integrado à ilustração. Desative a ilustração para explorar estas camadas separadamente.':undefined}><span>{layerLabels[key]}</span><input type="checkbox" disabled={illustrated&&['biomes','relief','rivers'].includes(key)} checked={layers[key]} onChange={()=>setLayers(v=>({...v,[key]:!v[key]}))}/><i/></label>)}{illustrated&&<p className="layer-note">Relevo, biomas e rios fazem parte da pintura. Desative a ilustração para explorar essas camadas separadamente.</p>}</section>
      </div>
      <div className="panel-bottom">✧ &nbsp; A cartografia é provisória e poderá evoluir.</div>
    </aside>
  </div>;
}
