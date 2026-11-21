// Generates Presentacion_Preentrega.pptx (pre-delivery talk, 23 Nov 2026).
// Usage: node generar_presentacion.js <path to pptx skill apply_theme.js>
// Requires: pptxgenjs, react, react-dom, react-icons, sharp (npm).
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa6");

const APPLY_THEME = process.argv[2];
const A = (f) => path.join(__dirname, "assets", f);
const OUT = path.join(__dirname, "Presentacion_Preentrega.pptx");

const THEME = {
  name: "Razas QML",
  headFontFace: "Arial Rounded MT Bold",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "2B2240", lt1: "FFFFFF", dk2: "3B2A5C", lt2: "F4F0FA",
    accent1: "6A4C93", accent2: "E07A5F", accent3: "3D5A80",
    accent4: "F2CC8F", accent5: "8D99AE", accent6: "81B29A",
    hlink: "3D5A80", folHlink: "6A4C93",
  },
};
const H = THEME.colors; // hex values, for the hex-only options

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "¿De qué raza es? Clasificación cuántica de 37 razas";
pres.author = "Karla Beatriz Rojas Chimal y Victor Emiliano Calderón Gutiérrez";
const C = pres.SchemeColor;

const W = 13.333, MX = 0.6;
const sh = () => ({ type: "outer", blur: 10, offset: 3, angle: 90, color: "000000", opacity: 0.12 });

// ------------------------------------------------------------------ layouts
pres.defineSlideMaster({
  title: "PORTADA",
  background: { color: H.dk2 },
  objects: [],
});
pres.defineSlideMaster({
  title: "CONTENIDO",
  background: { color: H.lt2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.35, w: W - 2 * MX, h: 0.9,
      fontFace: THEME.headFontFace, fontSize: 32, color: C.text2, valign: "middle", margin: 0 }, text: "" } },
    { text: { text: "¿De qué raza es? · Computación Cuántica · Pre-entrega", options: {
      x: MX, y: 7.05, w: 7, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: W - MX - 0.6, y: 7.05, w: 0.6, h: 0.3, fontSize: 10, color: C.accent5, align: "right" },
});
pres.defineSlideMaster({
  title: "SECCION",
  background: { color: H.accent1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: MX + 2.2, y: 2.6, w: 9.5, h: 1.3,
      fontFace: THEME.headFontFace, fontSize: 44, color: C.background1, valign: "middle", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: MX + 2.2, y: 3.9, w: 9.5, h: 0.9,
      fontSize: 20, color: C.accent4, valign: "top", margin: 0 }, text: "" } },
  ],
});

// ------------------------------------------------------------------ helpers
async function icon(Comp, hex, size = 256) {
  if (!Comp) throw new Error("missing icon");
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: "#" + hex, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
async function aspect(file) { const m = await sharp(file).metadata(); return m.width / m.height; }

function card(slide, x, y, w, h, fill = C.background1, name = "card") {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { type: "none" },
    rectRadius: 0.18, shadow: sh(), objectName: name });
}
async function iconCircle(slide, Comp, x, y, d, bg, fg) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { type: "none" } });
  const p = d * 0.25;
  slide.addImage({ data: await icon(Comp, fg), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}
function txt(slide, text, o) { slide.addText(text, Object.assign({ isTextBox: true, margin: 0, color: C.text1, fontSize: 16, valign: "top" }, o)); }
function photo(slide, file, x, y, d, ring = C.background1) {
  const r = 0.08;
  slide.addShape(pres.shapes.OVAL, { x: x - r, y: y - r, w: d + 2 * r, h: d + 2 * r, fill: { color: ring }, line: { type: "none" }, shadow: sh() });
  slide.addImage({ path: A(file), x, y, w: d, h: d, rounding: true, altText: "Foto del conjunto Oxford-IIIT Pet" });
}
const content = (title, section) => { const s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: section }); s.addText(title, { placeholder: "title" }); return s; };
function stat(slide, x, y, w, h, big, label, color, fill = C.background1) {
  card(slide, x, y, w, h, fill);
  txt(slide, big, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: h * 0.5, fontSize: 40, bold: true, color, fontFace: THEME.headFontFace, valign: "middle" });
  txt(slide, label, { x: x + 0.25, y: y + 0.2 + h * 0.5, w: w - 0.5, h: h * 0.45 - 0.2, fontSize: 14, color: C.text1 });
}
function arrow(slide, x, y, w) {
  slide.addShape(pres.shapes.RIGHT_ARROW, { x, y, w, h: 0.32, fill: { color: C.accent5 }, line: { type: "none" } });
}
const chartText = { catAxisLabelColor: H.dk1, valAxisLabelColor: H.dk1, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  dataLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt", titleFontFace: "+mn-lt", catAxisLabelFontSize: 12, valAxisLabelFontSize: 11,
  dataLabelFontSize: 11, dataLabelColor: H.dk1, valGridLine: { color: "E3DDEE", size: 0.75 }, catGridLine: { style: "none" } };

(async () => {
  // ================================================================ 1. Portada
  pres.addSection({ title: "Inicio" });
  let s = pres.addSlide({ masterName: "PORTADA", sectionTitle: "Inicio" });
  txt(s, "Proyecto final · Computación Cuántica", { x: MX, y: 0.8, w: 6.5, h: 0.4, fontSize: 16, color: C.accent4, bold: true });
  txt(s, "¿De qué raza es?", { x: MX, y: 1.35, w: 6.6, h: 1.3, fontSize: 54, color: C.background1, fontFace: THEME.headFontFace, valign: "middle" });
  txt(s, "Identificar 37 razas de perros y gatos con un clasificador cuántico de data re-uploading", {
    x: MX, y: 2.75, w: 6.3, h: 1.0, fontSize: 20, color: C.background1 });
  txt(s, [
    { text: "Karla Beatriz Rojas Chimal", options: { bold: true, breakLine: true } },
    { text: "Victor Emiliano Calderón Gutiérrez", options: { bold: true, breakLine: true } },
    { text: "Prof. Naomi Itzel Reyes Granados · Ayud. Sebastián González Juárez", options: { breakLine: true } },
    { text: "Pre-entrega · 23 de noviembre de 2026" },
  ], { x: MX, y: 4.6, w: 6.4, h: 1.6, fontSize: 15, color: C.background1, paraSpaceAfter: 4 });
  photo(s, "foto_persian_11.jpg", 8.2, 1.2, 3.1);
  photo(s, "foto_shiba_inu_10.jpg", 7.1, 4.35, 1.9);
  photo(s, "foto_russian_blue_10.jpg", 11.15, 0.55, 1.5);
  photo(s, "foto_beagle_10.jpg", 9.45, 4.65, 2.2);
  photo(s, "foto_bengal_12.jpg", 11.55, 3.05, 1.35);
  txt(s, "Fotos: Oxford-IIIT Pet (Parkhi et al., 2012), CC BY-SA 4.0", { x: MX, y: 6.95, w: 6, h: 0.3, fontSize: 10, color: C.accent5 });
  s.addNotes("Presentamos el proyecto: identificar la raza de una mascota a partir de una foto, entre 37 razas, con un clasificador cuántico variacional. Hablamos los dos integrantes.");

  // ================================================================ 2. El problema
  s = content("Un refugio necesita la raza desde la foto de ingreso", "Inicio");
  const rows = [
    [fa.FaClipboardList, "La ficha se llena a ojo", "Con prisa y sin papeles: la raza se registra mal o se deja en blanco."],
    [fa.FaStethoscope, "La raza importa", "Tamaño adulto, ejercicio, enfermedades hereditarias y reglamentos locales."],
    [fa.FaMagnifyingGlass, "Los adoptantes filtran por raza", "Un dato bien capturado ayuda a que el animal encuentre hogar."],
  ];
  for (let i = 0; i < rows.length; i++) {
    const y = 1.55 + i * 1.5;
    await iconCircle(s, rows[i][0], MX, y, 0.9, C.accent1, H.lt1);
    txt(s, rows[i][1], { x: MX + 1.15, y: y + 0.02, w: 5.6, h: 0.42, fontSize: 20, bold: true, color: C.text2 });
    txt(s, rows[i][2], { x: MX + 1.15, y: y + 0.48, w: 5.6, h: 0.75, fontSize: 15 });
  }
  stat(s, 8.0, 1.5, 4.7, 1.45, "37 razas", "12 de gato y 25 de perro", C.accent1);
  stat(s, 8.0, 3.2, 4.7, 1.45, "7 349 fotos", "≈ 100 por raza para entrenar", C.accent2);
  stat(s, 8.0, 4.9, 4.7, 1.45, "2.7 %", "acierto al azar", C.accent3);
  s.addNotes("La propuesta: a partir de la foto que el refugio ya toma al ingreso, sugerir una de 37 razas como primera propuesta que una persona puede corregir.");

  // ================================================================ 3. Por qué este proyecto
  s = content("Por qué este problema y no uno más sencillo", "Inicio");
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.accent1 }, fontSize: 15 } });
  const cell = (t, b = false) => ({ text: t, options: { fontSize: 14, bold: b, color: C.text1 } });
  s.addTable([
    [hdr(""), hdr("Opción 1: Dry Bean"), hdr("Este proyecto: Oxford-IIIT Pet")],
    [cell("Clases", true), cell("7"), cell("37", true)],
    [cell("Ejemplos por clase", true), cell("≈ 1 350"), cell("≈ 100")],
    [cell("Entrada", true), cell("16 medidas ya calculadas"), cell("fotos con pose, fondo y luz distintos")],
    [cell("Parecido entre clases", true), cell("variedades separables"), cell("grano fino: razas casi idénticas")],
    [cell("Qubits para leer las clases", true), cell("3"), cell("6 (o jerarquía)")],
  ], { x: MX, y: 1.5, w: 7.3, colW: [2.3, 2.2, 2.8], rowH: 0.55, fill: { color: C.background1 },
       border: { type: "solid", pt: 0.75, color: "E3DDEE" }, valign: "middle", margin: 0.08 });
  card(s, 8.3, 1.5, 4.43, 2.35);
  await iconCircle(s, fa.FaCircleXmark, 8.55, 1.72, 0.6, C.accent2, H.lt1);
  txt(s, "Perros vs. gatos ya está resuelto", { x: 9.3, y: 1.75, w: 3.3, h: 0.6, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
  txt(s, "Martín-Pérez et al. (2026): extractor CNN + circuito de 4 qubits, más de 97.5 %. Además, una tarea binaria es poca cosa.",
    { x: 8.55, y: 2.5, w: 3.95, h: 1.25, fontSize: 14 });
  card(s, 8.3, 4.1, 4.43, 2.35);
  await iconCircle(s, fa.FaCircleCheck, 8.55, 4.32, 0.6, C.accent6, H.lt1);
  txt(s, "Nadie ha hecho las 37 razas", { x: 9.3, y: 4.35, w: 3.3, h: 0.6, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
  txt(s, "Yamaoka et al. (2026) usan este conjunto, pero solo 4 clases, y señalan que faltan más clases.",
    { x: 8.55, y: 5.1, w: 3.95, h: 1.25, fontSize: 14 });
  s.addNotes("Respuesta a la revisión de la propuesta anterior: el problema binario ya estaba resuelto y era menos complejo que las opciones del curso. Con 37 razas el problema cambia de naturaleza.");

  // ================================================================ 4. Grano fino
  s = content("Grano fino: razas que también confunden a una persona", "Inicio");
  {
    const r = await aspect(A("fig_pares_razas.png")); const h = 4.75, w = h * r;
    card(s, (W - w) / 2 - 0.2, 1.4, w + 0.4, h + 0.4);
    s.addImage({ path: A("fig_pares_razas.png"), x: (W - w) / 2, y: 1.6, w, h, altText: "Pares de razas parecidas" });
    txt(s, "Dentro de una raza cambian más la pose y el fondo que el aspecto entre razas vecinas.",
      { x: MX, y: 1.6 + h + 0.4, w: W - 2 * MX, h: 0.4, fontSize: 15, italic: true, color: C.text2, align: "center" });
  }
  s.addNotes("Pit Bull contra Staffordshire, Ragdoll contra Birman, Egyptian Mau contra Bengal. Esperamos que los errores se concentren aquí, no entre perros y gatos.");

  // ================================================================ 5. Solución clásica
  pres.addSection({ title: "Método" });
  s = content("¿Cómo se resolvería de forma clásica?", "Método");
  const cls = [
    [fa.FaFire, "Red convolucional completa", "Entrenar (o ajustar) una CNN de punta a punta. Es lo estándar y supera el 90 %, pero necesita GPU y miles de parámetros.", C.accent3],
    [fa.FaLayerGroup, "Transferencia de aprendizaje", "Extractor congelado + clasificador lineal. Con las 2 048 características de ResNet-50: 0.911 de F1.", C.accent2],
    [fa.FaCompress, "Comprimir y clasificar", "Con solo 16 variables: regresión logística 0.848, SVM 0.846, centroides 0.832. Esa es la referencia justa para el circuito.", C.accent1],
  ];
  for (let i = 0; i < 3; i++) {
    const x = MX + i * 4.12;
    card(s, x, 1.6, 3.85, 3.9);
    await iconCircle(s, cls[i][0], x + 0.3, 1.9, 0.95, cls[i][3], H.lt1);
    txt(s, cls[i][1], { x: x + 0.3, y: 3.05, w: 3.25, h: 0.8, fontSize: 19, bold: true, color: C.text2 });
    txt(s, cls[i][2], { x: x + 0.3, y: 3.9, w: 3.25, h: 2.1, fontSize: 15 });
  }
  s.addNotes("El circuito no puede recibir una foto completa, así que usamos el segundo enfoque: un extractor clásico congelado y el circuito como clasificador. La comparación justa es contra modelos clásicos con la misma entrada comprimida.");

  // ================================================================ 6. Formalización
  s = content("Formalización: el problema de optimización", "Método");
  const eq = (y, label, formula, note) => {
    card(s, MX, y, W - 2 * MX, 1.45);
    txt(s, label, { x: MX + 0.35, y: y + 0.2, w: 3.0, h: 1.05, fontSize: 17, bold: true, color: C.accent1, valign: "middle" });
    // "a_{b}" -> run "a" + subscript run "b"
    const runs = formula.split(/_\{([^}]*)\}/).map((t, k) => ({ text: t, options: k % 2 ? { subscript: true } : {} })).filter((r) => r.text);
    txt(s, runs, { x: MX + 2.9, y: y + 0.15, w: 6.3, h: 1.15, fontSize: 21, italic: true, fontFace: "Cambria", color: C.text2, valign: "middle" });
    txt(s, note, { x: MX + 9.3, y: y + 0.2, w: 2.75, h: 1.05, fontSize: 13, valign: "middle" });
  };
  eq(1.5, "Función objetivo", "ℒ(θ) = −(1/N) Σ_{i} log [ f_{θ}(x_{i}) ]_{yᵢ}", "Entropía cruzada sobre 37 clases; no convexa en los ángulos θ.");
  eq(3.15, "Lectura del circuito", "[ f_{θ}(x) ]_{c} = softmax( β · p_{c}(x) )", "pc: probabilidad del estado base de la clase c; β entrenable.");
  eq(4.8, "Versión jerárquica", "P(raza | x) = P(esp. | x) · P(raza | esp., x)", "Un circuito para la especie y uno por especie para la raza.");
  s.addNotes("x es el vector de 16 variables que sale de la foto; y es la raza. Minimizamos la entropía cruzada con Adam. Como los parámetros son ángulos, el problema es no convexo y reportamos tres semillas.");

  // ================================================================ 7. Pipeline
  s = content("De la foto al circuito, sin fuga de información", "Método");
  const steps = [
    [fa.FaCamera, "Foto", "224 × 224", C.accent5],
    [fa.FaFire, "ResNet-50", "congelada · 2 048 núm.", C.accent3],
    [fa.FaCompress, "Estandarizar + LDA", "16 variables", C.accent2],
    [fa.FaRulerHorizontal, "Escalar", "a ángulos en [0, π]", C.accent4],
    [fa.FaAtom, "Circuito", "6 qubits · 37 clases", C.accent1],
  ];
  for (let i = 0; i < steps.length; i++) {
    const x = MX + i * 2.5;
    card(s, x, 2.0, 2.05, 2.7);
    await iconCircle(s, steps[i][0], x + 0.55, 2.25, 0.95, steps[i][3], steps[i][3] === C.accent4 ? H.dk1 : H.lt1);
    txt(s, steps[i][1], { x: x + 0.15, y: 3.35, w: 1.75, h: 0.55, fontSize: 16, bold: true, color: C.text2, align: "center" });
    txt(s, steps[i][2], { x: x + 0.15, y: 3.9, w: 1.75, h: 0.65, fontSize: 13, align: "center" });
    if (i < steps.length - 1) arrow(s, x + 2.1, 3.2, 0.35);
  }
  card(s, MX, 5.15, W - 2 * MX, 1.45, C.background1);
  await iconCircle(s, fa.FaShieldHalved, MX + 0.3, 5.42, 0.85, C.accent6, H.lt1);
  txt(s, [
    { text: "Todo se ajusta solo con entrenamiento. ", options: { bold: true, color: C.text2 } },
    { text: "Partición oficial: 3 128 fotos de entrenamiento, 552 de validación y 3 669 de prueba. Las decisiones (reducción, d, época) se toman con validación; la prueba solo se usa para reportar." },
  ], { x: MX + 1.4, y: 5.35, w: 10.4, h: 1.05, fontSize: 15, valign: "middle" });
  s.addNotes("LDA ganó con claridad a PCA en validación (0.687 contra 0.442 de F1). También probamos LDA con shrinkage: ayuda a los clásicos pero empeora al circuito, así que la validación lo descartó.");

  // ================================================================ 8. Algoritmo cuántico
  s = content("El algoritmo cuántico: data re-uploading", "Método");
  {
    const r = await aspect(A("fig_circuito.png")); const w = 6.6, h = w / r;
    card(s, MX, 1.45, w + 0.3, h + 0.3);
    s.addImage({ path: A("fig_circuito.png"), x: MX + 0.15, y: 1.6, w, h, altText: "Una capa del circuito de 6 qubits" });
    txt(s, "Una capa del circuito plano (se repite L = 5 veces)", { x: MX, y: 1.6 + h + 0.3, w: w + 0.3, h: 0.35, fontSize: 12, italic: true, color: C.accent5, align: "center" });
  }
  const parts = [
    ["Codificación", "Cada variable entra como un ángulo: R_Y y R_Z por qubit."],
    ["Bloque entrenable", "Una rotación general Rot(φ, θ, ω) por qubit."],
    ["Entrelazamiento", "Anillo de CNOT que conecta los 6 qubits."],
    ["Re-subida", "Los datos vuelven a entrar en cada una de las L capas."],
    ["Lectura", "64 estados base → 37 clases con softmax de temperatura."],
  ];
  card(s, 7.85, 1.45, 4.88, 5.2);
  parts.forEach((p, i) => {
    txt(s, [{ text: p[0] + ": ", options: { bold: true, color: C.accent1 } }, { text: p[1] }],
      { x: 8.15, y: 1.7 + i * 0.98, w: 4.3, h: 0.9, fontSize: 15, valign: "middle" });
  });
  s.addNotes("Parámetros: 3nL + dL + 1. Con 6 qubits, 16 variables y 5 capas son 171. Verificamos el circuito tres veces: simulador propio en PyTorch, PennyLane y Qiskit coinciden hasta 1e-16.");

  // ================================================================ 9. Por qué funciona
  s = content("¿Por qué el algoritmo resuelve el problema?", "Método");
  const why = [
    [fa.FaWaveSquare, "Re-subir los datos amplía el modelo", "Codificar una vez da una serie de Fourier con frecuencias {−1, 0, 1}. Cada capa con re-subida añade frecuencias y permite fronteras más complejas (Schuld et al., 2021)."],
    [fa.FaLink, "El entrelazamiento combina variables", "Los CNOT generan productos de funciones de distintas variables, como una capa oculta."],
    [fa.FaInfinity, "Universal, con matices", "Con suficientes capas aproxima cualquier función acotada (Pérez-Salinas et al., 2020), pero no garantiza que el optimizador la encuentre."],
    [fa.FaSitemap, "La jerarquía alivia la lectura", "Leer 37 clases en 64 estados es difícil; separar especie → raza deja problemas de 2, 12 y 25 clases."],
  ];
  for (let i = 0; i < 4; i++) {
    const x = MX + (i % 2) * 6.15, y = 1.5 + Math.floor(i / 2) * 2.65;
    card(s, x, y, 5.95, 2.4);
    await iconCircle(s, why[i][0], x + 0.3, y + 0.3, 0.85, i === 3 ? C.accent2 : C.accent1, H.lt1);
    txt(s, why[i][1], { x: x + 1.35, y: y + 0.3, w: 4.35, h: 0.85, fontSize: 17, bold: true, color: C.text2, valign: "middle" });
    txt(s, why[i][2], { x: x + 0.3, y: y + 1.25, w: 5.35, h: 1.05, fontSize: 14 });
  }
  s.addNotes("La justificación teórica viene de ver el circuito como una serie de Fourier. La evidencia empírica está en las ablaciones: sin re-subida el F1 baja de 0.678 a 0.552.");

  // ================================================================ 10. Jerarquía
  s = content("Dos arquitecturas: plana y jerárquica", "Método");
  card(s, MX, 1.5, 3.6, 4.9);
  await iconCircle(s, fa.FaAtom, MX + 0.3, 1.8, 0.85, C.accent1, H.lt1);
  txt(s, "Plana", { x: MX + 1.3, y: 1.8, w: 2.1, h: 0.85, fontSize: 22, bold: true, color: C.text2, valign: "middle" });
  txt(s, [
    { text: "Un solo circuito de 6 qubits decide entre las 37 razas.", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "L = 5 capas → 171 parámetros", options: { bold: true, breakLine: true } },
    { text: "L = 8 capas → 273 parámetros", options: { bold: true } },
  ], { x: MX + 0.3, y: 2.95, w: 3.0, h: 3.2, fontSize: 15 });
  // hierarchical diagram
  const bx = (x, y, w, h, t1, t2, fill, dark = false) => {
    card(s, x, y, w, h, fill);
    txt(s, [{ text: t1, options: { bold: true, breakLine: true, fontSize: 16 } }, { text: t2, options: { fontSize: 13 } }],
      { x: x + 0.1, y: y + 0.1, w: w - 0.2, h: h - 0.2, align: "center", valign: "middle", color: dark ? C.text1 : C.background1 });
  };
  bx(4.6, 3.05, 2.2, 1.3, "Foto", "16 variables", C.accent5);
  arrow(s, 6.9, 3.55, 0.45);
  bx(7.45, 3.05, 2.3, 1.3, "Especie", "4 qubits · 61 par.", C.accent1);
  s.addShape(pres.shapes.LINE, { x: 9.75, y: 2.35, w: 0.45, h: 1.35, flipV: true, line: { color: H.accent5, width: 2, endArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 9.75, y: 3.7, w: 0.45, h: 1.35, line: { color: H.accent5, width: 2, endArrowType: "triangle" } });
  bx(10.25, 1.6, 2.48, 1.3, "Raza de gato", "4 qubits · 12 clases · 101 par.", C.accent2);
  bx(10.25, 4.5, 2.48, 1.3, "Raza de perro", "5 qubits · 25 clases · 126 par.", C.accent3);
  txt(s, "Jerárquica: 288 parámetros en total; ningún circuito pasa de 5 qubits", { x: 4.6, y: 6.05, w: 8.1, h: 0.4, fontSize: 14, italic: true, color: C.text2, align: "center" });
  s.addNotes("La jerárquica tiene más parámetros que la plana de 5 capas. Por eso entrenamos también una plana de 8 capas con casi los mismos parámetros: así separamos el efecto de la jerarquía del efecto del tamaño.");

  // ================================================================ 11. Resultados
  pres.addSection({ title: "Resultados" });
  s = content("Resultados: funciona, pero no hay ventaja cuántica", "Resultados");
  const models = [
    ["MLP-Adam 3 neuronas", 0, 0.559], ["QNN plano L=5", 0.665, 0], ["QNN plano L=8", 0.713, 0], ["MLP-Adam 5 neuronas", 0, 0.748],
    ["QNN jerárquico", 0.760, 0], ["Centroides", 0, 0.832], ["MLP 64-32", 0, 0.832], ["k-NN (k=5)", 0, 0.842],
    ["SVM RBF", 0, 0.846], ["Logística", 0, 0.848], ["Logística jerárquica", 0, 0.848], ["Logística 2 048 car.", 0, 0.911],
  ];
  card(s, MX, 1.4, 8.2, 5.4);
  s.addChart(pres.charts.BAR, [
    { name: "Cuántico", labels: models.map((m) => m[0]), values: models.map((m) => m[1]) },
    { name: "Clásico", labels: models.map((m) => m[0]), values: models.map((m) => m[2]) },
  ], Object.assign({ x: MX + 0.15, y: 1.5, w: 7.9, h: 5.2, barDir: "bar", barGrouping: "clustered", barOverlapPct: 100, barGapWidthPct: 45,
    chartColors: [H.accent1, "C3C9D4"], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.000;;;",
    valAxisMinVal: 0, valAxisMaxVal: 1, valAxisLabelFormatCode: "0.0", showLegend: true, legendPos: "b", legendFontSize: 12,
    showTitle: true, title: "F1 macro en prueba (3 669 fotos)", titleFontSize: 14, titleColor: H.dk1 }, chartText));
  stat(s, 9.1, 1.4, 3.63, 1.6, "0.760", "F1 del QNN jerárquico (azar: 0.027)", C.accent1);
  stat(s, 9.1, 3.2, 3.63, 1.6, "−9 pts", "frente a una regresión logística con la misma entrada", C.accent2);
  stat(s, 9.1, 5.0, 3.63, 1.8, "95.6 %", "top-5: la raza correcta casi siempre está entre las 5 primeras", C.accent3);
  s.addNotes("Media de tres semillas para los modelos estocásticos. El circuito resuelve el problema mucho mejor que el azar, pero cualquier modelo clásico con unos cientos de parámetros más lo supera.");

  // ================================================================ 12. Jerarquía vs capacidad
  s = content("¿La jerarquía ayuda o solo tiene más parámetros?", "Resultados");
  stat(s, MX, 1.5, 3.85, 1.9, "0.665", "Plano L = 5 · 171 parámetros", C.accent5);
  stat(s, MX + 4.12, 1.5, 3.85, 1.9, "0.713", "Plano L = 8 · 273 parámetros", C.accent3);
  stat(s, MX + 8.24, 1.5, 3.85, 1.9, "0.760", "Jerárquico · 288 parámetros", C.accent1);
  card(s, MX, 3.75, 5.95, 2.85);
  await iconCircle(s, fa.FaCircleCheck, MX + 0.3, 4.05, 0.8, C.accent6, H.lt1);
  txt(s, "Sí ayuda, y no es solo tamaño", { x: MX + 1.3, y: 4.05, w: 4.4, h: 0.8, fontSize: 18, bold: true, color: C.text2, valign: "middle" });
  txt(s, "Con casi los mismos parámetros, el jerárquico gana unos 5 puntos de F1, muy por encima de la variación entre semillas (± 0.01).",
    { x: MX + 0.3, y: 5.0, w: 5.35, h: 1.4, fontSize: 15 });
  card(s, MX + 6.15, 3.75, 5.98, 2.85);
  await iconCircle(s, fa.FaScaleBalanced, MX + 6.45, 4.05, 0.8, C.accent2, H.lt1);
  txt(s, "Pero ayuda al circuito, no al problema", { x: MX + 7.45, y: 4.05, w: 4.5, h: 0.8, fontSize: 18, bold: true, color: C.text2, valign: "middle" });
  txt(s, "La regresión logística jerárquica empata con la plana (0.848 y 0.848). Nuestra lectura: la jerarquía alivia la lectura de 37 clases en 64 estados.",
    { x: MX + 6.45, y: 5.0, w: 5.4, h: 1.4, fontSize: 15 });
  s.addNotes("Tres semillas en los tres modelos cuánticos. La ablación de lectura con valores esperados Z y una capa lineal apunta en la misma dirección, aunque no es una comparación a igual tamaño.");

  // ================================================================ 13. Igual tamaño
  s = content("A igual tamaño, el circuito aguanta frente a un MLP", "Resultados");
  card(s, MX, 1.45, 7.0, 5.3);
  s.addChart(pres.charts.BAR, [
    { name: "QNN", labels: ["≈ 200 parámetros", "≈ 300 parámetros"], values: [0.665, 0.760] },
    { name: "MLP-Adam", labels: ["≈ 200 parámetros", "≈ 300 parámetros"], values: [0.559, 0.748] },
  ], Object.assign({ x: MX + 0.2, y: 1.6, w: 6.6, h: 5.0, barDir: "col", barGrouping: "clustered", barGapWidthPct: 60,
    chartColors: [H.accent1, "C3C9D4"], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.000",
    valAxisMinVal: 0, valAxisMaxVal: 1, valAxisLabelFormatCode: "0.0", showLegend: true, legendPos: "b", legendFontSize: 12,
    showTitle: true, title: "F1 macro en prueba", titleFontSize: 14, titleColor: H.dk1 }, chartText));
  card(s, 7.95, 1.45, 4.78, 5.3);
  await iconCircle(s, fa.FaRuler, 8.25, 1.75, 0.8, C.accent1, H.lt1);
  txt(s, "Comparación justa", { x: 9.25, y: 1.75, w: 3.3, h: 0.8, fontSize: 18, bold: true, color: C.text2, valign: "middle" });
  txt(s, [
    { text: "Los MLP se entrenan igual que el circuito: Adam, decaimiento coseno, 30 épocas, mejor época en validación, tres semillas.", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "≈ 200 parámetros: ", options: { bold: true } }, { text: "el QNN gana por 10 puntos.", options: { breakLine: true } },
    { text: "≈ 300 parámetros: ", options: { bold: true } }, { text: "empate (0.760 contra 0.748)." },
  ], { x: 8.25, y: 2.8, w: 4.2, h: 3.7, fontSize: 15 });
  s.addNotes("QNN de 171 parámetros contra MLP de 3 neuronas (199); jerárquico de 288 contra MLP de 5 neuronas (307). Los MLP sí tienen mejor top-5.");

  // ================================================================ 14. Ablaciones
  s = content("¿Qué parte del circuito hace el trabajo?", "Resultados");
  card(s, MX, 1.45, 6.6, 5.3);
  s.addChart(pres.charts.LINE, [{ name: "F1 macro", labels: ["1", "2", "3", "5", "8"], values: [0.096, 0.361, 0.523, 0.678, 0.731] }],
    Object.assign({ x: MX + 0.2, y: 1.6, w: 6.2, h: 5.0, chartColors: [H.accent1], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 9,
      showValue: true, dataLabelPosition: "t", dataLabelFormatCode: "0.00", valAxisMinVal: 0, valAxisMaxVal: 1, valAxisLabelFormatCode: "0.0",
      showLegend: false, showTitle: true, title: "Profundidad: F1 macro según el número de capas L", titleFontSize: 14, titleColor: H.dk1,
      showCatAxisTitle: true, catAxisTitle: "capas L", catAxisTitleColor: H.dk1, catAxisTitleFontSize: 12 }, chartText));
  stat(s, 7.55, 1.45, 5.18, 1.6, "0.552 → 0.678", "sin re-subida → con re-subida (L = 5)", C.accent1);
  stat(s, 7.55, 3.3, 5.18, 1.6, "0.731", "leer valores esperados de Z + capa lineal (258 parámetros más)", C.accent2);
  stat(s, 7.55, 5.15, 5.18, 1.6, "0.44 → 0.69", "PCA → LDA en validación: la entrada pesa más que el circuito", C.accent3);
  s.addNotes("Las ablaciones usan una semilla, salvo L = 8, que tiene tres. La re-subida importa como predice la teoría de Fourier; la forma de comprimir importa todavía más.");

  // ================================================================ 15. Errores
  s = content("Los errores están donde uno los esperaría", "Resultados");
  {
    const r = await aspect(A("fig_confusion.png")); const w = 9.1, h = w / r;
    card(s, MX, 1.45, w + 0.3, h + 0.3);
    s.addImage({ path: A("fig_confusion.png"), x: MX + 0.15, y: 1.6, w, h, altText: "Matrices de confusión de los QNN plano y jerárquico" });
  }
  card(s, 10.25, 1.45, 2.48, 5.3);
  txt(s, "Más confundidas", { x: 10.45, y: 1.65, w: 2.1, h: 0.5, fontSize: 16, bold: true, color: C.text2 });
  txt(s, [
    { text: "Siamese → Birman", options: { breakLine: true } }, { text: "Egyptian Mau → Bengal", options: { breakLine: true } },
    { text: "Am. Bulldog → Boxer", options: { breakLine: true } }, { text: "Min. Pinscher → Chihuahua", options: { breakLine: true } },
    { text: "Pit Bull → Staffordshire" },
  ], { x: 10.45, y: 2.25, w: 2.15, h: 3.0, fontSize: 13, paraSpaceAfter: 8 });
  txt(s, "El jerárquico casi no confunde especies: 1.25 % de error por especie.", { x: 10.45, y: 5.25, w: 2.1, h: 1.3, fontSize: 13, italic: true, color: C.accent1 });
  s.addNotes("Gatos arriba a la izquierda, perros abajo a la derecha. El plano manda a la especie equivocada un 5.7 % de las fotos; el jerárquico solo un 1.25 %.");

  // ================================================================ 16. Shots y costo
  s = content("En hardware real: mediciones y costo", "Resultados");
  card(s, MX, 1.45, 6.6, 5.3);
  s.addChart(pres.charts.LINE, [{ name: "accuracy", labels: ["100", "500", "2 000", "10 000"], values: [0.518, 0.643, 0.676, 0.681] }],
    Object.assign({ x: MX + 0.2, y: 1.6, w: 6.2, h: 5.0, chartColors: [H.accent2], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 9,
      showValue: true, dataLabelPosition: "b", dataLabelFormatCode: "0.000", valAxisMinVal: 0.4, valAxisMaxVal: 0.75, valAxisLabelFormatCode: "0.00",
      showLegend: false, showTitle: true, title: "Accuracy del plano según shots por foto (exacto: 0.683)", titleFontSize: 14, titleColor: H.dk1,
      showCatAxisTitle: true, catAxisTitle: "shots por foto", catAxisTitleColor: H.dk1, catAxisTitleFontSize: 12 }, chartText));
  stat(s, 7.55, 1.45, 5.18, 1.6, "≈ 2 000", "shots por foto para quedar a 1 punto del valor exacto", C.accent2);
  stat(s, 7.55, 3.3, 5.18, 1.6, "3 × 10¹⁰", "shots para entrenar 30 épocas con parameter-shift", C.accent1);
  stat(s, 7.55, 5.15, 5.18, 1.6, "55 · 30 CNOT", "profundidad del plano transpilado a rz, sx, x, cx", C.accent3);
  s.addNotes("Con 37 clases cada raza recibe pocas cuentas, así que hacen falta más mediciones que con 7 clases. Entrenar en hardware sería carísimo; en simulación es un backward pass.");

  // ================================================================ 17. Librerías
  pres.addSection({ title: "Cierre" });
  s = content("Librerías y por qué las usamos", "Cierre");
  const libs = [
    [fa.FaFire, "PyTorch + torchvision", "Descarga del conjunto, ResNet-50 preentrenada y un simulador rápido del circuito (3 s por época contra 20 s)."],
    [fa.FaAtom, "PennyLane", "Definición de referencia del circuito, dibujo y recursos con qml.specs."],
    [fa.FaMicrochip, "Qiskit", "Verificación independiente del circuito y transpilación a compuertas nativas."],
    [fa.FaGears, "scikit-learn", "Particiones, estandarización, PCA, LDA, métricas y modelos clásicos."],
    [fa.FaTable, "NumPy + pandas", "Cálculo numérico y tablas de resultados."],
    [fa.FaChartColumn, "matplotlib", "Figuras del cuaderno."],
  ];
  for (let i = 0; i < 6; i++) {
    const x = MX + (i % 3) * 4.12, y = 1.5 + Math.floor(i / 3) * 2.65;
    card(s, x, y, 3.85, 2.4);
    await iconCircle(s, libs[i][0], x + 0.25, y + 0.25, 0.75, [C.accent3, C.accent1, C.accent1, C.accent2, C.accent5, C.accent6][i], H.lt1);
    txt(s, libs[i][1], { x: x + 1.15, y: y + 0.25, w: 2.5, h: 0.75, fontSize: 17, bold: true, color: C.text2, valign: "middle" });
    txt(s, libs[i][2], { x: x + 0.25, y: y + 1.12, w: 3.4, h: 1.15, fontSize: 14 });
  }
  s.addNotes("Reimplementar una red convolucional no aporta al objetivo del curso; el simulador propio en PyTorch se comprobó contra PennyLane y Qiskit.");

  // ================================================================ 18. Reflexiones
  s = content("Primeras reflexiones: ¿por qué cuántico?", "Cierre");
  card(s, MX, 1.5, 5.95, 5.1);
  await iconCircle(s, fa.FaCircleCheck, MX + 0.3, 1.8, 0.8, C.accent6, H.lt1);
  txt(s, "Lo que sí encontramos", { x: MX + 1.3, y: 1.8, w: 4.4, h: 0.8, fontSize: 19, bold: true, color: C.text2, valign: "middle" });
  txt(s, [
    { text: "Un circuito de 5–6 qubits resuelve 37 clases mucho mejor que el azar.", options: { bullet: true, breakLine: true } },
    { text: "Es compacto: a igual número de parámetros empata o supera a un MLP.", options: { bullet: true, breakLine: true } },
    { text: "La jerarquía ayuda por una razón propia del circuito: su lectura.", options: { bullet: true } },
  ], { x: MX + 0.3, y: 2.85, w: 5.35, h: 3.5, fontSize: 17, paraSpaceAfter: 14 });
  card(s, MX + 6.15, 1.5, 5.98, 5.1);
  await iconCircle(s, fa.FaCircleXmark, MX + 6.45, 1.8, 0.8, C.accent2, H.lt1);
  txt(s, "Lo que no", { x: MX + 7.45, y: 1.8, w: 4.4, h: 0.8, fontSize: 19, bold: true, color: C.text2, valign: "middle" });
  txt(s, [
    { text: "No hay ventaja cuántica: un modelo lineal clásico rinde más y cuesta menos.", options: { bullet: true, breakLine: true } },
    { text: "6 qubits se simulan sin esfuerzo en una laptop.", options: { bullet: true, breakLine: true } },
    { text: "La mayor parte del trabajo la hacen la ResNet y el LDA, antes del circuito.", options: { bullet: true } },
  ], { x: MX + 6.45, y: 2.85, w: 5.4, h: 3.5, fontSize: 17, paraSpaceAfter: 14 });
  s.addNotes("Lo esperábamos desde el principio. El aporte es caracterizar un clasificador cuántico compacto en un problema real de 37 clases y entender sus límites.");

  // ================================================================ 19. Qué falta
  s = content("¿Qué falta para el 7 de diciembre?", "Cierre");
  const todo = [
    ["Ruido", "Simular el circuito con un modelo de ruido (Qiskit Aer)."],
    ["Solidez", "Validación cruzada y más semillas en las ablaciones."],
    ["Lectura", "Probar lecturas a igual tamaño para confirmar el cuello de botella."],
    ["Ángulos", "Escalado robusto: entender por qué el shrinkage perjudica al circuito."],
    ["Entrega", "Cuaderno final reproducible, documento y revisión contra la rúbrica."],
  ];
  todo.forEach((t, i) => {
    const y = 1.5 + i * 1.02;
    s.addShape(pres.shapes.OVAL, { x: MX, y: y + 0.08, w: 0.62, h: 0.62, fill: { color: C.accent1 }, line: { type: "none" } });
    txt(s, String(i + 1), { x: MX, y: y + 0.08, w: 0.62, h: 0.62, fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle" });
    txt(s, [{ text: t[0] + ": ", options: { bold: true, color: C.text2 } }, { text: t[1] }], { x: MX + 0.85, y, w: 6.3, h: 0.8, fontSize: 15, valign: "middle" });
  });
  card(s, 8.1, 1.5, 4.63, 5.1, C.background1);
  await iconCircle(s, fa.FaQuestion, 8.4, 1.8, 0.8, C.accent4, H.dk1);
  txt(s, "Dudas para la profesora", { x: 9.4, y: 1.8, w: 3.1, h: 0.8, fontSize: 18, bold: true, color: C.text2, valign: "middle" });
  txt(s, [
    { text: "¿Es válido reducir con LDA, que usa las etiquetas, antes del circuito?", options: { bullet: true, breakLine: true } },
    { text: "¿Se espera una ejecución en hardware real o basta con simulación con ruido?", options: { bullet: true, breakLine: true } },
    { text: "¿La comparación a igual número de parámetros es la adecuada para el reporte?", options: { bullet: true } },
  ], { x: 8.4, y: 2.85, w: 4.1, h: 3.6, fontSize: 17, paraSpaceAfter: 14 });
  s.addNotes("El cuaderno ya corre de punta a punta y tiene todos los resultados; lo que falta es robustez y el análisis con ruido.");

  // ================================================================ 20. Cierre
  s = pres.addSlide({ masterName: "PORTADA", sectionTitle: "Cierre" });
  txt(s, "¡Gracias!", { x: MX, y: 1.6, w: 6.5, h: 1.3, fontSize: 60, color: C.background1, fontFace: THEME.headFontFace, valign: "middle" });
  txt(s, "¿Preguntas?", { x: MX, y: 2.95, w: 6.5, h: 0.8, fontSize: 30, color: C.accent4, fontFace: THEME.headFontFace });
  txt(s, [
    { text: "Código, cuaderno y propuestas:", options: { breakLine: true } },
    { text: "github.com/KarlaRoChi/Proyecto-FInal-Compu-Cuantica", options: { bold: true, color: C.accent4 } },
  ], { x: MX, y: 4.3, w: 6.6, h: 0.9, fontSize: 15, color: C.background1 });
  txt(s, "Referencias: Parkhi et al. (2012), Pérez-Salinas et al. (2020), Schuld et al. (2021), Martín-Pérez et al. (2026), Yamaoka et al. (2026), He et al. (2016). Fotos: Oxford-IIIT Pet, CC BY-SA 4.0.",
    { x: MX, y: 5.8, w: 6.4, h: 0.9, fontSize: 11, color: C.accent5 });
  photo(s, "foto_samoyed_10.jpg", 8.0, 0.9, 2.6);
  photo(s, "foto_maine_coon_14.jpg", 10.9, 1.7, 1.75);
  photo(s, "foto_keeshond_10.jpg", 7.3, 3.95, 1.8);
  photo(s, "foto_boxer_10.jpg", 9.55, 4.0, 2.4);
  photo(s, "foto_newfoundland_10.jpg", 12.0, 5.6, 1.1);
  s.addNotes("Gracias. Todo el código y los documentos están en el repositorio.");

  await pres.writeFile({ fileName: OUT });
  if (APPLY_THEME) { const { applyTheme } = require(APPLY_THEME); await applyTheme(OUT, THEME); }
  console.log("written", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
