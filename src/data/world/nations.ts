import type { Nation } from '../../types/geography';

const names: Record<string, string[]> = {
  aetheria: ['Valdória','Eldamar','Caelmont','Ravênia','Ordel','Lysária','Viremont','Caldris','Torvânia','Belthar','Serádia','Norvélia','Arvend','Dalmora','Veskar','Helíria','Mornath','Aldéria'],
  varkhonia: ['Kardov','Vostren','Braskor','Drevânia','Kelmor','Zarkesh','Uldran','Rostavia','Tharvek','Velkor','Norzhan','Kravônia','Ostral','Meldrak'],
  solmeria: ['Azmara','Qadira','Sahmir','Velassir','Nuzara','Ophara','Talmesh','Ishara','Zafren','Merúdia','Kassira','Darshem','Alzora','Yameth','Sulara','Qemir'],
  eryndor: ['Luneth','Vaeloria','Esmarin','Therys','Orelith','Miravén','Sylmora','Elandris','Niméria','Ariseth','Velunor','Caerith'],
  drakmoria: ['Gravorn','Durnak','Korvath','Mazdrin','Vulkara','Thorgal','Brenkar','Azgorn','Keldrak','Morgrin','Zurnath'],
  namaris: ['Pelágia','Marenth','Ilvar','Serevon','Talássia','Nerimar','Calíria','Ondavar','Velamar','Iskéria','Porthel','Navrisa','Merovél','Aqualen','Sundara'],
  thalzor: ['Zhalek',"Ur'Thal",'Khoruun',"Vel'Zar",'Tessh','Nakhora',"Or'Zuun",'Xelmar']
};
export const nations: Nation[] = Object.entries(names).flatMap(([continentId, list]) => list.map((name, index) => ({ id: `${continentId}-${String(index + 1).padStart(2,'0')}`, name, continentId })));
