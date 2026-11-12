/** A cartographic symbol, deliberately independent of the measured ground footprint. */
export function WalledCityIcon(){
 const house=(x:number,y:number,size=1)=><g key={`${x}:${y}`} transform={`translate(${x} ${y}) scale(${size})`}>
  <path d="M-9 0 1 5 1 15-9 10Z" fill="#e7d2a1"/><path d="m1 5 10-5v10L1 15Z" fill="#b2a384"/>
  <path d="M-11 0 0-9 13-1 1 5Z" fill="#9b583c" stroke="#573f2d" strokeWidth="1.2"/><path d="m0-9 1 14" fill="none" stroke="#ca8a56"/>
  <path d="M-5 7v4m11-6v4" stroke="#4c4838" strokeWidth="2"/>
 </g>;
 const tower=(x:number,y:number)=><g key={`t${x}`} transform={`translate(${x} ${y})`}>
  <path d="M-8-12 1-8 9-12v24l-8 5-9-5Z" fill="#d1c29e" stroke="#514d3e" strokeWidth="1.3"/>
  <path d="M1-8v25l8-5v-24Z" fill="#8b907d"/><path d="m-8-12 9-5 8 5-8 5Z" fill="#f0dfaf" stroke="#514d3e"/>
  <path d="M-8-12v-5l4-2v5m5-3v-5l4 2v5m4 3v-5" fill="none" stroke="#ddd2ad" strokeWidth="3"/>
  <path d="M-3-5v6m8-4v5" stroke="#4c5146" strokeWidth="2"/>
 </g>;
 return <svg viewBox="0 0 170 132" aria-hidden="true" focusable="false">
  <ellipse cx="84" cy="109" rx="72" ry="15" fill="#102d2866"/>
  <path d="M16 69 87 37 155 71 79 109Z" fill="#b9ac79" stroke="#443f2f" strokeWidth="2"/>
  <path d="M16 69V54l71-30 68 31v16L87 40Z" fill="#c4b590" stroke="#51513f" strokeWidth="2"/>
  <path d="m20 53 67-28 64 29" fill="none" stroke="#f2deb0" strokeWidth="5" strokeDasharray="5 4"/>
  {tower(87,37)}
  {house(66,50,.85)}{house(105,53,.85)}{house(43,66,.85)}{house(78,66,1)}{house(119,71,.85)}{house(62,82,.8)}{house(94,86,.8)}
  <path d="M78 52V28l10-4 10 5v25l-10 5Z" fill="#e0d3ae" stroke="#55513f"/>
  <path d="m76 29 11-18 14 19-13 6Z" fill="#435e60" stroke="#293f3d" strokeWidth="1.4"/>
  <path d="M88 37v20l10-4V31Z" fill="#929e8b"/><path d="M83 41v7m10-8v6" stroke="#435145" strokeWidth="2"/>
  <path d="M16 69 79 100 155 71v15l-76 37-63-32Z" fill="#c5b58f" stroke="#514d3d" strokeWidth="2"/>
  <path d="m79 100 76-29v15l-76 37Z" fill="#8f9985"/>
  <path d="m18 69 61 31 74-29" fill="none" stroke="#ecdbad" strokeWidth="6" strokeDasharray="5 4"/>
  {tower(16,72)}{tower(155,74)}{tower(79,107)}
  <path d="M106 107V96q5-9 10-5v11Z" fill="#34493f" stroke="#c8bc94" strokeWidth="2"/>
  <path d="m113 106 13 7-8 5-12-8Z" fill="#d7c58f"/>
 </svg>;
}
