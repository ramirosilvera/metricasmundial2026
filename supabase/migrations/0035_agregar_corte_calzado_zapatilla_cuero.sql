-- Consejo -- hueco real encontrado al auditar el catálogo de "prendas por
-- comprar": el commit 9f0d708 ("Agrega el corte 'zapatilla de cuero' -- no
-- es zapato ni mocasín") sumó el valor 'zapatilla_cuero' a CorteCalzado
-- (types.ts), a CATALOGO_PRENDAS (catalogo.ts, dos entradas: zapatillas de
-- cuero negras/marrones) y al <select> de PrendaForm.tsx, pero nunca tocó
-- el constraint CHECK de la base -- ningún archivo de migración lo
-- agregó. Con eso, cargar cualquiera de esas dos prendas del catálogo (o
-- cualquier calzado propio con este corte) desde la app falla en el
-- insert real contra Supabase con una violación de constraint
-- (prendas_corte_calzado_check), aunque el código y el catálogo ya lo den
-- por soportado.
alter table armario.prendas drop constraint prendas_corte_calzado_check;
alter table armario.prendas add constraint prendas_corte_calzado_check
  check (corte_calzado in ('zapatilla_urbana', 'zapatilla_running', 'zapato_vestir', 'mocasin', 'zapatilla_cuero', 'zapatilla_lona', 'botin', 'sandalia'));
