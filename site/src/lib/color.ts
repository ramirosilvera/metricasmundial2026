import type { HSL } from "./types";

/** '#RRGGBB' (o '#RGB') -> {r,g,b} en 0-255. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** RGB (0-255) -> HSL (h: 0-360, s/l: 0-100). */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  switch (max) {
    case rn:
      h = ((gn - bn) / d) % 6;
      break;
    case gn:
      h = (bn - rn) / d + 2;
      break;
    default:
      h = (rn - gn) / d + 4;
  }
  h *= 60;
  if (h < 0) h += 360;

  // % 360 tras el redondeo: Math.round(359.6) = 360, que viola el CHECK
  // color_h < 360 del schema (0006_armario_schema.sql) -- se dispara con
  // rojos reales (ej. #FF0002), no un caso de laboratorio.
  return { h: Math.round(h) % 360, s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** HSL (h: 0-360, s/l: 0-100) -> RGB (0-255). */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];

  return { r: (rp + m) * 255, g: (gp + m) * 255, b: (bp + m) * 255 };
}

export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// Pedido explícito del usuario: marrón y beige son colores centrales en
// indumentaria (cuero, gabardina, chino, sweater) y NO son "naranja" en el
// uso real de la moda, aunque compartan la misma familia de matiz (rojo-
// anaranjado a amarillo-anaranjado, h 15-49 -- el mismo rango que ya usaba
// "Naranja"). Lo que distingue un naranja de verdad de un marrón/beige es
// la SATURACIÓN, no el matiz: un naranja de indumentaria real (una campera
// de seguridad, un buzo naranja liso) es vívido; marrón y beige son, por
// definición, colores TERROSOS -- se obtienen mezclando ese mismo matiz con
// negro/gris, así que nunca llegan a esa saturación. Auditado contra el
// catálogo completo + el placard real del usuario (ver conversación): hoy,
// sin excepción, todo color en este rango de matiz es marrón o beige real
// (cuero, chino, sweater) -- ninguno es un naranja de verdad -- y el máximo
// de saturación real encontrado fue 47. 60 deja margen de sobra sin
// arriesgar clasificar un naranja vívido como marrón (test explícito: h=30
// s=80 sigue siendo "Naranja").
const SATURACION_NARANJA_REAL = 60;

// Azul marino -- mismo motivo: es el color más común de la ropa de vestir
// (pantalón/sweater/campera "azul marino" del catálogo) pero nombreColor()
// le ponía "Azul oscuro", una inconsistencia real con el nombre que la
// propia prenda ya usa. Rango acotado al azul oscuro Y saturado real que
// existe en catálogo+placard (h=222, s=37, l=19): un azul intenso, no
// cualquier azul oscuro -- uno muy desaturado ya cae en el bucket de gris
// más arriba, así que no hay solapamiento.
const AZUL_MARINO_HUE_MIN = 210;
const AZUL_MARINO_HUE_MAX = 230;
const AZUL_MARINO_L_MAX = 30;

// Celeste -- pedido explícito del usuario: "ampliá el catálogo de colores
// según los usos y costumbres". En español rioplatense un azul claro de
// indumentaria (camisa/buzo celeste) prácticamente nunca se llama "azul
// claro" -- "celeste" es la palabra de uso real (hasta la bandera argentina
// es "celeste y blanco", nunca "azul claro y blanco"; confirmado además por
// búsqueda web). Rango acotado al celeste real del catálogo (h=209, s=58,
// l=82: camisa-celeste/buzo-celeste) -- mismo motivo que azul marino: sin
// esto, la propia prenda se llama "celeste" pero el badge de color decía
// "Azul claro". l>=65 (no solo >78 como el "claro" genérico) porque un
// celeste medio, no solo el más pálido, ya se llama "celeste" en el uso
// real.
const CELESTE_HUE_MIN = 195;
const CELESTE_HUE_MAX = 230;
const CELESTE_L_MIN = 65;

// Verde militar -- mismo motivo: "campera-verde-militar" ya usa ese nombre
// en el catálogo, pero el badge decía simplemente "Verde". Lo que distingue
// un verde militar/oliva de un verde común es la saturación (igual criterio
// que marrón/beige vs. naranja): es un verde apagado/terroso, no vívido.
// Rango de matiz acotado a los dos casos reales del catálogo (h=69 campera-
// verde-militar, h=92 camisa-cuadros -- ambos amarillo-verdosos, no un
// verde bosque/pasto como pantalon-deportivo-verde-oscuro en h=127, fuera
// de este rango a propósito). Saturación tope calibrada contra el máximo
// real de estos dos casos (s=22) con margen amplio hasta el verde vívido
// real más cercano que existe hoy (el buzo verde del placard, s=57) --
// mismo criterio de "margen de sobra sin arriesgar falsos positivos" que
// ya documenta SATURACION_NARANJA_REAL.
const VERDE_MILITAR_HUE_MIN = 55;
const VERDE_MILITAR_HUE_MAX = 95;
const SATURACION_VERDE_MILITAR = 40;

// Bordó -- mismo motivo: "sweater-bordo"/"corbata-bordo" ya usan ese nombre
// en el catálogo, pero el badge decía "Rojo oscuro". Un bordó/vino/granate
// es un rojo oscuro con matiz corrido hacia el magenta (h cerca de 345-360,
// no un rojo puro cerca de h=0) -- la franja de matiz que en el resto de la
// función cae en la cola de "Rosa" (h<345) o el arranque de "Rojo" (h>=345),
// pero solo cuando además es oscuro: un rosa/rojo claro en ese mismo rango
// de matiz no es bordó, es rosa. Calibrado contra el bordó real del
// catálogo (h=346, l=29).
const BORDO_HUE_MIN = 330;
const BORDO_L_MAX = 35;

// Rosa por luminosidad -- encontrado agregando una remera rosa pastel real
// al catálogo (h=346, l=77): el bucket de "Rojo" (h>=345) la clasificaba
// mal, porque a diferencia de bordó (mismo rango de matiz, pero oscuro) acá
// el problema es en el otro extremo -- CLARO. En moda, "rosa" no es tanto
// un matiz aparte como una versión clara del rojo/magenta: por eso el
// criterio es solo luminosidad, no saturación (a diferencia de marrón/
// beige/mostaza/verde militar, que se distinguen por estar apagados). El
// rango de matiz cubre tanto el final de "Rojo" (h>=345) como el de "Rosa"
// (h<345, ya cubierto por el bucket genérico de más abajo, pero repetido
// acá para no dejar un salto raro justo en el límite h=345): sin esto, un
// rosa pastel con h apenas por debajo de 345 ya se leía bien, pero el mismo
// rosa con h apenas por encima caía en "Rojo" -- una inconsistencia según
// de qué lado del límite cayera el matiz exacto de la prenda.
const ROSA_L_MIN = 65;

// Mostaza -- mismo motivo que verde militar: un mostaza real de sweater/
// buzo (h=40, s=62, l=47) caía en "Naranja", porque ese matiz está en la
// misma franja que marrón/beige (15-49) pero con más saturación que el
// techo de esos dos (60) -- ver SATURACION_NARANJA_REAL. La franja de
// matiz se extiende un poco más allá (hasta 55) para cubrir un mostaza que
// tire más a amarillo. El piso de saturación (35) separa un mostaza real
// de un caqui/verde oliva desaturado en la misma zona de matiz; el techo
// (75) separa un mostaza real (apagado, textil) de un amarillo-naranja
// vívido de verdad. Para matiz <50 esta franja de saturación en la
// práctica arranca en 60 (el techo de marrón/beige, que se evalúa antes),
// no en 35 -- el piso de 35 solo importa en la franja 50-55, donde marrón/
// beige ya no compite.
const MOSTAZA_HUE_MIN = 35;
const MOSTAZA_HUE_MAX = 55;
const MOSTAZA_S_MIN = 35;
const MOSTAZA_S_MAX = 75;
const MOSTAZA_L_MIN = 30;
const MOSTAZA_L_MAX = 65;

/** Nombre de color en español, para no depender solo del color renderizado
 *  del ícono -- con poco brillo de pantalla dos colores parecidos se leen
 *  igual. Los umbrales de "neutro" (s<=15, l<=12, l>=88) son los mismos que
 *  usa el algoritmo de combinación en recommend.ts (esNeutro), repetidos acá
 *  a propósito para no crear una dependencia cruzada entre este archivo
 *  (utilidades de color puras) y la lógica de recomendación -- si se tocan
 *  ahí, hay que tocarlos acá también. */
export function nombreColor(h: number, s: number, l: number): string {
  if (l <= 12) return "Negro";
  if (l >= 88) return s <= 15 ? "Blanco" : "Blanco roto";
  if (s <= 15) {
    if (l < 35) return "Gris oscuro";
    if (l < 65) return "Gris";
    return "Gris claro";
  }

  if (h >= 15 && h < 50 && s < SATURACION_NARANJA_REAL) {
    if (l >= 65) return "Beige";
    return l < 30 ? "Marrón oscuro" : "Marrón";
  }

  if (
    h >= MOSTAZA_HUE_MIN &&
    h < MOSTAZA_HUE_MAX &&
    s >= MOSTAZA_S_MIN &&
    s < MOSTAZA_S_MAX &&
    l >= MOSTAZA_L_MIN &&
    l < MOSTAZA_L_MAX
  ) {
    return "Mostaza";
  }

  if (h >= VERDE_MILITAR_HUE_MIN && h < VERDE_MILITAR_HUE_MAX && s < SATURACION_VERDE_MILITAR) {
    if (l < 30) return "Verde militar oscuro";
    if (l > 78) return "Verde militar claro";
    return "Verde militar";
  }

  if (h >= BORDO_HUE_MIN && l < BORDO_L_MAX) {
    return "Bordó";
  }

  if ((h >= BORDO_HUE_MIN || h < 15) && l >= ROSA_L_MIN) {
    return "Rosa";
  }

  if (h >= AZUL_MARINO_HUE_MIN && h < AZUL_MARINO_HUE_MAX && l < AZUL_MARINO_L_MAX) {
    return "Azul marino";
  }

  if (h >= CELESTE_HUE_MIN && h < CELESTE_HUE_MAX && l >= CELESTE_L_MIN) {
    return "Celeste";
  }

  const matiz =
    h < 15 || h >= 345
      ? "Rojo"
      : h < 45
        ? "Naranja"
        : h < 65
          ? "Amarillo"
          : h < 160
            ? "Verde"
            : h < 195
              ? "Turquesa"
              : h < 250
                ? "Azul"
                : h < 290
                  ? "Violeta"
                  : h < 330
                    ? "Magenta"
                    : "Rosa";

  if (l < 30) return `${matiz} oscuro`;
  if (l > 78) return `${matiz} claro`;
  return matiz;
}

/** Contorno de una prenda derivado de su propio matiz (Maniqui.tsx), en vez
 *  de un gris genérico -- un contorno negro al 15% es invisible sobre una
 *  prenda oscura y casi invisible sobre una blanca; uno del mismo matiz,
 *  más oscuro y algo más saturado, se ve en cualquier prenda. clamp(l, 4,
 *  92) evita blanco puro (l=100 -18 -> 82, aceptable) y negro puro sin
 *  contorno visible (l=0 -18 -> clampeado a 4, no a un negativo sin
 *  sentido para hsl()). */
/** Saturación "realzada" de un tono derivado (contorno, trama, detalle):
 *  sube la saturación para que el derivado no se funda con la prenda...
 *  pero SOLO si la prenda tiene un matiz real que realzar.
 *
 *  Bug real encontrado renderizando el catálogo completo (Consejo, ronda
 *  "los íconos más parecidos a la prenda real", roles modista/asesor de
 *  color): las tres funciones sumaban saturación siempre, incluso sobre un
 *  color ACROMÁTICO. Y como todos los negros y grises del catálogo se
 *  guardan con h=0 (matiz rojo, irrelevante mientras s=0), sumarles
 *  saturación no los "realzaba": les INVENTABA un matiz rojo. En el render
 *  real se veía: la raya planchada de un pantalón de vestir negro salía
 *  marrón rojiza, el perforado del zapato de vestir negro salía anaranjado
 *  y la trama de cualquier prenda gris salía tibia en vez de gris.
 *
 *  Un derivado de un neutro tiene que seguir siendo neutro -- lo que da
 *  contraste sobre negro/gris es la LUZ, que las tres funciones ya ajustan
 *  aparte y sigue igual. El umbral es el mismo que usa el motor para
 *  decidir si un color es neutro (NEUTRO_S_MAX en recommend.ts, duplicado
 *  acá a propósito por 1 número: recommend importa color, no al revés, y
 *  no vale invertir esa dependencia). */
/** Croma HSL real (0-100): `s` desnormalizado por `l`. Fórmula duplicada a
 *  propósito de `croma` en recommend.ts (ver su comentario largo: es esta
 *  magnitud, y no `s`, la que dice cuánto color se VE) -- recommend importa
 *  color, no al revés, y no vale invertir esa dependencia por una línea. */
function cromaHsl(s: number, l: number): number {
  return s * (1 - Math.abs((2 * l) / 100 - 1));
}
/** Cuánto más color que la prenda puede llegar a mostrar un derivado suyo.
 *  1.25 = "un poco más vivo, para que se despegue", nunca "otro color". */
const CROMA_MAX_DERIVADO = 1.25;
function saturacionDerivada(s: number, l: number, lDerivada: number, delta: number): number {
  // El derivado siempre se dibuja a OTRA luminosidad que la prenda (más
  // clara sobre una prenda oscura, más oscura sobre una clara) -- y la
  // misma `s` rinde MUCHO más croma a media luz que en los extremos. Por
  // eso el techo se pone sobre el croma del resultado y no sobre su `s`:
  // es lo único que se corresponde con lo que se ve.
  //
  // Los dos casos reales que lo motivaron, encontrados renderizando el
  // catálogo completo (Consejo, ronda "los íconos más parecidos a la
  // prenda real", roles modista/asesor de color):
  //   - "zapatos-cuero-negro" (#1C1210, el negro de cuero que comparten
  //     los zapatos y los mocasines) tiene s=27 -- por encima de cualquier
  //     umbral razonable sobre `s` -- pero croma 5: a la vista es negro.
  //     Aclarado a l=31 conservando su `s`, reaparecía como marrón ÓXIDO
  //     en el perforado del zapato y en la tira del mocasín.
  //   - "zapatos-cuero-marron"/"mocasines-marrones" (#6F4E37, croma 22, un
  //     marrón cuero apagado real) sacaban una costura y una tira NARANJA
  //     FLÚO: croma 39, casi el doble que el cuero del que salen.
  // En los dos casos el problema es el mismo y la respuesta también: un
  // detalle de una prenda es la MISMA tela un poco más clara o más oscura
  // (un pliegue, una costura, una solapa dada vuelta), nunca otro color.
  // El contraste que los hace visibles lo da la LUZ, que cada función
  // ajusta aparte y no se toca acá.
  const factor = 1 - Math.abs((2 * lDerivada) / 100 - 1);
  const realzada = Math.min(100, s + delta);
  if (factor <= 0.01) return realzada;
  return Math.min(realzada, (cromaHsl(s, l) * CROMA_MAX_DERIVADO) / factor);
}

export function contornoHsl(h: number, s: number, l: number): string {
  const l2 = Math.max(4, Math.min(92, l) - 18);
  return `hsl(${h} ${redondear(saturacionDerivada(s, l, l2, 5))}% ${l2}%)`;
}

/** Los tonos derivados salen como string CSS, así que se redondea acá una
 *  sola vez: un `hsl(10 7.83...% 31%)` es válido pero ilegible en el DOM y
 *  en cualquier test. */
function redondear(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Tono del PATRÓN de textura (la trama/brillo que dibuja PatronTextura en
 *  PrendaIcon.tsx/Maniqui.tsx) -- no es lo mismo que contornoHsl. Revisado
 *  como ingeniero textil, pedido explícito del usuario ("revisá los
 *  íconos... que coincidan con la prenda"): sobre una prenda YA oscura
 *  (ej. un sweater de lana negro), contornoHsl resta 18 de luminosidad y
 *  choca contra el piso (4%) -- el patrón queda prácticamente del mismo
 *  tono que el relleno y se vuelve invisible (confirmado renderizando el
 *  ícono real: el patrón de punto se veía perfecto sobre gris, pero
 *  desaparecía por completo sobre negro). El contorno de la silueta
 *  disimula esto porque igual se recorta contra el fondo de la tarjeta,
 *  pero un patrón interno no tiene ese borde exterior para apoyarse. Mismo
 *  criterio que ya resolvió el problema gemelo en detalleHsl (el cuello de
 *  una prenda negra): en vez de oscurecer más sobre una base ya oscura,
 *  hay que ACLARAR -- el mismo principio que un pliegue de tela real, que
 *  se puede leer por sombra o por brillo según de qué lado cae la luz, acá
 *  elegido por contraste garantizado. Umbral en l<25 (no 50 como
 *  detalleHsl): el patrón es un detalle mucho más fino que un cuello, así
 *  que necesita menos margen para seguir siendo legible por debajo. */
export function tonoTexturaHsl(h: number, s: number, l: number): string {
  const l2 = l < 25 ? Math.min(85, l + 20) : Math.max(4, l - 18);
  return `hsl(${h} ${redondear(saturacionDerivada(s, l, l2, 5))}% ${l2}%)`;
}

/** Tono más oscuro del mismo matiz, para el lado "sombra" de un degradé
 *  simple de dos paradas que le da algo de volumen a una prenda de color
 *  plano (Maniqui.tsx) sin necesitar texturas ni assets. */
export function sombraHsl(h: number, s: number, l: number): string {
  return `hsl(${h} ${s}% ${Math.max(2, l - 10)}%)`;
}

/** Tono más claro del mismo matiz, lado "luz" del degradé de sombraHsl. */
export function luzHsl(h: number, s: number, l: number): string {
  return `hsl(${h} ${s}% ${Math.min(98, l + 7)}%)`;
}

/** Tono de "detalle" (cuello, dobladillo, cinturilla) con contraste
 *  garantizado contra la prenda, sea cual sea su color real -- reporte
 *  real del usuario en una prenda negra (Maniqui.tsx): sombraHsl sola no
 *  alcanza para un color ya oscuro, porque restarle 10% de luz más lo deja
 *  casi en el mismo tono que el propio degradé de sombra de la prenda
 *  (que ya llega hasta l-10) -- el cuello se volvía casi invisible. Acá,
 *  si la prenda es clara (l>=50) se oscurece bastante (como una sombra
 *  marcada); si es oscura, se ACLARA en vez de oscurecer más -- mismo
 *  criterio que un pliegue de tela real, que puede leerse por sombra o
 *  por brillo según de qué lado cae la luz, pero elegido acá por
 *  contraste garantizado, no por estética. */
export function detalleHsl(h: number, s: number, l: number): string {
  if (l >= 50) return `hsl(${h} ${s}% ${Math.max(4, l - 25)}%)`;
  const l2 = Math.min(92, l + 22);
  return `hsl(${h} ${redondear(saturacionDerivada(s, l, l2, 10))}% ${l2}%)`;
}
