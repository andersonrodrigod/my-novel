import fs from 'node:fs';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { TerrainField } from '../src/geography/terrain/TerrainField.ts';
import { createPaintedVegetation } from '../src/geography/terrain/vegetation.ts';
const manifest=JSON.parse(fs.readFileSync('src/data/terrain/viremont.json','utf8'));
const bytes=fs.readFileSync('public/assets/terrain/viremont-field.bin');
const field=new TerrainField(manifest,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),JSON.parse(fs.readFileSync('src/data/terrain/hydrology-source.json','utf8')));
const site=JSON.parse(fs.readFileSync('src/data/world/political-map.json','utf8')).countries.find(c=>c.nationId==='aetheria-07').citySite;
const city=field.toLocal(site),runs=[];
for(const [anchor,close] of [[[0,0],false],[[256,0],false],[[512,0],false],[[512,0],true],[[768,0],true]]){
 const start=performance.now(),trees=createPaintedVegetation(field,anchor,close,city);
 runs.push({anchor,close,ms:+(performance.now()-start).toFixed(2),trees:trees.length,hash:crypto.createHash('sha256').update(JSON.stringify(trees)).digest('hex')});
}
const report={runtime:process.version,kind:'Node CPU generation benchmark; not browser FPS',runs};
console.log(JSON.stringify(report,null,2));
const output=process.argv[2];if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
