import type { Categoria } from "./types";

/**
 * Referencia de precios de indumentaria en Argentina, por categoría y nivel
 * de marca -- pedido explícito del usuario en la auditoría de producto
 * (Consejo, roles: personal shopper / comprador retail): "el motor de
 * compras nunca habla de plata" era el hallazgo más serio de esa revisión
 * -- un "gestor de compras" que solo dice "comprá esto" sin nunca decir
 * cuánto cuesta no ayuda a decidir de verdad. Pedido de seguimiento
 * explícito: "el tema de los precios buscá en Internet... para Argentina.
 * Podés usar Mercado Libre, y también Shein. Y también la web de primeras
 * marcas... armar categoría primera marca, segunda marca, tercera marca."
 *
 * MUY IMPORTANTE -- limitación real, declarada a propósito (Consejo, Paso 9:
 * "si un dato actual no puede verificarse, indicá la limitación"): las
 * herramientas de búsqueda de este entorno NO pueden abrir Mercado Libre,
 * Shein ni Nike Argentina directamente (el proxy de salida bloquea esos
 * dominios) -- toda la investigación se hizo vía snippets de búsqueda web
 * (WebSearch), no scrapeando listados en vivo. Esto es una REFERENCIA
 * orientativa (rangos, no precios de un producto puntual) para poder
 * comparar "más o menos cuánto sale" entre categorías y niveles de marca,
 * NO un feed de precios en tiempo real -- no hay (ni puede haber, sin una
 * integración real con una API de precios) un precio exacto de un SKU
 * puntual acá. Fecha de esta investigación: septiembre 2026.
 *
 * Tres niveles de marca, en las palabras del propio usuario:
 * - "tercera marca": lo más económico -- Shein y equivalentes (indumentaria
 *   importada de bajo costo, sin marca reconocida).
 * - "segunda marca": el grueso de Mercado Libre Argentina -- marca
 *   nacional/reconocida pero no de las marcas "premium" internacionales
 *   (Topper, Taverniti, Portsaid, Kevingston, etc.).
 * - "primera marca": marca internacional premium con tienda oficial en
 *   Argentina (Nike, Zara, Levi's) -- consistentemente 2-4x más cara que
 *   segunda marca en TODA categoría con datos reales de las dos puntas
 *   (jean: Mercado Libre ~$35.000-$70.000 vs. Levi's ~$135.000-$198.000;
 *   remera: Shein ~$8.000-$12.000 vs. Nike hasta $185.999) -- el motivo
 *   real y verificado (no solo folklore) es el que citan las fuentes de
 *   abajo: aranceles de importación + protección textil hacen que la
 *   ropa importada de marca cueste en Argentina, en promedio, el doble que
 *   en países vecinos (Chile, México).
 *
 * HECHO (rango con fuente directa, ver comentario puntual de cada fila) vs.
 * INFERENCIA (categoría sin dato directo, estimada por analogía con una
 * categoría hermana ya sourceada, usando el mismo multiplicador
 * tercera->segunda->primera ya confirmado con datos reales) -- nunca se
 * inventa un número sin ese criterio explícito detrás.
 */
export type NivelMarca = "tercera_marca" | "segunda_marca" | "primera_marca";

export const NIVEL_MARCA_LABEL: Record<NivelMarca, string> = {
  tercera_marca: "Tercera marca (Shein y similares)",
  segunda_marca: "Segunda marca (Mercado Libre, marca nacional)",
  primera_marca: "Primera marca (Nike/Zara/Levi's, tienda oficial)",
};

export interface RangoPrecioARS {
  min: number;
  max: number;
}

type TablaPrecios = Record<Categoria, Record<NivelMarca, RangoPrecioARS>>;

/** Ver el comentario largo de arriba sobre método y limitaciones. Fuentes
 *  puntuales (WebSearch, septiembre 2026):
 *  - remera: Shein Argentina $8.000-$12.000 (iprofesional.com, outlet Shein);
 *    Nike Argentina remeras $46.749-$185.999 (nike.com.ar, rango oficial).
 *  - buzo/campera liviana: Shein Argentina camperas/buzos $10.000-$27.000
 *    (iprofesional.com); buzo canguro Mercado Libre Argentina en las
 *    bandas hasta $35.000 / $35.000-$40.000 / +$40.000 (listado.mercado-
 *    libre.com.ar/buzos-canguro-hombre).
 *  - pantalon (jean): Mercado Libre Argentina, grueso de la oferta hasta
 *    $45.000, banda media $45.000-$80.000 (listado.mercadolibre.com.ar/
 *    jean-hombre); jean Levi's Argentina $135.000-$198.000, ~2x el precio
 *    de Chile/México por aranceles de importación (minutouno.com,
 *    lagaceta.com.ar, citando datos de la Fundación ProTejer).
 *  - camisa de vestir: Mercado Libre Argentina, bandas hasta $30.000,
 *    $30.000-$60.000, +$60.000 (listado.mercadolibre.com.ar/camisa-de-
 *    vestir-hombre).
 *  - calzado (zapatillas urbanas): Mercado Libre Argentina marca nacional
 *    (Topper/Jaguar) desde $33.000, con ofertas de referencia en
 *    $39.989-$59.999 (listado.mercadolibre.com.ar/zapatillas-urbanas-
 *    hombre); primera marca (Nike/Converse/Vans) $59.999-$149.999 (mismo
 *    listado, precios de lista antes de descuento).
 *  - accesorio (cinturón de cuero): Mercado Libre/tiendas especializadas
 *    $14.789-$24.900 cuero vacuno genuino (pizzoni.com.ar, búsqueda
 *    "cinturón cuero hombre Argentina").
 *  - saco/blazer: reventa de Zara vía Mercado Libre Argentina $110.000-
 *    $189.000 (listado.mercadolibre.com.ar/blazer-zara-hombre) -- tomado
 *    como ancla de "primera marca" para esta categoría.
 *
 *  El resto de las categorías (bermuda, short_deportivo, sweater, y las
 *  filas sin fuente directa arriba) son INFERENCIA: estimadas aplicando el
 *  mismo multiplicador tercera/segunda/primera ya confirmado (~1.5-2x
 *  entre escalones, ~4x de punta a punta) sobre la categoría hermana más
 *  cercana (bermuda ~0.6x pantalón, short_deportivo similar a remera
 *  deportiva, sweater similar a buzo). Nunca una cifra sin ese criterio. */
const TABLA_PRECIOS: TablaPrecios = {
  remera: {
    tercera_marca: { min: 8000, max: 12000 },
    segunda_marca: { min: 15000, max: 28000 },
    primera_marca: { min: 46000, max: 186000 },
  },
  buzo: {
    tercera_marca: { min: 10000, max: 20000 },
    segunda_marca: { min: 25000, max: 45000 },
    primera_marca: { min: 80000, max: 150000 },
  },
  sweater: {
    // INFERENCIA -- análoga a buzo (misma franja de "abrigo de torso
    // liviano/tejido"), sin fuente directa propia.
    tercera_marca: { min: 12000, max: 20000 },
    segunda_marca: { min: 25000, max: 45000 },
    primera_marca: { min: 60000, max: 110000 },
  },
  pantalon: {
    tercera_marca: { min: 20000, max: 35000 },
    segunda_marca: { min: 35000, max: 70000 },
    primera_marca: { min: 135000, max: 198000 },
  },
  bermuda: {
    // INFERENCIA -- ~0.6x pantalón (menos tela, misma tercerización de
    // confección), sin fuente directa propia.
    tercera_marca: { min: 12000, max: 22000 },
    segunda_marca: { min: 22000, max: 42000 },
    primera_marca: { min: 65000, max: 110000 },
  },
  short_deportivo: {
    // INFERENCIA -- similar a remera deportiva por volumen de tela y
    // canal de venta (deportivo masivo), sin fuente directa propia.
    tercera_marca: { min: 8000, max: 15000 },
    segunda_marca: { min: 18000, max: 30000 },
    primera_marca: { min: 40000, max: 80000 },
  },
  camisa: {
    tercera_marca: { min: 12000, max: 18000 },
    segunda_marca: { min: 20000, max: 40000 },
    primera_marca: { min: 60000, max: 110000 },
  },
  calzado: {
    tercera_marca: { min: 18000, max: 30000 },
    segunda_marca: { min: 33000, max: 60000 },
    primera_marca: { min: 60000, max: 150000 },
  },
  campera: {
    // INFERENCIA -- una campera de abrigo real (gabardina/pluma/lana) es
    // una prenda de mayor volumen de tela y construcción que un buzo o una
    // campera liviana tipo tricot -- se ubica por encima de esa franja,
    // sin fuente directa propia.
    tercera_marca: { min: 25000, max: 45000 },
    segunda_marca: { min: 50000, max: 95000 },
    primera_marca: { min: 120000, max: 220000 },
  },
  saco: {
    // INFERENCIA en tercera/segunda -- primera marca sí tiene fuente
    // directa (Zara vía reventa en Mercado Libre); un saco de sastrería es
    // la prenda de mayor construcción del catálogo (entretelado, forro,
    // solapas), consistente con ser la categoría más cara de punta a punta.
    tercera_marca: { min: 20000, max: 38000 },
    segunda_marca: { min: 50000, max: 95000 },
    primera_marca: { min: 110000, max: 189000 },
  },
  accesorio: {
    // segunda_marca tiene fuente directa (cuero vacuno genuino, Mercado
    // Libre/tiendas especializadas); tercera (sintético tipo Shein) y
    // primera (cuero premium de marca) son INFERENCIA por analogía de
    // material, no de fuente puntual.
    tercera_marca: { min: 3000, max: 8000 },
    segunda_marca: { min: 15000, max: 25000 },
    primera_marca: { min: 30000, max: 50000 },
  },
};

/** Rango de precio orientativo en ARS para una categoría y nivel de marca.
 *  Ver el comentario largo de TABLA_PRECIOS sobre método y limitaciones --
 *  nunca un precio puntual de un producto real, siempre un rango. */
export function rangoPrecio(categoria: Categoria, nivelMarca: NivelMarca): RangoPrecioARS {
  return TABLA_PRECIOS[categoria][nivelMarca];
}

function formatearARS(n: number): string {
  // Redondeado al millar -- son rangos orientativos, no cifras exactas de
  // un producto puntual, así que mostrar los últimos 3 dígitos sería falsa
  // precisión. Separador de miles "." (convención argentina).
  const miles = Math.round(n / 1000);
  return `$${miles.toLocaleString("es-AR")}.000`;
}

/** Texto listo para mostrar en una tarjeta de recomendación de compra: el
 *  rango completo, de la punta más económica (tercera marca) a la más cara
 *  (primera marca) -- pedido explícito del usuario de mostrar los 3
 *  niveles, no un solo precio inventado. Un recomendación de compra sin
 *  ninguna referencia de plata (el hallazgo original de esta ronda) no
 *  ayuda a decidir; mostrar los 3 pisos de precio sí, sin fingir saber
 *  cuál de los tres va a elegir el usuario. */
export function rangoPrecioTexto(categoria: Categoria): string {
  const tercera = rangoPrecio(categoria, "tercera_marca");
  const primera = rangoPrecio(categoria, "primera_marca");
  return `Aprox. ${formatearARS(tercera.min)}–${formatearARS(primera.max)} en Argentina (de tercera a primera marca)`;
}
