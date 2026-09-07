-- Ronda de completitud del catálogo (pedido explícito del usuario: "revisá
-- todas las prendas del catálogo, quiero que me digas si está completo o
-- se puede completar aún más"), revisada como modista y asesor de imagen.
--
-- La sandalia es el otro corte (junto con el botín, migración 0030) que
-- cambia la SILUETA entera y no solo la decoración -- ver CorteCalzado en
-- types.ts. Los seis cortes existentes hasta esta migración (incluido el
-- botín, que es justo lo opuesto) cubrían frío/entretiempo o calzado
-- cerrado de calle todo el año, pero ninguno era realmente de verano -- un
-- guardarropa real no usa zapatilla cerrada con bermuda en pleno enero.
alter table armario.prendas drop constraint prendas_corte_calzado_check;
alter table armario.prendas add constraint prendas_corte_calzado_check
  check (corte_calzado in ('zapatilla_urbana', 'zapatilla_running', 'zapato_vestir', 'mocasin', 'zapatilla_lona', 'botin', 'sandalia'));
