import { describe, expect, it } from "vitest";
import { CATALOGO_PRENDAS } from "./catalogo";
import type { Categoria, CorteCalzado, Estilo } from "./types";

// buzo/sweater/campera -- las tres categorías de abrigo que SÍ se tagean
// por estación (ver el criterio al principio de catalogo.ts). Mismo
// criterio que CATEGORIAS_ABRIGO en recommend.ts (duplicado a propósito
// acá, mismo motivo que ya documenta el resto del archivo: no crear una
// dependencia cruzada por 3 strings). buzo se sumó en la ronda siguiente
// -- ver el describe dedicado más abajo, con el mapeo textura->estacion
// puntual que usó para backfillear los 11 buzos existentes.
const CATEGORIAS_ABRIGO_CON_ESTACION: Categoria[] = ["buzo", "sweater", "campera"];

describe("catálogo -- buzo/sweater/campera siempre tageados por estación", () => {
  // Pedido explícito del usuario: diferenciar los abrigos de entretiempo
  // de los de invierno. A diferencia del resto del catálogo (donde
  // `estacion` se deja vacía a propósito por ser ambigua -- ver el
  // criterio al principio de catalogo.ts), un buzo, sweater o campera
  // SIEMPRE tienen un nivel de abrigo real y no deberían quedar sin tagear.
  it("ningún buzo/sweater/campera queda sin `estacion`", () => {
    const abrigos = CATALOGO_PRENDAS.filter((p) => CATEGORIAS_ABRIGO_CON_ESTACION.includes(p.categoria));
    expect(abrigos.length).toBeGreaterThan(0);
    const sinEstacion = abrigos.filter((p) => !p.estacion);
    expect(sinEstacion.map((p) => p.id)).toEqual([]);
  });

  // Revisado como ingeniero textil, pedido explícito del usuario: la
  // textura GENÉRICA no alcanza para decidir la estación -- importa el
  // peso/relleno real de cada prenda puntual, no la familia de tela. Una
  // campera acolchada tipo Uniqlo (relleno fino) es de entretiempo real;
  // solo la oversize (mucho más relleno/volumen) es de invierno de
  // verdad -- las dos son "acolchado", pero no la misma estación.
  it("acolchado NO es siempre invierno -- coexisten variantes de entretiempo (relleno fino) e invierno (oversize) real", () => {
    const acolchados = CATALOGO_PRENDAS.filter((p) => p.textura === "acolchado");
    expect(acolchados.length).toBeGreaterThan(0);
    expect(acolchados.some((p) => p.estacion === "entretiempo")).toBe(true);
    expect(acolchados.some((p) => p.estacion === "invierno")).toBe(true);
  });

  // Mismo criterio, del otro lado: "lana" no es siempre entretiempo -- un
  // sweater de lana gruesa es la prenda de punto de invierno por
  // excelencia. La versión liviana de entretiempo es de fibra distinta
  // (viscosa/poliéster), no la misma lana con otro nombre.
  it("lana no es siempre entretiempo -- un sweater de lana es invierno real, la versión liviana usa otra fibra", () => {
    const deLana = CATALOGO_PRENDAS.filter((p) => p.textura === "lana" && p.categoria === "sweater");
    expect(deLana.length).toBeGreaterThan(0);
    for (const p of deLana) {
      expect(p.estacion, p.id).toBe("invierno");
    }
    const livianos = CATALOGO_PRENDAS.filter((p) => p.categoria === "sweater" && p.textura !== "lana");
    expect(livianos.length).toBeGreaterThan(0);
    for (const p of livianos) {
      expect(p.estacion, p.id).toBe("entretiempo");
    }
  });

  it("hay al menos una campera de invierno en registro clásico/formal (no solo pluma casual/urbana)", () => {
    const inviernoClasico = CATALOGO_PRENDAS.filter(
      (p) => p.categoria === "campera" && p.estacion === "invierno" && (p.estilo === "clasico" || p.estilo === "formal"),
    );
    expect(inviernoClasico.length).toBeGreaterThan(0);
  });

  it("las demás categorías (no buzo/sweater/campera) siguen sin forzar `estacion`, a propósito", () => {
    const noAbrigos = CATALOGO_PRENDAS.filter((p) => !CATEGORIAS_ABRIGO_CON_ESTACION.includes(p.categoria));
    expect(noAbrigos.some((p) => !p.estacion)).toBe(true);
  });
});

describe("catálogo -- buzo: peso por textura Y por estación (mapeadas una a la otra)", () => {
  // Consejo, ronda siguiente -- reemplaza el criterio anterior de esta
  // ronda ("los buzos tmb algunos son livianos y otros más pesados... pero
  // tampoco los llamaría de invierno o de entretiempo", que dejaba a
  // NINGÚN buzo con `estacion`). Pedido explícito del usuario, contrario a
  // ese criterio anterior: "revisá todos los buzos porque no figuran las
  // clasificaciones de invierno o entretiempo... agregá la opción para
  // marcar si un abrigo es de invierno o de entretiempo". Motivo real del
  // cambio de criterio: el motor de "Vestite hoy" (esAbrigoDeClima, ver
  // recommend.ts) exige el campo `estacion` puntual para reconocer un
  // torso como abrigo real de invierno/entretiempo -- NUNCA mira
  // `textura` -- así que sin este campo ningún buzo podía nunca contar
  // como abrigo real para esa regla, aunque la tela ya distinguiera pesado
  // de liviano. La textura sigue siendo el dato real del GRAMAJE (no se
  // saca, sigue existiendo la distinción tejido_grueso/frisado) -- ahora
  // además mapeada 1 a 1 a `estacion` (frisado->invierno, tejido_grueso->
  // entretiempo) para que el motor de clima también la reconozca.
  it("todo buzo del catálogo lleva `estacion`, mapeada de su textura", () => {
    const buzos = CATALOGO_PRENDAS.filter((p) => p.categoria === "buzo");
    expect(buzos.length).toBeGreaterThan(0);
    expect(buzos.every((p) => p.estacion)).toBe(true);
    expect(buzos.filter((p) => p.textura === "frisado").every((p) => p.estacion === "invierno")).toBe(true);
    expect(buzos.filter((p) => p.textura === "tejido_grueso").every((p) => p.estacion === "entretiempo")).toBe(true);
  });

  // El peso real (liviano vs. pesado/frisado) se resuelve con textura, no
  // con estacion -- coexisten las dos variantes en el catálogo.
  it("coexisten buzos livianos (tejido_grueso) y pesados (frisado)", () => {
    const buzos = CATALOGO_PRENDAS.filter((p) => p.categoria === "buzo");
    expect(buzos.some((p) => p.textura === "tejido_grueso")).toBe(true);
    expect(buzos.some((p) => p.textura === "frisado")).toBe(true);
  });

  // con_capucha (hoodie vs. crewneck) es un dato de corte, ortogonal al
  // peso de la tela -- reportado con dos prendas reales del placard del
  // usuario mostrando capucha cuando en realidad son crewneck.
  it("hay al menos un buzo crewneck (sin capucha) además de los hoodie por defecto", () => {
    const buzos = CATALOGO_PRENDAS.filter((p) => p.categoria === "buzo");
    expect(buzos.some((p) => p.conCapucha === false)).toBe(true);
    expect(buzos.some((p) => p.conCapucha !== false)).toBe(true);
  });
});

// Pedido explícito del usuario, con foto adjunta de la prenda real: "agrega
// la prenda de la captura adjunta al catálogo. Es un buzo de entretiempo.
// Presta atención a la combinación de colores." -- un buzo de 3 franjas
// horizontales (greige/crema/blanco) que introdujo el patron "bloques" (ver
// types.ts) y el tercer color (color3_hex) en todo el sistema, ninguno de
// los cuales existía antes de esta ronda.
describe("catálogo -- buzo color-block (pedido explícito del usuario, con foto de la prenda real)", () => {
  const colorblock = CATALOGO_PRENDAS.find((p) => p.id === "buzo-colorblock-greige");

  it("existe y es un buzo con patron bloques", () => {
    expect(colorblock).toBeDefined();
    expect(colorblock?.categoria).toBe("buzo");
    expect(colorblock?.patron).toBe("bloques");
  });

  it("lleva los 3 colores muestreados de la foto (greige/crema/blanco), no solo 2", () => {
    expect(colorblock?.colorHex).toBeDefined();
    expect(colorblock?.colorHex2).toBeDefined();
    expect(colorblock?.colorHex3).toBeDefined();
    // Las 3 franjas son tonos de la misma familia (greige->crema->blanco),
    // a propósito distinto de las camisas a rayas de arriba (que sí
    // contrastan fondo/raya) -- "presta atención a la combinación de
    // colores" del usuario era justamente evitar inventar un contraste que
    // la prenda real no tiene.
    expect(colorblock?.colorHex).not.toBe(colorblock?.colorHex2);
    expect(colorblock?.colorHex2).not.toBe(colorblock?.colorHex3);
  });

  it("es de entretiempo, como pidió el usuario explícitamente", () => {
    expect(colorblock?.estacion).toBe("entretiempo");
  });
});

describe("catálogo -- jean/jogger son urbano sin importar el color", () => {
  // Pedido explícito del usuario, con un caso real: cargó "Jean azul" desde
  // el catálogo y "Vestite hoy" no lo reconocía como Urbano. Causa real: una
  // ronda anterior había agregado el secundario "urbano" solo a jean-negro/
  // jogger-negro, razonando sobre el color en vez de la prenda -- lo que
  // hace urbano/streetwear a un jean o un jogger es el corte/tela (denim o
  // jogger de algodón), no un color puntual. Esta prueba fija esa regla
  // para que no se repita con un color nuevo del catálogo.
  const esUrbano = (p: (typeof CATALOGO_PRENDAS)[number]) =>
    p.estilo === "urbano" || (p.estilosSecundarios ?? []).includes("urbano");

  it("todo jean (pantalón o bermuda, textura denim) es urbano sin importar el color", () => {
    const jeans = CATALOGO_PRENDAS.filter(
      (p) => (p.categoria === "pantalon" || p.categoria === "bermuda") && p.textura === "denim",
    );
    expect(jeans.length).toBeGreaterThan(1); // más de un color, si no la regla no dice nada real
    expect(jeans.every(esUrbano)).toBe(true);
  });

  it("todo jogger (pantalón, algodón + casual) es urbano sin importar el color", () => {
    const joggers = CATALOGO_PRENDAS.filter(
      (p) => p.categoria === "pantalon" && p.textura === "algodon" && p.estilo === "casual",
    );
    expect(joggers.length).toBeGreaterThan(1);
    expect(joggers.every(esUrbano)).toBe(true);
  });
});

describe("catálogo -- saco (categoría nueva, pedido explícito del usuario: 'un traje azul marino')", () => {
  it("hay al menos un saco, formal, sin estacion (mismo criterio que buzo: no es una prenda que se elija por temperatura)", () => {
    const sacos = CATALOGO_PRENDAS.filter((p) => p.categoria === "saco");
    expect(sacos.length).toBeGreaterThan(0);
    for (const s of sacos) {
      expect(s.estilo, s.id).toBe("formal");
      expect(s.estacion, s.id).toBeUndefined();
    }
  });

  it("el pantalón de vestir azul marino y la corbata azul marino ya existían -- el traje completo combina sin agregar nada más al catálogo", () => {
    const pantalonVestirAzul = CATALOGO_PRENDAS.find((p) => p.categoria === "pantalon" && p.textura === "lana" && p.colorHex === "#1F2A44");
    const corbataAzul = CATALOGO_PRENDAS.find((p) => p.categoria === "accesorio" && p.requiereCuello && p.colorHex === "#1F2A44");
    expect(pantalonVestirAzul).toBeDefined();
    expect(corbataAzul).toBeDefined();
  });
});

// Pedido explícito del usuario, revisado como sastre e ingeniero textil:
// "los pantalones de vestir que tengo en mi placard, negro y marrón, que
// son de oficina y clásicos, son de gabardina... quizás en el catálogo
// también podés distinguir los pantalones de vestir de oficina, que son
// típicamente de gabardina, y los formales, que son otra tela más suave
// tipo de traje". Hueco real: hasta esta ronda TODO pantalón de vestir del
// catálogo era "lana", así que la prenda que más se usa para ir a trabajar
// no existía como tal, y encima no había NINGÚN pantalón de vestir marrón.
describe("catálogo -- pantalón de vestir: gabardina (oficina) vs. lana de traje (formal)", () => {
  const pantalones = CATALOGO_PRENDAS.filter((p) => p.categoria === "pantalon");
  const deLana = pantalones.filter((p) => p.textura === "lana");
  const deGabardina = pantalones.filter((p) => p.textura === "gabardina");

  it("existen las dos telas de pantalón de vestir, no una sola", () => {
    expect(deLana.length).toBeGreaterThan(0);
    expect(deGabardina.length).toBeGreaterThan(0);
  });

  // Separación estricta formal/oficina -- pedido explícito del usuario:
  // "separá el filtro de formal y oficina con el mismo criterio que lo
  // hicimos en mi placard" (llevó él mismo sus pantalones de lana a
  // "formal" puro y sus pantalones de oficina a "oficina" puro, sin
  // secundario cruzado, al cargar su placard real). Antes de esta ronda
  // el de lana llevaba "oficina" de secundario -- corregido: si la
  // gabardina existe para ser la tela DE oficina sin ambigüedad, la lana
  // de traje tiene que ser simétricamente formal puro.
  it("el de lana es el de TRAJE: formal puro, sin secundario oficina", () => {
    for (const p of deLana) {
      expect(p.estilo).toBe("formal");
      expect(p.estilosSecundarios ?? []).not.toContain("oficina");
    }
  });

  it("el de gabardina es el de OFICINA: nunca formal -- no es un pantalón de traje", () => {
    for (const p of deGabardina) {
      expect(p.estilo).toBe("oficina");
      expect([p.estilo, ...(p.estilosSecundarios ?? [])]).not.toContain("formal");
    }
  });

  it("los de lana cubren los tres colores de traje reales (negro, gris, azul marino)", () => {
    const hex = deLana.map((p) => p.colorHex);
    expect(hex).toContain("#1A1A1A");
    expect(hex).toContain("#6E6E6E");
    expect(hex).toContain("#1F2A44");
  });

  it("la gabardina cubre los dos colores que el usuario tiene de verdad (negro y marrón)", () => {
    const hex = deGabardina.map((p) => p.colorHex);
    expect(hex).toContain("#1A1A1A");
    expect(hex).toContain("#6F4E37");
  });

  it("los dos llevan calce ajustado y ocasión laburo -- misma silueta de sastrería, lo que cambia es la tela", () => {
    for (const p of [...deLana, ...deGabardina]) {
      expect(p.calce).toBe("ajustado");
      expect(p.ocasion).toBe("laburo");
    }
  });
});

describe("catálogo -- camisas a rayas (pedido explícito del usuario: 'blanca y celestes y de otros colores', inspirado en usos y costumbres/moda real de oficina)", () => {
  const camisasConPatron = CATALOGO_PRENDAS.filter((p) => p.categoria === "camisa" && p.patron && p.patron !== "liso");

  // Invariante de datos: un patron "rayas"/"cuadros" sin colorHex2 se
  // renderiza silenciosamente como color liso (mismo tipo de bug de "gap
  // silencioso" que ya se dio con otras categorías en esta sesión) -- este
  // test evita que se repita.
  it("toda camisa con patron rayas/cuadros tiene su segundo color cargado", () => {
    expect(camisasConPatron.length).toBeGreaterThan(0);
    for (const p of camisasConPatron) {
      expect(p.colorHex2, p.id).toBeDefined();
    }
  });

  it("hay camisas a rayas de fondo blanco (el clásico de oficina: celeste, azul marino, rosa) y de otros colores/registros", () => {
    const rayadasBlancas = camisasConPatron.filter((p) => p.patron === "rayas" && p.colorHex === "#F5F5F5");
    expect(rayadasBlancas.length).toBeGreaterThanOrEqual(3);
    // al menos una rayada NO blanca de base (Bengal invertida: fondo celeste,
    // raya blanca) -- registro más informal/versátil, no solo la de oficina.
    expect(camisasConPatron.some((p) => p.patron === "rayas" && p.colorHex !== "#F5F5F5")).toBe(true);
  });

  it("las rayadas de oficina (fondo blanco) son estilo clásico/laburo; hay al menos una urbana/casual también", () => {
    const rayadasBlancas = camisasConPatron.filter((p) => p.patron === "rayas" && p.colorHex === "#F5F5F5");
    expect(rayadasBlancas.every((p) => p.estilo === "clasico" || p.estilo === "urbano")).toBe(true);
    expect(camisasConPatron.some((p) => p.estilo === "urbano")).toBe(true);
  });

  it("camisa-cuadros tiene patron cuadros con su segundo color cargado (antes prometía un cuadro que nunca se dibujaba)", () => {
    const cuadros = CATALOGO_PRENDAS.find((p) => p.id === "camisa-cuadros");
    expect(cuadros).toBeDefined();
    expect(cuadros?.patron).toBe("cuadros");
    expect(cuadros?.colorHex2).toBeDefined();
  });
});

describe("catálogo -- calzado con corte real por registro (pedido explícito del usuario: 'dale más detalles a las zapatillas... revisa todos los estilos... las costuras, cortes y decoración más usadas')", () => {
  const calzado = CATALOGO_PRENDAS.filter((p) => p.categoria === "calzado");

  // Antes de esta ronda el catálogo cubría 3 de los 5 registros (urbano/
  // formal/deportivo) -- clasico y casual no tenían NINGÚN calzado propio.
  it("cubre los 5 registros (Estilo), no solo urbano/formal/deportivo", () => {
    const estilos: Estilo[] = ["urbano", "formal", "deportivo", "clasico", "casual"];
    for (const estilo of estilos) {
      expect(calzado.some((p) => p.estilo === estilo), estilo).toBe(true);
    }
  });

  // Invariante de datos: todo calzado del catálogo declara su corte real de
  // forma explícita (no depende del default silencioso) -- evita que una
  // entrada nueva se cuele sin revisar qué corte le corresponde de verdad.
  it("todo calzado declara corteCalzado explícitamente", () => {
    expect(calzado.length).toBeGreaterThan(0);
    for (const p of calzado) {
      expect(p.corteCalzado, p.id).toBeDefined();
    }
  });

  // Mapeo real por registro -- revisado como modista: 3 rayas (Samba/
  // Superstar) es un diseño de calle/lifestyle, no de zapatilla técnica de
  // entrenamiento, por eso urbano != deportivo acá (ver el comentario largo
  // de CorteCalzado en types.ts).
  // `some` y no `every` desde la ronda de completitud del catálogo: el
  // botín (ver CorteCalzado en types.ts) es un segundo arquetipo
  // legítimo de los registros clásico y urbano -- un guardarropa real
  // tiene mocasines Y botines, no uno solo por registro. Lo que sigue
  // siendo un invariante es que el arquetipo de cada registro ESTÉ.
  it("cada registro tiene presente el arquetipo real que le corresponde", () => {
    const mapeo: Record<string, CorteCalzado> = {
      urbano: "zapatilla_urbana",
      deportivo: "zapatilla_running",
      formal: "zapato_vestir",
      clasico: "mocasin",
      casual: "zapatilla_lona",
    };
    for (const [estilo, corte] of Object.entries(mapeo)) {
      const deEseEstilo = calzado.filter((p) => p.estilo === estilo);
      expect(deEseEstilo.length, estilo).toBeGreaterThan(0);
      expect(deEseEstilo.some((p) => p.corteCalzado === corte), estilo).toBe(true);
    }
  });

  it("hay mocasines (clasico) y zapatillas de lona (casual) en cuero/lona real, no reusando la textura de otro material", () => {
    const mocasines = calzado.filter((p) => p.corteCalzado === "mocasin");
    expect(mocasines.length).toBeGreaterThan(0);
    expect(mocasines.every((p) => p.textura === "cuero_liso")).toBe(true);

    const lona = calzado.filter((p) => p.corteCalzado === "zapatilla_lona");
    expect(lona.length).toBeGreaterThan(0);
    expect(lona.every((p) => p.textura !== "cuero_liso")).toBe(true);
  });

  // Ronda de completitud del catálogo, revisada como modista y asesor de
  // imagen: los cinco cortes anteriores son TODOS calzado bajo, así que un
  // placard armado con este catálogo no tenía con qué vestirse los pies en
  // invierno -- en una app que separa invierno/entretiempo/verano en todas
  // las demás categorías de abrigo.
  it("hay botines de cuero (el único calzado de caña alta) en registro clásico y urbano", () => {
    const botines = calzado.filter((p) => p.corteCalzado === "botin");
    expect(botines.length).toBeGreaterThan(0);
    expect(botines.every((p) => p.textura === "cuero_liso")).toBe(true);
    const registros = botines.flatMap((p) => [p.estilo, ...(p.estilosSecundarios ?? [])]);
    expect(registros).toContain("clasico");
    expect(registros).toContain("urbano");
  });

  // Sin estacion a propósito: un botín se usa de otoño a primavera, no solo
  // con frío extremo -- tagearlo "invierno" lo sacaría de todos los outfits
  // de entretiempo, que es justo cuando más se usa.
  it("ningún calzado fuerza `estacion` -- tampoco el botín", () => {
    expect(calzado.every((p) => !p.estacion)).toBe(true);
  });

  // Sandalias -- ronda de completitud del catálogo (ver CorteCalzado en
  // types.ts): la contraparte de verano del botín. Sin ella, un placard
  // armado con este catálogo no tenía calzado real de verano/calle, solo
  // zapatilla cerrada todo el año.
  it("hay sandalias de cuero", () => {
    const sandalias = calzado.filter((p) => p.corteCalzado === "sandalia");
    expect(sandalias.length).toBeGreaterThan(0);
    expect(sandalias.every((p) => p.textura === "cuero_liso")).toBe(true);
  });
});

// Ronda de completitud del catálogo (pedido explícito del usuario: "revisá
// todas las prendas del catálogo, quiero que me digas si está completo o
// se puede completar aún más"), revisada como modista y asesor de imagen.
describe("catálogo -- chomba/polo (ver Cuello en types.ts)", () => {
  const chombas = CATALOGO_PRENDAS.filter((p) => p.categoria === "remera" && p.cuello === "polo");

  it("existe al menos una chomba, categoria remera con cuello polo", () => {
    expect(chombas.length).toBeGreaterThan(0);
  });

  it("es de registro clasico (smart-casual), no formal ni deportivo", () => {
    expect(chombas.every((p) => p.estilo === "clasico")).toBe(true);
  });
});

describe("catálogo -- chaleco (sweater sin mangas, ver Manga en types.ts)", () => {
  const chalecos = CATALOGO_PRENDAS.filter((p) => p.categoria === "sweater" && p.manga === "sin_mangas");

  it("existe al menos un chaleco", () => {
    expect(chalecos.length).toBeGreaterThan(0);
  });

  it("es de lana e invierno, mismo criterio textil que el resto de los sweaters de oficina", () => {
    expect(chalecos.every((p) => p.textura === "lana" && p.estacion === "invierno")).toBe(true);
  });
});

describe("catálogo -- sweater cuello alto (ver Cuello en types.ts)", () => {
  it("sweater-cuello-alto-negro declara cuello 'alto' explícitamente", () => {
    const p = CATALOGO_PRENDAS.find((p) => p.id === "sweater-cuello-alto-negro");
    expect(p?.cuello).toBe("alto");
  });
});

describe("catálogo -- camisa de manga corta (ver Manga en types.ts)", () => {
  const mangaCorta = CATALOGO_PRENDAS.filter((p) => p.categoria === "camisa" && p.manga === "corta");

  it("existe al menos una camisa de manga corta", () => {
    expect(mangaCorta.length).toBeGreaterThan(0);
  });

  it("es de registro oficina/laburo, como el resto de las camisas lisas de oficina", () => {
    expect(mangaCorta.every((p) => p.estilosSecundarios?.includes("oficina"))).toBe(true);
  });
});

describe("catálogo -- gorro/gorra (posicion_accesorio 'cabeza', ver types.ts)", () => {
  const deCabeza = CATALOGO_PRENDAS.filter((p) => p.categoria === "accesorio" && p.posicionAccesorio === "cabeza");
  const gorros = deCabeza.filter((p) => p.textura === "lana");
  const gorras = deCabeza.filter((p) => p.textura !== "lana");

  it("hay al menos un gorro de lana y una gorra", () => {
    expect(gorros.length).toBeGreaterThan(0);
    expect(gorras.length).toBeGreaterThan(0);
  });

  it("el gorro de lana lleva estacion invierno; la gorra no está atada a una estación", () => {
    expect(gorros.every((p) => p.estacion === "invierno")).toBe(true);
    expect(gorras.every((p) => !p.estacion)).toBe(true);
  });
});

// Pedido explícito del usuario: "sumá al catálogo... campera de gabardina
// para oficina", en la misma ronda que separó formal/oficina de forma
// estricta (ver el describe de pantalón de vestir más arriba).
describe("catálogo -- campera de gabardina (oficina)", () => {
  const camperasGabardina = CATALOGO_PRENDAS.filter((p) => p.categoria === "campera" && p.textura === "gabardina");

  it("existe al menos una campera de gabardina", () => {
    expect(camperasGabardina.length).toBeGreaterThan(0);
  });

  it("es de oficina, nunca formal -- un sobretodo de gabardina no es una prenda de traje", () => {
    for (const p of camperasGabardina) {
      expect(p.estilo).toBe("oficina");
      expect([p.estilo, ...(p.estilosSecundarios ?? [])]).not.toContain("formal");
    }
  });

  it("es de entretiempo, la contraparte liviana del tapado de paño (lana/invierno)", () => {
    expect(camperasGabardina.every((p) => p.estacion === "entretiempo")).toBe(true);
  });
});
