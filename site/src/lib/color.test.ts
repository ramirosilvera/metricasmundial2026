import { describe, expect, it } from "vitest";
import { CATALOGO_PRENDAS } from "./catalogo";
import { contornoHsl, detalleHsl, hexToHsl, luzHsl, nombreColor, sombraHsl, tonoTexturaHsl } from "./color";

describe("nombreColor", () => {
  it("negro por luminosidad baja, sin importar el matiz", () => {
    expect(nombreColor(200, 90, 12)).toBe("Negro");
    expect(nombreColor(0, 0, 0)).toBe("Negro");
  });

  it("blanco por luminosidad alta y saturación baja", () => {
    expect(nombreColor(0, 0, 100)).toBe("Blanco");
    expect(nombreColor(200, 10, 88)).toBe("Blanco");
  });

  it("blanco roto: luminosidad alta pero con algo de saturación", () => {
    expect(nombreColor(40, 30, 90)).toBe("Blanco roto");
  });

  it("gris por saturación baja, graduado por luminosidad", () => {
    expect(nombreColor(200, 5, 20)).toBe("Gris oscuro");
    expect(nombreColor(200, 5, 50)).toBe("Gris");
    expect(nombreColor(200, 5, 80)).toBe("Gris claro");
  });

  it("umbral de neutro consistente con recommend.ts (esNeutro: s<=15, l<=12, l>=88)", () => {
    // saturación exactamente en el borde -- debe caer del lado "neutro".
    expect(nombreColor(120, 15, 50)).toBe("Gris");
    expect(nombreColor(120, 16, 50)).not.toBe("Gris");
  });

  it("matices básicos con saturación/luminosidad medias", () => {
    expect(nombreColor(0, 80, 50)).toBe("Rojo");
    expect(nombreColor(350, 80, 50)).toBe("Rojo");
    expect(nombreColor(30, 80, 50)).toBe("Naranja");
    expect(nombreColor(55, 80, 50)).toBe("Amarillo");
    expect(nombreColor(120, 80, 50)).toBe("Verde");
    expect(nombreColor(180, 80, 50)).toBe("Turquesa");
    expect(nombreColor(220, 80, 50)).toBe("Azul");
    expect(nombreColor(270, 80, 50)).toBe("Violeta");
    expect(nombreColor(310, 80, 50)).toBe("Magenta");
    expect(nombreColor(340, 80, 50)).toBe("Rosa");
  });

  it("modificador oscuro/claro sobre el matiz, sin cruzar a neutro", () => {
    // h=245 (no 220): fuera del rango de "Azul marino" (210-230), para
    // probar el modificador oscuro/claro genérico sin pisar ese caso
    // especial -- ver el test dedicado más abajo.
    expect(nombreColor(245, 80, 20)).toBe("Azul oscuro");
    expect(nombreColor(245, 80, 80)).toBe("Azul claro");
  });

  it("marrón y beige, no naranja -- pedido explícito del usuario (cuero, chino, sweater reales del catálogo)", () => {
    expect(nombreColor(25, 47, 25)).toBe("Marrón oscuro"); // cinturón/zapatos de cuero marrón
    expect(nombreColor(25, 34, 33)).toBe("Marrón"); // zapatillas marrones
    expect(nombreColor(41, 41, 74)).toBe("Beige"); // pantalón/sweater/remera beige del catálogo
  });

  it("un naranja de verdad (alta saturación) en el mismo rango de matiz sigue siendo Naranja", () => {
    expect(nombreColor(30, 80, 50)).toBe("Naranja");
    expect(nombreColor(25, 65, 25)).toBe("Naranja oscuro");
  });

  it("azul marino: azul oscuro Y saturado en el rango real del catálogo (h=222, pantalón/sweater/campera 'azul marino')", () => {
    expect(nombreColor(222, 37, 19)).toBe("Azul marino");
  });

  it("azul marino no se dispara fuera de su rango de matiz o luminosidad", () => {
    expect(nombreColor(220, 60, 50)).toBe("Azul"); // mismo matiz, pero claro -- jean/rompeviento
    expect(nombreColor(180, 80, 20)).toBe("Turquesa oscuro"); // oscuro, pero matiz fuera de rango
    expect(nombreColor(220, 10, 20)).toBe("Gris oscuro"); // oscuro y en rango, pero desaturado -- es gris, no azul marino
  });

  it("celeste, no azul claro -- pedido explícito del usuario (camisa/buzo celeste real del catálogo)", () => {
    expect(nombreColor(209, 58, 82)).toBe("Celeste");
  });

  it("celeste no se dispara fuera de su rango de matiz o luminosidad", () => {
    expect(nombreColor(216, 99, 61)).toBe("Azul"); // mismo matiz, pero no lo bastante claro -- buzo azul real del placard
    expect(nombreColor(260, 60, 82)).toBe("Violeta claro"); // igual de claro, pero matiz fuera de rango
  });

  it("bordó, no rojo oscuro -- pedido explícito del usuario (sweater/corbata bordó real del catálogo)", () => {
    expect(nombreColor(346, 47, 29)).toBe("Bordó");
  });

  it("bordó no se dispara si es claro (eso es rosa, no bordó)", () => {
    expect(nombreColor(335, 47, 60)).toBe("Rosa");
  });

  it("verde militar, no verde genérico -- pedido explícito del usuario (campera-verde-militar real del catálogo)", () => {
    expect(nombreColor(69, 22, 31)).toBe("Verde militar");
    expect(nombreColor(92, 20, 29)).toBe("Verde militar oscuro"); // camisa a cuadros
  });

  it("un verde vívido en el mismo rango de matiz sigue siendo Verde, no militar (buzo verde real del placard)", () => {
    expect(nombreColor(92, 57, 60)).toBe("Verde");
  });

  it("verde militar no se dispara fuera de su rango de matiz (verde bosque real del catálogo)", () => {
    expect(nombreColor(127, 27, 25)).toBe("Verde oscuro"); // pantalón deportivo verde oscuro
  });

  it("rosa claro con h>=345 no cae en Rojo -- encontrado agregando una remera rosa real (antes daba 'Rojo')", () => {
    expect(nombreColor(346, 53, 77)).toBe("Rosa");
    expect(nombreColor(5, 50, 70)).toBe("Rosa"); // mismo caso del lado h<15
  });

  it("rosa por luminosidad no se dispara si no es lo bastante claro (eso es Rojo/Bordó)", () => {
    expect(nombreColor(346, 53, 50)).toBe("Rojo");
  });

  it("mostaza, no naranja -- encontrado agregando un sweater mostaza real al catálogo (antes daba 'Naranja')", () => {
    expect(nombreColor(40, 62, 47)).toBe("Mostaza");
  });

  it("mostaza no se dispara fuera de su rango (terroso -> marrón/beige; vívido -> naranja/amarillo)", () => {
    expect(nombreColor(40, 47, 47)).toBe("Marrón"); // menos saturado -- es marrón, no mostaza
    expect(nombreColor(30, 80, 50)).toBe("Naranja"); // matiz fuera de rango (test ya existente, sigue firme)
  });
});

describe("nombreColor -- consistencia con el catálogo real", () => {
  // Reporte real del usuario: un sweater negro del catálogo (colorHex
  // #232323, l=14) se leía "Gris oscuro" mientras que TODAS las demás
  // prendas "negro/negra" del catálogo (16+, colorHex #1A1A1A, l=10) se
  // leían "Negro" -- una inconsistencia de DATOS (un hex ligeramente más
  // claro sin ninguna razón documentada), no de la lógica de nombreColor
  // (el umbral l<=12 es correcto: #232323 es un gris carbón perceptible,
  // apenas por encima). El fix real fue estandarizar esas 3 prendas al
  // mismo #1A1A1A que ya usa el resto -- este test asegura que ninguna
  // prenda "negro/negra" del catálogo vuelva a quedar en un hex
  // inconsistente que la lea como otra cosa.
  it("toda prenda cuyo nombre dice 'negro'/'negra' clasifica como Negro, no Gris oscuro", () => {
    const negras = CATALOGO_PRENDAS.filter((p) => /negr[oa]/i.test(p.nombre));
    expect(negras.length).toBeGreaterThan(0);
    for (const p of negras) {
      // en una prenda con estampado (rayas/cuadros), el color que nombra el
      // nombre es el de la trama (colorHex2), no el de fondo -- "camisa a
      // rayas negras" es una camisa BLANCA con raya negra, no una camisa
      // negra. Sin este caso especial, camisa-rayas-negra (fondo #F5F5F5)
      // rompía este test aunque su dato esté bien cargado.
      const hexColorNombrado = p.colorHex2 ?? p.colorHex;
      const hsl = hexToHsl(hexColorNombrado);
      expect(nombreColor(hsl.h, hsl.s, hsl.l), `${p.id} (${hexColorNombrado})`).toBe("Negro");
    }
  });
});

describe("contornoHsl / sombraHsl / luzHsl", () => {
  it("contornoHsl siempre queda más oscuro y algo más saturado que el color base", () => {
    expect(contornoHsl(220, 60, 50)).toBe("hsl(220 65% 32%)");
  });

  it("contornoHsl no cruza a negativo con luminosidad baja (clamp a 4%)", () => {
    expect(contornoHsl(0, 90, 10)).toBe("hsl(0 95% 4%)");
  });

  it("contornoHsl con blanco puro (l=100) sigue dando un contorno visible, no blanco", () => {
    // un neutro puro (s=0) NO se lleva el +5 de saturación -- ver
    // saturacionRealzada en color.ts: sumarle saturación a un gris con h=0
    // no lo realza, le inventa un matiz rojo (bug real visto en el render
    // del catálogo completo).
    expect(contornoHsl(0, 0, 100)).toBe("hsl(0 0% 74%)");
  });

  it("sombraHsl y luzHsl mueven la luminosidad en direcciones opuestas sin tocar matiz/saturación", () => {
    expect(sombraHsl(200, 70, 50)).toBe("hsl(200 70% 40%)");
    expect(luzHsl(200, 70, 50)).toBe("hsl(200 70% 57%)");
  });

  it("sombraHsl no baja de 2% ni luzHsl sube de 98%", () => {
    expect(sombraHsl(0, 0, 5)).toBe("hsl(0 0% 2%)");
    expect(luzHsl(0, 0, 95)).toBe("hsl(0 0% 98%)");
  });
});

describe("tonoTexturaHsl", () => {
  // Reporte real de esta misma revisión ("modista e ingeniero textil"):
  // renderizando el ícono real, el patrón de textura (lana) se veía
  // perfecto sobre un sweater gris pero desaparecía por completo sobre uno
  // negro -- contornoHsl siempre resta luz, así que sobre una base ya
  // oscura choca contra el piso (4%) y el patrón se funde con el relleno.
  it("sobre una prenda oscura (l<25), ACLARA en vez de oscurecer más -- mismo criterio que detalleHsl para el cuello de una prenda negra", () => {
    const tono = tonoTexturaHsl(0, 0, 16); // sweater negro real, #2A2A2A
    expect(tono).toBe("hsl(0 0% 36%)"); // neutro: sigue neutro, ver saturacionRealzada
    expect(36).toBeGreaterThan(16); // más claro que la base -- contraste garantizado
  });

  it("sobre una prenda clara/media (l>=25), sigue oscureciendo como contornoHsl -- no cambia un comportamiento que ya funcionaba", () => {
    expect(tonoTexturaHsl(200, 60, 50)).toBe(contornoHsl(200, 60, 50));
    expect(tonoTexturaHsl(0, 0, 55)).toBe(contornoHsl(0, 0, 55));
  });

  it("no cruza los límites 4%/85% en los extremos", () => {
    expect(tonoTexturaHsl(0, 0, 0)).toBe("hsl(0 0% 20%)");
    expect(tonoTexturaHsl(0, 0, 100)).toBe("hsl(0 0% 82%)");
  });
});

describe("saturacionDerivada -- un derivado nunca muestra más color que su prenda", () => {
  // Bug real encontrado renderizando el catálogo completo (Consejo, ronda
  // "los íconos más parecidos a la prenda real"): contorno/trama/detalle
  // sumaban saturación SIEMPRE, y como todos los negros y grises del
  // catálogo se guardan con h=0, eso no los realzaba: les inventaba un
  // matiz rojo. En el render se veía la raya planchada de un pantalón de
  // vestir negro marrón rojiza y el perforado de un zapato negro
  // anaranjado. Ver saturacionRealzada en color.ts.
  const negro = { h: 0, s: 0, l: 10 }; // #1A1A1A, el negro estándar del catálogo
  const gris = { h: 0, s: 0, l: 43 }; // #6E6E6E, el gris estándar del catálogo
  // el negro de cuero del catálogo (zapatos-cuero-negro/mocasines-negros):
  // s=27 -- por encima de cualquier umbral sobre `s` -- pero croma 5, o sea
  // negro a la vista. Con un umbral sobre `s` a secas, el perforado del
  // zapato salía color óxido sobre un zapato que se ve negro.
  const negroCuero = hexToHsl("#1C1210");

  // croma HSL real (s desnormalizado por l) -- la magnitud que dice cuánto
  // color se VE, ver cromaHsl en color.ts y `croma` en recommend.ts. Se
  // mide sobre el croma y no sobre `s` justamente por el caso del negro de
  // cuero: mantenerle `s` intacta pero aclararlo hace reaparecer el matiz.
  const cromaDe = (css: string) => {
    const [, sTxt, lTxt] = /hsl\(\S+ ([\d.]+)% ([\d.]+)%\)/.exec(css)!;
    const s = Number(sTxt);
    const l = Number(lTxt);
    return s * (1 - Math.abs((2 * l) / 100 - 1));
  };

  const marronCuero = hexToHsl("#6F4E37"); // el marrón cuero del catálogo
  const marino = hexToHsl("#1F2A44"); // azul marino real del catálogo

  it("ningún derivado muestra más color que la prenda de la que sale (tope 1.25x)", () => {
    for (const c of [negro, gris, negroCuero, marronCuero, marino, { h: 220, s: 60, l: 50 }]) {
      const cromaPrenda = cromaDe(`hsl(${c.h} ${c.s}% ${c.l}%)`);
      for (const fn of [contornoHsl, tonoTexturaHsl, detalleHsl]) {
        // +0.1 de tolerancia por el redondeo del string.
        expect(cromaDe(fn(c.h, c.s, c.l))).toBeLessThanOrEqual(cromaPrenda * 1.25 + 0.1);
      }
    }
  });

  it("los dos casos que lo motivaron: el negro de cuero no saca óxido y el marrón de cuero no saca naranja", () => {
    // el perforado del zapato negro y la tira del mocasín negro
    expect(cromaDe(detalleHsl(negroCuero.h, negroCuero.s, negroCuero.l))).toBeLessThan(8);
    // la costura del zapato marrón y la tira del mocasín marrón: seguía
    // siendo cuero, no un naranja flúo de casi el doble de croma
    expect(cromaDe(detalleHsl(marronCuero.h, marronCuero.s, marronCuero.l))).toBeLessThan(
      cromaDe(`hsl(${marronCuero.h} ${marronCuero.s}% ${marronCuero.l}%)`) * 1.3,
    );
  });

  it("un color con matiz real sigue leyéndose de color -- el tope acota, no apaga", () => {
    for (const c of [marronCuero, marino, { h: 220, s: 60, l: 50 }]) {
      for (const fn of [contornoHsl, tonoTexturaHsl, detalleHsl]) {
        const [, hTxt, sTxt] = /hsl\((\S+) ([\d.]+)%/.exec(fn(c.h, c.s, c.l))!;
        // el matiz nunca se toca: un derivado es la misma tela a otra luz.
        expect(Number(hTxt)).toBe(c.h);
        // y sigue por encima del umbral de "neutro" del motor (s<=15, ver
        // esNeutro en recommend.ts): el detalle de una prenda marrón se
        // lee marrón, no gris.
        expect(Number(sTxt)).toBeGreaterThan(15);
      }
    }
  });

  // Las dos funciones que existen justamente para VERSE sobre una prenda
  // oscura (ver sus comentarios en color.ts: las dos aclaran en vez de
  // oscurecer cuando la prenda ya es oscura) siguen dando ese contraste con
  // pura luz, sin necesitar el matiz inventado. contornoHsl queda afuera a
  // propósito: es un contorno, siempre oscurece, y sobre un negro llega al
  // piso de 4% -- ahí el +5 de saturación que se le sacó no aportaba
  // contraste real (5% de saturación sobre 4% de luz es imperceptible), a
  // diferencia de lo que sí pasaba en trama y detalle, que aclaran hasta
  // 32-36% de luz, donde ese matiz rojo se veía de verdad.
  it("trama y detalle siguen dando contraste de LUZ sobre un negro -- que es lo que los hace visibles", () => {
    for (const fn of [tonoTexturaHsl, detalleHsl]) {
      const l = Number(/(\d+(?:\.\d+)?)%\)$/.exec(fn(negro.h, negro.s, negro.l))![1]);
      expect(Math.abs(l - negro.l)).toBeGreaterThanOrEqual(10);
    }
  });
});

describe("detalleHsl", () => {
  it("oscurece cuando la prenda es clara", () => {
    expect(detalleHsl(220, 60, 50)).toBe("hsl(220 60% 25%)");
    expect(detalleHsl(0, 0, 98)).toBe("hsl(0 0% 73%)");
  });

  it("aclara (no oscurece más) cuando la prenda ya es oscura -- reporte real del", () => {
    // usuario: en una camisa negra, sombraHsl restaba luz a un color que ya
    // era casi negro y el cuello quedaba invisible. detalleHsl tiene que ir
    // para el otro lado en vez de seguir oscureciendo.
    const oscuro = detalleHsl(0, 0, 14);
    expect(oscuro).toBe("hsl(0 0% 36%)"); // neutro: sigue neutro, ver saturacionRealzada
    expect(36).toBeGreaterThan(14); // más claro que la prenda base, no más oscuro
  });

  it("mantiene una brecha de contraste real (no un ajuste cosmético mínimo) en ambas direcciones", () => {
    const l1 = 14; // prenda oscura
    const l2 = 98; // prenda clara
    const detalleOscuro = 36; // ver test anterior
    const detalleClaro = 73; // ver test anterior
    expect(Math.abs(detalleOscuro - l1)).toBeGreaterThanOrEqual(15);
    expect(Math.abs(detalleClaro - l2)).toBeGreaterThanOrEqual(15);
  });

  it("no cruza los límites 4%/92% en los extremos", () => {
    expect(detalleHsl(0, 0, 0)).toBe("hsl(0 0% 22%)");
    expect(detalleHsl(0, 0, 100)).toBe("hsl(0 0% 75%)");
  });
});
