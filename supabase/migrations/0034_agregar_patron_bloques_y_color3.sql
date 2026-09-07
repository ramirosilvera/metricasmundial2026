-- Pedido explícito del usuario, con foto adjunta: "agrega la prenda de la
-- captura adjunta al catálogo. Es un buzo de entretiempo. Presta atención a
-- la combinación de colores." La prenda real es un buzo de 3 franjas
-- horizontales de color (greige/crema/blanco) -- ni "liso" ni "rayas"/
-- "cuadros" (0021) la describen: no es un estampado repetido/tejido (trama),
-- son paneles grandes de color sólido cosidos entre sí (color-block real),
-- y son 3 colores, no 2. De ahí "bloques" como tercer valor de patron (ver
-- PatronBloques en PrendaIcon.tsx, que dibuja un gradiente con cortes duros
-- en vez del tile repetido de PatronEstampado) y color3_* como tercer color,
-- mismo formato/rango que color_hex/h/s/l (0006) y color2_hex/h/s/l (0021).
alter table armario.prendas drop constraint prendas_patron_check;
alter table armario.prendas add constraint prendas_patron_check
  check (patron in ('liso', 'rayas', 'cuadros', 'bloques'));

-- Nullable a propósito, igual que color2_*: solo un buzo color-block (u
-- otra prenda de 3 colores a futuro) lo carga; el resto del catálogo/placard
-- queda en null.
alter table armario.prendas add column color3_hex text check (color3_hex ~ '^#[0-9A-Fa-f]{6}$');
alter table armario.prendas add column color3_h numeric check (color3_h >= 0 and color3_h < 360);
alter table armario.prendas add column color3_s numeric check (color3_s between 0 and 100);
alter table armario.prendas add column color3_l numeric check (color3_l between 0 and 100);
