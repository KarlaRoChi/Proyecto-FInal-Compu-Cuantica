# ¿De qué raza es? Clasificación cuántica de 37 razas de perros y gatos

Proyecto Final de **Computación Cuántica**.
Profesora: Naomi Itzel Reyes Granados · Ayudante: Sebastián González Juárez.

Equipo: Karla Beatriz Rojas Chimal y Victor Emiliano Calderón Gutiérrez.

Fechas: pre-entrega el 23 de noviembre de 2026 y entrega final el 7 de diciembre de 2026.

Se identifica la raza de una mascota a partir de una foto del conjunto
[Oxford-IIIT Pet](https://www.robots.ox.ac.uk/~vgg/data/pets/) (7 349 fotos, 37 razas). Una ResNet-50 congelada
extrae características, LDA las reduce a 16 variables y un **circuito variacional de 6 qubits con *data re-uploading***
(PennyLane, verificado con Qiskit) clasifica la raza. También se prueba una versión **jerárquica** (especie → raza).

| Modelo | Parámetros | F1 macro (prueba) |
|---|---:|:---:|
| QNN jerárquico | 288 | 0.760 ± 0.007 |
| QNN plano (L = 8) | 273 | 0.713 ± 0.013 |
| QNN plano (L = 5) | 171 | 0.665 ± 0.014 |
| MLP-Adam, 5 neuronas | 307 | 0.748 ± 0.009 |
| Regresión logística (mismas 16 variables) | 629 | 0.848 |

El circuito resuelve el problema mucho mejor que el azar (0.027) y, a igual número de parámetros, empata o supera a
un MLP. No hay ventaja cuántica: un modelo lineal clásico con la misma entrada rinde más.

## Contenido del repositorio

| Carpeta | Qué contiene |
|---|---|
| [`Proyecto_Razas/`](Proyecto_Razas/) | **Proyecto principal**: cuaderno ejecutado con todo el código y los resultados, y su [README](Proyecto_Razas/README.md) detallado. |
| [`Presentacion/`](Presentacion/) | Diapositivas de la pre-entrega (`.pptx` y `.pdf`) y el script que las genera. |
| [`Propuestas/`](Propuestas/) | Propuesta A (razas, la elegida), propuesta B (desenlaces en un refugio) y la propuesta anterior de perros contra gatos. |
| [`Documentos_Curso/`](Documentos_Curso/) | Lineamientos del proyecto y de las presentaciones. |
| [`Otros/`](Otros/) | Proyecto anterior con el conjunto Dry Bean (semillas), que quedó de lado. |

## Cómo reproducir

1. Crear el entorno `conda` con Python 3.11, PennyLane, Qiskit, PyTorch, torchvision, scikit-learn, pandas y matplotlib.
2. Ejecutar `Proyecto_Razas/Proyecto_Final_Razas_QML.ipynb`. La primera vez descarga el conjunto y extrae las
   características de la ResNet-50 en `Proyecto_Razas/data/` (no se versiona).

Las diapositivas se regeneran con `node Presentacion/generar_presentacion.js` (requiere `pptxgenjs`, `react`,
`react-dom`, `react-icons` y `sharp`).

Fotos: Oxford-IIIT Pet (Parkhi et al., 2012), licencia CC BY-SA 4.0.
