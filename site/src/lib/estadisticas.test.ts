import { describe, expect, it } from "vitest";
import type { PresetPrenda } from "./catalogo";
import { analizarFoda, coincideBusqueda, compraDeMayorImpacto, contarPorCategoria, contarPorColor, contarPorEstacion, contarPorEstilo } from "./estadisticas";
import type { HSL, Prenda } from "./types";

function mkPrenda(
  categoria: Prenda["categoria"],
  hex: string,
  h: number,
  s: number,
  l: number,
  estilo: Prenda["estilo"] = null,
  estilosSecundarios: Prenda["estilos_secundarios"] = [],
  estacion: Prenda["estacion"] = null,
): Prenda {
  return {
    id: `${hex}-${categoria}-${Math.random()}`,
    user_id: "u1",
    categoria,
    color_hex: hex,
    color_h: h,
    color_s: s,
    color_l: l,
    textura: null,
    estilo,
    estilos_secundarios: estilosSecundarios,
    ocasion: null,
    estacion,
    foto_path: null,
    suela_contraste: false,
    requiere_cuello: false,
    posicion_accesorio: "cintura",
    con_capucha: true,
    patron: "liso",
    color2_hex: null,
    color2_h: null,
    color2_s: null,
    color2_l: null,
    corte_calzado: "zapatilla_urbana",
    calce: "regular",
    cuello: null,
    manga: null,
    necesita_cambio: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

describe("contarPorCategoria", () => {
  it("placard vacío -> las 11 categorías en cero", () => {
    const r = contarPorCategoria([]);
    expect(r).toHaveLength(11);
    expect(r.every((c) => c.cantidad === 0)).toBe(true);
  });

  it("cuenta y ordena de mayor a menor, incluyendo las categorías en cero", () => {
    const placard = [
      mkPrenda("pantalon", "#000000", 0, 0, 10),
      mkPrenda("pantalon", "#000001", 0, 0, 11),
      mkPrenda("remera", "#FFFFFF", 0, 0, 90),
    ];
    const r = contarPorCategoria(placard);
    expect(r[0]).toMatchObject({ categoria: "pantalon", cantidad: 2 });
    expect(r[1]).toMatchObject({ categoria: "remera", cantidad: 1 });
    expect(r.find((c) => c.categoria === "calzado")).toMatchObject({ cantidad: 0 });
  });
});

describe("contarPorEstilo", () => {
  it("prenda sin estilo cargado no cuenta para ningún estilo", () => {
    const r = contarPorEstilo([mkPrenda("remera", "#FFFFFF", 0, 0, 90, null)]);
    expect(r.every((e) => e.cantidad === 0)).toBe(true);
  });

  it("cuenta por estilo y ordena de mayor a menor", () => {
    const placard = [
      mkPrenda("pantalon", "#111111", 0, 0, 15, "formal"),
      mkPrenda("camisa", "#FFFFFF", 0, 0, 95, "formal"),
      mkPrenda("remera", "#0000FF", 220, 80, 50, "casual"),
    ];
    const r = contarPorEstilo(placard);
    expect(r[0]).toMatchObject({ estilo: "formal", cantidad: 2 });
    expect(r.find((e) => e.estilo === "casual")).toMatchObject({ cantidad: 1 });
  });

  it("una prenda con estilo secundario cuenta para los dos registros, no solo el principal", () => {
    const placard = [mkPrenda("sweater", "#C3922E", 40, 62, 47, "clasico", ["casual"])];
    const r = contarPorEstilo(placard);
    expect(r.find((e) => e.estilo === "clasico")).toMatchObject({ cantidad: 1 });
    expect(r.find((e) => e.estilo === "casual")).toMatchObject({ cantidad: 1 });
  });
});

describe("contarPorEstacion", () => {
  it("incluye las 3 estaciones siempre, prenda sin estación cargada no cuenta para ninguna", () => {
    const r = contarPorEstacion([mkPrenda("sweater", "#1A1A1A", 0, 0, 10, "clasico")]);
    expect(r).toHaveLength(3);
    expect(r.every((e) => e.cantidad === 0)).toBe(true);
  });

  it("cuenta por estación", () => {
    const placard = [
      mkPrenda("buzo", "#8C8C8C", 0, 0, 55, "casual", [], "entretiempo"),
      mkPrenda("sweater", "#1A1A1A", 0, 0, 10, "clasico", [], "entretiempo"),
      mkPrenda("campera", "#1A1A1A", 0, 0, 10, "casual", [], "invierno"),
    ];
    const r = contarPorEstacion(placard);
    expect(r.find((e) => e.estacion === "entretiempo")).toMatchObject({ cantidad: 2 });
    expect(r.find((e) => e.estacion === "invierno")).toMatchObject({ cantidad: 1 });
    expect(r.find((e) => e.estacion === "verano")).toMatchObject({ cantidad: 0 });
  });

  it("orden fijo verano -> entretiempo -> invierno, no por cantidad", () => {
    const placard = [mkPrenda("campera", "#1A1A1A", 0, 0, 10, "casual", [], "invierno")];
    const r = contarPorEstacion(placard);
    expect(r.map((e) => e.estacion)).toEqual(["verano", "entretiempo", "invierno"]);
  });
});

describe("contarPorColor", () => {
  it("agrupa por el mismo nombre de color que nombreColor()", () => {
    const placard = [
      mkPrenda("remera", "#000000", 0, 0, 5), // Negro
      mkPrenda("pantalon", "#010101", 0, 0, 6), // Negro también
      mkPrenda("camisa", "#FF0000", 0, 80, 50), // Rojo
    ];
    const r = contarPorColor(placard);
    expect(r[0]).toMatchObject({ nombre: "Negro", cantidad: 2 });
    expect(r[1]).toMatchObject({ nombre: "Rojo", cantidad: 1 });
  });
});

describe("analizarFoda", () => {
  it("placard vacío -> solo una debilidad, sin fortalezas/oportunidades/amenazas", () => {
    const r = analizarFoda([]);
    expect(r.totalPrendas).toBe(0);
    expect(r.fortalezas).toHaveLength(0);
    expect(r.debilidades.length).toBeGreaterThan(0);
    expect(r.oportunidades).toHaveLength(0);
    expect(r.amenazas).toHaveLength(0);
  });

  it("sin ninguna prenda de piernas -> debilidad específica de ancla (interno, no externo)", () => {
    const r = analizarFoda([mkPrenda("remera", "#FFFFFF", 0, 0, 90, "casual")]);
    expect(r.debilidades.some((d) => d.includes("ancla"))).toBe(true);
  });

  it("con bermuda cargado no pide pantalón por separado (comparten el mismo lugar del outfit)", () => {
    const r = analizarFoda([mkPrenda("bermuda", "#111111", 0, 0, 15, "casual")]);
    expect(r.debilidades.some((d) => d.includes("pantalón, bermuda o short"))).toBe(false);
    const categoriasFaltantes = r.debilidades.find((d) => d.startsWith("Categorías sin ninguna prenda"));
    expect(categoriasFaltantes ?? "").not.toContain("pantalon");
  });

  it("3+ prendas del mismo estilo -> fortaleza de ese estilo", () => {
    const placard = [
      mkPrenda("pantalon", "#111111", 0, 0, 15, "formal"),
      mkPrenda("camisa", "#FFFFFF", 0, 0, 95, "formal"),
      mkPrenda("calzado", "#3B2A1E", 25, 40, 20, "formal"),
    ];
    const r = analizarFoda(placard);
    expect(r.fortalezas.some((f) => f.includes("Formal"))).toBe(true);
  });

  it("4+ colores distintos -> fortaleza de variedad", () => {
    const placard = [
      mkPrenda("pantalon", "#000000", 0, 0, 5),
      mkPrenda("remera", "#FFFFFF", 0, 0, 95),
      mkPrenda("camisa", "#FF0000", 0, 80, 50),
      mkPrenda("buzo", "#0000FF", 220, 80, 50),
    ];
    const r = analizarFoda(placard);
    expect(r.variedadColores).toBe(4);
    expect(r.fortalezas.some((f) => f.includes("variedad de colores"))).toBe(true);
  });

  it("1-2 colores con 3+ prendas -> debilidad de poca variedad (interno, no oportunidad)", () => {
    const placard = [
      mkPrenda("pantalon", "#000000", 0, 0, 5),
      mkPrenda("remera", "#010101", 0, 0, 6),
      mkPrenda("buzo", "#020202", 0, 0, 4),
    ];
    const r = analizarFoda(placard);
    expect(r.variedadColores).toBe(1);
    expect(r.debilidades.some((d) => d.includes("Poca variedad"))).toBe(true);
  });

  it("estilo sin ancla pero con catálogo que combina -> oportunidad concreta (externo, sugerencia de compra)", () => {
    // clásico sin ningún pantalón/bermuda/short -- sugerenciaDeAncla real
    // (mismo motor que "Vestite hoy") tiene que encontrar algo del
    // catálogo para sugerir.
    const r = analizarFoda([mkPrenda("camisa", "#FFFFFF", 0, 0, 95, "clasico")]);
    expect(r.oportunidades.length).toBeGreaterThan(0);
  });

  it("un solo pantalón de un estilo -> amenaza de ancla única", () => {
    const r = analizarFoda([
      mkPrenda("pantalon", "#111111", 0, 0, 15, "formal"),
      mkPrenda("camisa", "#FFFFFF", 0, 0, 95, "formal"),
    ]);
    expect(r.amenazas.some((a) => a.includes("una sola prenda de piernas") && a.includes("Formal"))).toBe(true);
  });

  it("dos pantalones del mismo estilo -> sin amenaza de ancla única para ese estilo", () => {
    const r = analizarFoda([
      mkPrenda("pantalon", "#111111", 0, 0, 15, "formal"),
      mkPrenda("pantalon", "#222222", 0, 0, 20, "formal"),
    ]);
    expect(r.amenazas.some((a) => a.includes("Formal") && a.includes("una sola prenda"))).toBe(false);
  });

  it("hay abrigos pero ninguno de invierno -> amenaza real (motivada por el trabajo de entretiempo/invierno)", () => {
    const entretiempo = mkPrenda("sweater", "#8C8C8C", 0, 0, 55, "clasico", [], "entretiempo");
    const r = analizarFoda([entretiempo]);
    expect(r.amenazas.some((a) => a.includes("invierno"))).toBe(true);
  });

  it("hay un abrigo de invierno cargado -> sin esa amenaza", () => {
    const invierno = mkPrenda("sweater", "#1A1A1A", 0, 0, 10, "clasico", [], "invierno");
    const r = analizarFoda([invierno]);
    expect(r.amenazas.some((a) => a.includes("invierno"))).toBe(false);
  });

  it("sin ningún abrigo cargado, no duplica la amenaza (ya la cubre la debilidad de categoría ausente)", () => {
    const r = analizarFoda([mkPrenda("remera", "#FFFFFF", 0, 0, 90, "casual")]);
    expect(r.amenazas.some((a) => a.includes("invierno"))).toBe(false);
  });

  it("un color concentra la mitad o más del placard (4+) -> amenaza de concentración", () => {
    const placard = [
      mkPrenda("pantalon", "#1A1A1A", 0, 0, 10),
      mkPrenda("remera", "#1A1A1A", 0, 0, 10),
      mkPrenda("buzo", "#1A1A1A", 0, 0, 10),
      mkPrenda("camisa", "#FFFFFF", 0, 0, 95),
    ];
    const r = analizarFoda(placard);
    expect(r.amenazas.some((a) => a.includes("concentra"))).toBe(true);
  });
});

// Pedido explícito del usuario: "mejora el diagnóstico FODA... actuá como
// gerente con una maestría... informe resumido, visual y ejecutivo" --
// veredicto/nivelSalud (la síntesis de una línea) y estrategias (la matriz
// TOWS cruzada) son la mejora real de contenido de esta ronda.
describe("analizarFoda -- veredicto y nivelSalud", () => {
  it("placard vacío -> con_huecos, con un veredicto que avisa que no hay diagnóstico posible", () => {
    const r = analizarFoda([]);
    expect(r.nivelSalud).toBe("con_huecos");
    expect(r.veredicto.toLowerCase()).toContain("no hay diagnóstico posible");
    expect(r.estrategias).toHaveLength(0);
  });

  it("0 debilidades y 0 amenazas -> sólido, sin importar cuántas fortalezas haya", () => {
    // placard deliberadamente completo: las 11 categorías presentes (así
    // categoriasAusentes queda vacío), ninguna prenda con estilo cargado
    // (así "sin ninguna prenda de estilo X" no dispara -- ver el comentario
    // de analizarFoda: esa debilidad exige sinCarga.length < ESTILOS.length,
    // y con CERO prendas tageadas por estilo, sinCarga === ESTILOS.length),
    // 11 colores distintos (evita tanto "poca variedad" como "concentración
    // de color") y el sweater tageado "invierno" (evita esa amenaza).
    const categorias: Prenda["categoria"][] = [
      "pantalon",
      "bermuda",
      "short_deportivo",
      "remera",
      "buzo",
      "sweater",
      "camisa",
      "calzado",
      "campera",
      "saco",
      "accesorio",
    ];
    const placard = categorias.map((categoria, i) =>
      mkPrenda(categoria, `#${(i + 1).toString(16).padStart(6, "0")}`, i * 30, 40, 10 + i * 5, null, [], categoria === "sweater" ? "invierno" : null),
    );
    const r = analizarFoda(placard);
    expect(r.debilidades).toHaveLength(0);
    expect(r.amenazas).toHaveLength(0);
    expect(r.nivelSalud).toBe("solido");
    expect(r.veredicto.toLowerCase()).toContain("sólido");
  });

  it("3+ debilidades -> frágil (mismo placard que ya prueba 'sin ninguna prenda de piernas', con estilo casual)", () => {
    const r = analizarFoda([mkPrenda("remera", "#FFFFFF", 0, 0, 90, "casual")]);
    expect(r.debilidades.length).toBeGreaterThanOrEqual(3);
    expect(r.nivelSalud).toBe("fragil");
    expect(r.veredicto.toLowerCase()).toContain("frágil");
  });

  it("con huecos puntuales pero por debajo del piso de frágil -> con_huecos (mismo placard que ya prueba el caso de bermuda)", () => {
    const r = analizarFoda([mkPrenda("bermuda", "#111111", 0, 0, 15, "casual")]);
    expect(r.debilidades.length).toBeGreaterThan(0);
    expect(r.debilidades.length).toBeLessThan(3);
    expect(r.amenazas.length).toBeLessThan(2);
    expect(r.nivelSalud).toBe("con_huecos");
  });
});

describe("analizarFoda -- estrategias cruzadas (matriz TOWS)", () => {
  it("sin fortalezas/oportunidades/amenazas (placard vacío) -> sin ninguna estrategia cruzada", () => {
    expect(analizarFoda([]).estrategias).toHaveLength(0);
  });

  it("con contenido real en los 4 cuadrantes -> los 4 cruces (FO/DO/FA/DA), cada uno con su título TOWS", () => {
    // 3 pantalones formales del mismo color (fortaleza de piernas +
    // fortaleza de estilo formal) + 1 camisa clásica de otro color (para
    // que el color domine >=50% del placard -- amenaza de concentración).
    // Estilos urbano/casual/deportivo sin ancla -> oportunidades reales vía
    // sugerenciaDeAncla. Solo remera/buzo/etc. ausentes -> debilidad de
    // categorías + de variedad de color (2 colores en 4 prendas).
    const placard = [
      mkPrenda("pantalon", "#111111", 0, 0, 15, "formal"),
      mkPrenda("pantalon", "#111111", 0, 0, 15, "formal"),
      mkPrenda("pantalon", "#111111", 0, 0, 15, "formal"),
      mkPrenda("camisa", "#FFFFFF", 0, 0, 95, "clasico"),
    ];
    const r = analizarFoda(placard);
    expect(r.fortalezas.length).toBeGreaterThan(0);
    expect(r.debilidades.length).toBeGreaterThan(0);
    expect(r.oportunidades.length).toBeGreaterThan(0);
    expect(r.amenazas.length).toBeGreaterThan(0);

    expect(r.estrategias).toHaveLength(4);
    const porTipo = Object.fromEntries(r.estrategias.map((e) => [e.tipo, e]));
    expect(porTipo.FO.titulo).toBe("Explotar");
    expect(porTipo.DO.titulo).toBe("Reforzar");
    expect(porTipo.FA.titulo).toBe("Proteger");
    expect(porTipo.DA.titulo).toBe("Prioridad");
    for (const e of r.estrategias) expect(e.texto.length).toBeGreaterThan(0);

    // la debilidad de "categorías ausentes" de este placard es larga (7
    // categorías listadas) -- prueba real de que resumir() trunca en vez de
    // citar la oración entera dentro de la estrategia DO.
    expect(r.debilidades[0].length).toBeGreaterThan(70);
    expect(porTipo.DO.texto).toContain("…");
  });

  it("un solo cuadrante externo vacío (sin amenazas) -> FO/DO presentes, FA/DA ausentes", () => {
    const placard = [
      mkPrenda("pantalon", "#111111", 0, 0, 15, "formal"),
      mkPrenda("pantalon", "#222222", 0, 0, 20, "formal"),
      mkPrenda("pantalon", "#333333", 0, 0, 25, "formal"),
    ];
    const r = analizarFoda(placard);
    expect(r.amenazas).toHaveLength(0);
    const tipos = r.estrategias.map((e) => e.tipo);
    expect(tipos).toContain("FO");
    expect(tipos).toContain("DO");
    expect(tipos).not.toContain("FA");
    expect(tipos).not.toContain("DA");
  });
});

// Consejo, auditoría de exigencia -- pedido explícito del usuario: "mejora
// el algoritmo de recomendación de compra en cada estilo del outfit y tmb
// incluí una recomendación de compra general que surja del FODA y de los
// outfits en estadísticas. Actuá en múltiples roles: asesor de imagen,
// sastre, experto en moda, en colores, en prendas, gerente ejecutivo."
describe("compraDeMayorImpacto", () => {
  it("severidad gana sobre variedad: sin ancla en un estilo le gana a poca variedad en otro, sea cual sea el orden de ESTILOS", () => {
    // catálogo chico a propósito (mismo patrón que sugerenciaDeAncla en
    // recommend.test.ts): solo lo justo para que "formal" y "casual" sean
    // los dos únicos estilos con algo que ofrecer -- oficina/clasico/urbano/
    // deportivo no tienen ningún pantalón de su estilo en este catálogo, así
    // que huecoDeEstilo da null para los cuatro (sin ambigüedad sobre cuál
    // gana).
    const catalogoChico: (PresetPrenda & { hsl: HSL })[] = [
      { id: "pantalon-formal", nombre: "Pantalón formal", categoria: "pantalon", colorHex: "#1A1A1A", estilo: "formal", hsl: { h: 0, s: 0, l: 10 } },
      { id: "remera-casual", nombre: "Remera casual", categoria: "remera", colorHex: "#FFFFFF", estilo: "casual", hsl: { h: 0, s: 0, l: 95 } },
    ];
    // "casual" ya tiene ancla -- sin hueco de tier 0 -- pero una sola prenda
    // de torso, así que sugerenciaDeVariedad dispara (tier 5). "formal" no
    // tiene NINGÚN pantalón (tier 0, el bloqueo total).
    const pantalonCasual = mkPrenda("pantalon", "#1A1A1A", 0, 0, 10, "casual");
    const remeraCasual = mkPrenda("remera", "#8C8C8C", 0, 0, 55, "casual");
    const zapato1 = mkPrenda("calzado", "#1A1A1A", 0, 0, 10, "casual");
    const zapato2 = mkPrenda("calzado", "#FFFFFF", 0, 0, 95, "casual");
    const placard = [pantalonCasual, remeraCasual, zapato1, zapato2];

    const r = compraDeMayorImpacto(placard, catalogoChico);
    expect(r).not.toBeNull();
    expect(r!.estilo).toBe("formal");
    expect(r!.sugerida.id).toBe("pantalon-formal");
  });

  it("la misma prenda del catálogo resuelve el hueco de más de un estilo a la vez -> el mensaje lo nombra explícitamente", () => {
    // un solo chino, clasico+casual -- evaluado de forma independiente para
    // cada estilo (huecoDeEstilo no comparte ningún estado entre llamadas),
    // el catálogo elige exactamente ESTA MISMA prenda para los dos porque es
    // la única candidata en ambos casos. Ningún otro estilo tiene ningún
    // pantalón en este catálogo, así que no compite ninguna otra sugerencia.
    const catalogoVersatil: (PresetPrenda & { hsl: HSL })[] = [
      {
        id: "chino-versatil",
        nombre: "Pantalón chino",
        categoria: "pantalon",
        colorHex: "#D8C7A1",
        estilo: "clasico",
        estilosSecundarios: ["casual"],
        hsl: { h: 41, s: 41, l: 74 },
      },
    ];
    const r = compraDeMayorImpacto([], catalogoVersatil);
    expect(r).not.toBeNull();
    expect(r!.sugerida.id).toBe("chino-versatil");
    expect(r!.mensaje).toContain("también te resuelve un hueco en Casual");
  });

  it("sin ningún hueco real en ningún estilo (catálogo vacío) -> null, no inventa una recomendación", () => {
    expect(compraDeMayorImpacto([], [])).toBeNull();
  });

  it("analizarFoda expone la misma recomendación como compraPrioritaria, consistente con sus propias oportunidades", () => {
    const r = analizarFoda([mkPrenda("camisa", "#FFFFFF", 0, 0, 95, "clasico")]);
    expect(r.compraPrioritaria).not.toBeNull();
    // la compra prioritaria tiene que ser, literalmente, una de las
    // oportunidades ya listadas -- nunca un texto distinto calculado aparte.
    expect(r.oportunidades).toContain(r.compraPrioritaria!.mensaje.split(" Esta misma compra")[0]);
  });

  it("placard vacío del todo -> analizarFoda no propone compraPrioritaria (sin diagnóstico posible)", () => {
    expect(analizarFoda([]).compraPrioritaria).toBeNull();
  });
});

describe("coincideBusqueda", () => {
  it("query vacía o solo espacios -> matchea todo", () => {
    const p = mkPrenda("pantalon", "#111111", 0, 0, 15, "formal");
    expect(coincideBusqueda(p, "")).toBe(true);
    expect(coincideBusqueda(p, "   ")).toBe(true);
  });

  it("matchea por categoría", () => {
    const p = mkPrenda("pantalon", "#111111", 0, 0, 15, "formal");
    expect(coincideBusqueda(p, "pantalon")).toBe(true);
    expect(coincideBusqueda(p, "Pantalon")).toBe(true);
    expect(coincideBusqueda(p, "remera")).toBe(false);
  });

  // Bug real encontrado en la ronda de nombres específicos: al corregir
  // CATEGORIA_LABEL.pantalon (le faltaba la tilde) salió a la luz que este
  // buscador nunca tuvo el acento-insensible que su propio comentario ya
  // prometía -- comparaba con `.includes()` puro, así que buscar sin
  // tilde ("pantalon") dejaba de encontrar "Pantalón" apenas la categoría
  // empezó a escribirse bien. Se prueban las dos direcciones: buscar sin
  // tilde sobre texto con tilde, y buscar CON tilde sobre un texto que la
  // tenga -- las dos tienen que matchear igual, mayúsculas incluidas.
  it("es acento-insensible: buscar sin tilde encuentra texto con tilde y viceversa", () => {
    const p = mkPrenda("pantalon", "#1A1A1A", 0, 0, 10, "formal");
    p.textura = "lana"; // descripcionPrenda -> "Pantalón de vestir"
    expect(coincideBusqueda(p, "vestir")).toBe(true);
    expect(coincideBusqueda(p, "pantalon")).toBe(true); // sin tilde
    expect(coincideBusqueda(p, "pantalón")).toBe(true); // con tilde
    expect(coincideBusqueda(p, "PANTALÓN")).toBe(true); // con tilde y mayúsculas
  });

  it("matchea por color (substring, sin importar mayúsculas)", () => {
    const p = mkPrenda("remera", "#000000", 0, 0, 5);
    expect(coincideBusqueda(p, "negro")).toBe(true);
    expect(coincideBusqueda(p, "NEGRO")).toBe(true);
  });

  it("matchea por estilo, y no matchea si la prenda no tiene estilo cargado", () => {
    const conEstilo = mkPrenda("camisa", "#FFFFFF", 0, 0, 95, "formal");
    const sinEstilo = mkPrenda("camisa", "#FFFFFF", 0, 0, 95, null);
    expect(coincideBusqueda(conEstilo, "formal")).toBe(true);
    expect(coincideBusqueda(sinEstilo, "formal")).toBe(false);
  });

  it("matchea también por un estilo secundario, no solo el principal", () => {
    const p = mkPrenda("sweater", "#C3922E", 40, 62, 47, "clasico", ["casual"]);
    expect(coincideBusqueda(p, "casual")).toBe(true);
    expect(coincideBusqueda(p, "clásico")).toBe(true);
  });

  it("matchea por estación, y no matchea si la prenda no tiene estación cargada", () => {
    const conEstacion = mkPrenda("campera", "#1A1A1A", 0, 0, 10, "casual", [], "invierno");
    const sinEstacion = mkPrenda("campera", "#1A1A1A", 0, 0, 10, "casual");
    expect(coincideBusqueda(conEstacion, "invierno")).toBe(true);
    expect(coincideBusqueda(sinEstacion, "invierno")).toBe(false);
  });

  // Pedido explícito del usuario, mismo reporte que motivó descripcionPrenda
  // en types.ts: las cards ahora muestran "Jean" en vez de "pantalon" --
  // buscar "jean" tiene que encontrarlo, no solo "pantalon".
  it("matchea por el nombre específico (descripcionPrenda), no solo por la categoría genérica", () => {
    const jean = mkPrenda("pantalon", "#3B5998", 220, 40, 40, "casual");
    jean.textura = "denim";
    expect(coincideBusqueda(jean, "jean")).toBe(true);
    expect(coincideBusqueda(jean, "pantalon")).toBe(true);
  });
});
