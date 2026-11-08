import { cityProposalDuchy, duchies } from '../../data/viremont/duchies';
import type { Duchy } from '../../types/geography';

export function DuchyPanel({selected,onSelect,onNation,onWorld,onCenter}:{selected:Duchy|null;onSelect:(duchy:Duchy)=>void;onNation:()=>void;onWorld:()=>void;onCenter:()=>void}){
  return <section className="ducal-panel">
    <div className="selected-card"><p className="eyebrow">VIREMONT · PROPOSTA EDITÁVEL</p><h2>{selected?.name??'Divisão ducal'}</h2>
      {selected?<><div className="ducal-section"><h3>Paisagem</h3><p>{selected.description}</p><h3>Vocação</h3><p>{selected.economy}</p><h3>História proposta</h3><p>{selected.history}</p></div><button className="primary-button" onClick={onCenter}>◎ &nbsp; Centralizar ducado</button><button className="text-button" onClick={onNation}>← Voltar a Viremont</button></>:<><div className="ducal-counts"><span><b>6</b> ducados</span><span><b>24</b> condados*</span><span><b>96</b> baronias*</span></div><p>* Condados e baronias são planejamento futuro.</p><p>O local de cidade existente está em {duchies.find(d=>d.id===cityProposalDuchy)?.name.replace('Ducado de ','')}. A capital real ainda não foi definida.</p><button className="primary-button" onClick={onCenter}>◎ &nbsp; Centralizar Viremont</button></>}
      <p className="ducal-warning">Fronteiras provisórias orientadas pela pintura. O rio ilustrado ainda precisa de vetorização e aprovação.</p><button className="text-button" onClick={onWorld}>◎ &nbsp; Voltar ao planeta</button>
    </div>
    <div className="section-title"><h3>Seis ducados</h3><span>PROPOSTA</span></div><div className="duchy-list">{duchies.map(duchy=><button key={duchy.id} className={selected?.id===duchy.id?'chosen':''} onClick={()=>onSelect(duchy)}><i style={{background:duchy.color}}/><span>{duchy.name}<small>{duchy.region}</small></span><b>›</b></button>)}</div>
  </section>;
}
