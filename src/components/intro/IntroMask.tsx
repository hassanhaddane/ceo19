/** Complementary planes open over the live destination. */
export function IntroMask() {
 return <div className="intro-mask" aria-hidden="true">
  <div className="intro-matte intro-matte--left" />
  <div className="intro-matte intro-matte--right" />
  <div className="intro-blue-light" />
 </div>;
}
