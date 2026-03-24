// Bundled brand logos — imported as base64 data URIs by Vite.
// These are the primary logo source; Clearbit / Google favicon are fallbacks
// for brands not listed here. Admin can override any brand via an explicit
// HTTP URL stored in brand.logoFilename.

import airman     from '../assets/logos/airman.png';
import atlas      from '../assets/logos/atlas.png';
import bobcat     from '../assets/logos/bobcat.png';
import cat        from '../assets/logos/cat.png';
import casece     from '../assets/logos/case.png';
import develon    from '../assets/logos/develon.png';
import doosan     from '../assets/logos/doosan.png';
import hidromek   from '../assets/logos/hidromek.png';
import hitachi    from '../assets/logos/hitachi.png';
import hyundai    from '../assets/logos/hyundai.png';
import jcb        from '../assets/logos/jcb.png';
import johndeere  from '../assets/logos/johndeere.png';
import kobelco    from '../assets/logos/kobelco.png';
import komatsu    from '../assets/logos/komatsu.png';
import kubota     from '../assets/logos/kubota.png';
import liebherr   from '../assets/logos/liebherr.png';
import linkbelt   from '../assets/logos/linkbelt.png';
import mecalac    from '../assets/logos/mecalac.png';
import sany       from '../assets/logos/sany.png';
import sumitomo   from '../assets/logos/sumitomo.png';
import sunward    from '../assets/logos/sunward.png';
import takeuchi   from '../assets/logos/takeuchi.png';
import terex      from '../assets/logos/terex.png';
import volvo      from '../assets/logos/volvo.png';
import wackerneuson from '../assets/logos/wackerneuson.png';
import xcmg       from '../assets/logos/xcmg.png';
import yanmar     from '../assets/logos/yanmar.png';

export const BUNDLED_LOGOS: Record<string, string> = {
  'Airman':        airman,
  'Atlas':         atlas,
  'Bobcat':        bobcat,
  'CAT':           cat,
  'Caterpillar':   cat,
  'Case':          casece,
  'Develon':       develon,
  'Doosan':        doosan,
  'Hidromek':      hidromek,
  'Hitachi':       hitachi,
  'Hyundai':       hyundai,
  'JCB':           jcb,
  'John Deere':    johndeere,
  'Kobelco':       kobelco,
  'Komatsu':       komatsu,
  'Kubota':        kubota,
  'Liebherr':      liebherr,
  'Link-Belt':     linkbelt,
  'Mecalac':       mecalac,
  'Sany':          sany,
  'Sumitomo':      sumitomo,
  'Sunward':       sunward,
  'Takeuchi':      takeuchi,
  'Terex':         terex,
  'Volvo':         volvo,
  'Wacker Neuson': wackerneuson,
  'XCMG':          xcmg,
  'Xcmg':          xcmg,
  'Yanmar':        yanmar,
};
