/** Abstract passage / wall cuts drawn for this site, never a substituted photograph. */
export function FezArchitecture({ className = '' }: { className?: string }) {
 return <svg className={`fez-architecture ${className}`} viewBox="0 0 800 900" fill="none" aria-hidden="true" focusable="false">
  <path d="M122 900V399c0-163 124-201 218-301 100 100 226 143 226 301v501" stroke="currentColor" strokeWidth="1" />
  <path d="M193 900V425c0-117 82-153 147-230 69 80 153 119 153 230v475" stroke="currentColor" strokeWidth=".7" />
  <path d="M658 0v303l-39 55v184l62 36v322M44 0v270l49 38v104l-22 22v466" stroke="currentColor" strokeWidth=".7" />
  <path d="M566 900V399c0-163-126-201-226-301L421 0h379v900Z" fill="currentColor" fillOpacity=".025" />
 </svg>;
}
