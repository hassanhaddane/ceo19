/** Original vector prop. Animation is finite and follows the entry timeline. */
export function Lighter() {
 return <svg className="entry-lighter-scene" viewBox="0 0 300 260" fill="none" aria-hidden="true">
  <defs>
   <linearGradient id="lighter-body" x1="85" y1="140" x2="151" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#faf7ef"/><stop offset=".08" stopColor="#9abfdd"/><stop offset=".22" stopColor="#1e608f"/><stop offset=".72" stopColor="#092b4c"/><stop offset="1" stopColor="#071a2e"/></linearGradient>
   <linearGradient id="entry-flame" x1="139" y1="112" x2="140" y2="62" gradientUnits="userSpaceOnUse"><stop stopColor="#f5f4df"/><stop offset=".45" stopColor="#ffd88c"/><stop offset="1" stopColor="#e98b35" stopOpacity=".2"/></linearGradient>
  </defs>
  <g className="entry-paper" stroke="var(--ceo-cream)" strokeWidth="1.15">
   <path d="M177 110 231 96 241 104 187 119Z" fill="var(--ceo-cream)" fillOpacity=".1"/>
   <path d="m186 114 45-13M187 119l-10-9"/>
   <path d="M208 101c-2-10-3-16 1-25 5 9 5 15 2 22 7-9 12-11 18-12-2 7-7 12-16 15 9-1 14 1 18 5-9 2-16 0-22-3-6 5-13 7-21 5 5-5 10-7 17-7-9-3-13-7-15-13 8 1 13 5 18 13Z" fill="var(--ceo-cream)" fillOpacity=".08"/>
  </g>
  <g className="entry-lighter">
   <rect x="86" y="132" width="65" height="95" rx="11" fill="url(#lighter-body)" stroke="var(--ceo-cream)" strokeOpacity=".55"/>
   <path d="M91 151v56q0 14 10 14M145 148v62" stroke="var(--ceo-cream)" strokeOpacity=".25"/>
   <path d="M88 136h62v13H88Z" fill="#111b22" stroke="#aac0ce"/>
   <path d="M113 111h31v23h-31Z" fill="#c8d4d8"/>
   <path d="M118 116h4m8 0h4m-16 6h4m8 0h4m-16 6h4m8 0h4" stroke="#233947" strokeWidth="2"/>
   <circle cx="109" cy="124" r="9" fill="#344852" stroke="#e7e9df" strokeWidth="2" strokeDasharray="2 2"/>
   <g className="entry-lighter-lid"><path d="M88 111q0-8 8-8h45q9 0 9 8v24H88Z" fill="url(#lighter-body)" stroke="#b9cbd5"/><path d="M94 109h47" stroke="#e7e9df" strokeOpacity=".5"/></g>
   <g className="entry-flame"><path d="M138 114c-19-9-6-26 2-48 1 19 17 34 5 46Z" fill="url(#entry-flame)"/><path d="M139 114c-6-5-4-14 2-20 5 9 6 14 1 20Z" fill="#fff9df"/></g>
  </g>
  <g className="entry-spark" stroke="#fff7db" strokeWidth="1.5"><path d="m168 99 5-3m-7 10 6 1m-9 6 2 4"/></g>
 </svg>;
}
