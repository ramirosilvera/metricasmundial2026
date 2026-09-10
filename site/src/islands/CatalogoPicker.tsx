import { useMemo, useState } from "react";
import { CATALOGO_PRENDAS, type PresetPrenda } from "../lib/catalogo";
import type { Estilo } from "../lib/types";
import PrendaIcon from "./PrendaIcon";

/** Mismo orden que FORMALIDAD_ESTILO en recommend.ts (de más a menos
 *  formal) -- pedido explícito del usuario: "que quede claramente
 *  diferenciado ropa de oficina, urbana, clásica, etc." en el catálogo, no
 *  solo en la lógica de combinación.
 *
 *  Bug real encontrado (Consejo, ronda siguiente), reportado por el
 *  usuario: "no veo las zapatillas de cuero en el catálogo". Esta lista se
 *  armó cuando "oficina" todavía no tenía NINGUNA prenda con ESE estilo
 *  como principal (por eso el título original decía "Formal (oficina)",
 *  tratando oficina como una aclaración de formal, no como su propia
 *  sección) -- pero varias rondas después ya hay 9 prendas reales con
 *  estilo="oficina" (pantalón/campera de gabardina, y ahora las 2
 *  zapatillas de cuero). `grupos` (más abajo) SÍ las agrupa bajo la key
 *  "oficina" -- el bug no es de filtrado, es de RENDER: el `.map` de
 *  SECCIONES nunca iteraba esa key porque no estaba en esta lista, y la
 *  sección "Otros" tampoco la agarra (esa es solo para `p.estilo` nulo,
 *  key literal "otros"). Resultado: 9 prendas cargadas en el catálogo,
 *  invisibles en el picker sin ningún error visible. Todos los demás
 *  enumerados de Estilo del código (ESTILOS/ESTILOS_FILTRO en
 *  PrendaForm/Outfits/Placard/Recomendaciones/estadisticas.ts) sí incluían
 *  "oficina" -- confirmado por grep, este archivo era el único desactualizado.
 *  Se agrega la sección propia "Oficina" (mismo lugar que esos otros
 *  archivos: justo después de "formal") y se revierte el título de
 *  "Formal" a secas -- ya no hace falta la aclaración "(oficina)" ahora
 *  que oficina tiene su propia sección real. */
const SECCIONES: { estilo: Estilo; titulo: string }[] = [
  { estilo: "formal", titulo: "Formal" },
  { estilo: "oficina", titulo: "Oficina" },
  { estilo: "clasico", titulo: "Clásico" },
  { estilo: "urbano", titulo: "Urbano" },
  { estilo: "casual", titulo: "Casual" },
  { estilo: "deportivo", titulo: "Deportivo" },
];

/** Buscador + filtro por estilo + catálogo agrupado en secciones -- un solo
 *  componente compartido por PrendaForm.tsx ("+Prenda") y Probar.tsx
 *  ("Probar antes de comprar"), que antes tenían cada uno su propia copia
 *  del `.map` sobre CATALOGO_PRENDAS sin buscador/filtro/secciones. Se
 *  extrae acá en vez de duplicar la lógica dos veces -- ya pasó en esta
 *  sesión que dos copias del mismo grid catálogo se desincronizaron (los
 *  íconos de accesorio no se actualizaban en los dos lugares a la vez). El
 *  `activo`/`onElegir` quedan como props porque cada pantalla define
 *  "seleccionado" distinto (por id de preset en un caso, por
 *  categoría+color en el otro). */
export default function CatalogoPicker({
  activo,
  onElegir,
  maxHeight = 340,
}: {
  activo: (p: PresetPrenda) => boolean;
  onElegir: (p: PresetPrenda) => void;
  maxHeight?: number;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstilo, setFiltroEstilo] = useState<Estilo | null>(null);

  const filtrado = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return CATALOGO_PRENDAS.filter((p) => {
      if (filtroEstilo && p.estilo !== filtroEstilo) return false;
      if (q && !p.nombre.toLowerCase().includes(q) && !p.categoria.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [busqueda, filtroEstilo]);

  // Agrupado por estilo -- todas las prendas del catálogo lo tienen cargado
  // hoy, pero si en el futuro se agrega una sin estilo, cae en "Otros" en
  // vez de desaparecer en silencio del resultado filtrado.
  const grupos = useMemo(() => {
    const porEstilo = new Map<Estilo | "otros", PresetPrenda[]>();
    for (const p of filtrado) {
      const key: Estilo | "otros" = p.estilo ?? "otros";
      const arr = porEstilo.get(key) ?? [];
      arr.push(p);
      porEstilo.set(key, arr);
    }
    return porEstilo;
  }, [filtrado]);

  function tarjeta(p: PresetPrenda) {
    return (
      <button key={p.id} type="button" className={`catalogo-card${activo(p) ? " activo" : ""}`} onClick={() => onElegir(p)}>
        <span className="catalogo-icon">
          <PrendaIcon
            categoria={p.categoria}
            color={p.colorHex}
            textura={p.textura}
            estacion={p.estacion}
            suelaContraste={p.suelaContraste}
            posicionAccesorio={p.posicionAccesorio}
            requiereCuello={p.requiereCuello}
            conCapucha={p.conCapucha}
            patron={p.patron}
            color2={p.colorHex2}
            color3={p.colorHex3}
            corteCalzado={p.corteCalzado}
            calce={p.calce}
            cuello={p.cuello}
            manga={p.manga}
          />
        </span>
        <span className="catalogo-nombre">{p.nombre}</span>
      </button>
    );
  }

  return (
    <div>
      <input
        type="search"
        className="field"
        placeholder="Buscar en el catálogo (ej. camisa, running)..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar prenda en el catálogo"
        style={{ marginBottom: "0.6rem" }}
      />
      <div className="filtro-chips" role="group" aria-label="Filtrar catálogo por estilo">
        <button
          type="button"
          className={`chip${filtroEstilo === null ? " chip-activo" : ""}`}
          onClick={() => setFiltroEstilo(null)}
        >
          Todos
        </button>
        {SECCIONES.map(({ estilo, titulo }) => (
          <button
            key={estilo}
            type="button"
            className={`chip${filtroEstilo === estilo ? " chip-activo" : ""}`}
            onClick={() => setFiltroEstilo((prev) => (prev === estilo ? null : estilo))}
          >
            {titulo}
          </button>
        ))}
      </div>

      {filtrado.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.75rem 0 0" }}>
          Nada coincide con {busqueda ? `"${busqueda}"` : "ese filtro"}.
        </p>
      ) : (
        <div className="catalogo-secciones" style={{ maxHeight }}>
          {SECCIONES.filter(({ estilo }) => grupos.has(estilo)).map(({ estilo, titulo }) => (
            <div key={estilo}>
              <p className="catalogo-seccion-titulo">
                {titulo} <span className="catalogo-seccion-count">({grupos.get(estilo)!.length})</span>
              </p>
              <div className="catalogo-grid">{grupos.get(estilo)!.map(tarjeta)}</div>
            </div>
          ))}
          {grupos.has("otros") && (
            <div>
              <p className="catalogo-seccion-titulo">
                Otros <span className="catalogo-seccion-count">({grupos.get("otros")!.length})</span>
              </p>
              <div className="catalogo-grid">{grupos.get("otros")!.map(tarjeta)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
