# ¿De qué raza es? Clasificación de 37 razas de perros y gatos con una red neuronal cuántica de *data re-uploading*

Proyecto Final de **Computación Cuántica** (Propuesta A: Razas de mascotas).
Profesora: Naomi Itzel Reyes Granados · Ayudante: Sebastián González Juárez.

Autores: Karla Beatriz Rojas Chimal (320048025) y Victor Emiliano Calderón Gutiérrez (423097331).

## Descripción

Se identifica la raza de una mascota a partir de una foto, usando el conjunto
[Oxford-IIIT Pet](https://www.robots.ox.ac.uk/~vgg/data/pets/) (7 349 fotos, 37 razas: 25 de perro y 12 de gato).
Las fotos no entran directamente al circuito: una ResNet-50 preentrenada y congelada las convierte en un vector
de 2 048 números, y de ahí se reduce a 16 características que sí caben en 6 qubits.

El clasificador es un **circuito variacional cuántico de 6 qubits con *data re-uploading*** (171 parámetros con
`L = 5` capas), implementado con PennyLane y verificado de forma independiente con Qiskit. Se prueban dos
arquitecturas:

- **Plana:** un solo circuito que decide entre las 37 razas.
- **Jerárquica:** un circuito decide la especie (gato o perro) y otro por especie decide la raza (288 parámetros en total).

Se compara contra modelos clásicos y se estudian el efecto de la profundidad, de la re-subida de datos, de la
lectura del circuito y del número de *shots*.

## Pipeline

1. Extracción de características con ResNet-50 (pesos de ImageNet, sin reentrenar). Se calcula una sola vez.
2. Partición estratificada entrenamiento / validación / prueba. La prueba es la partición oficial `test` del conjunto y no se toca hasta el final.
3. Estandarización y reducción a 16 dimensiones con **LDA**, ajustadas solo con el conjunto de entrenamiento (sin fuga de información). En validación, LDA superó con claridad a PCA (F1 0.687 contra 0.442 con `d = 16`). También se probó LDA con *shrinkage*: mejora a los modelos clásicos, pero empeora al QNN (0.624), así que la validación eligió LDA sin regularizar.
4. Circuito de 6 qubits: `L` capas de codificación de los datos + rotaciones entrenables + entrelazamiento con CNOT, con re-subida de los datos en cada capa.
5. Entrenamiento con Adam y entropía cruzada (30 épocas, 3 semillas). Los hiperparámetros se eligieron solo con validación.

Para que el entrenamiento sea viable, el cuaderno incluye un simulador de vector de estado en PyTorch equivalente
al circuito de PennyLane (coinciden hasta ~1e-16, comprobado en la sección 5.2): unos 3 s por época, frente a
unos 20 s con el QNode. PennyLane se usa como circuito de referencia para dibujar, medir recursos y compararlo con Qiskit.

## Resultados principales (conjunto de prueba, 3 semillas)

| Modelo | Parámetros | Accuracy | F1 macro |
|---|---:|:---:|:---:|
| **QNN jerárquico** | 288 | 0.763 ± 0.006 | 0.760 ± 0.007 |
| **QNN plano (LDA 16, L=8)** | 273 | 0.715 ± 0.012 | 0.713 ± 0.013 |
| **QNN plano (LDA 16, L=5)** | 171 | 0.668 ± 0.016 | 0.665 ± 0.014 |
| MLP-Adam 5 neuronas (entrenado como el QNN) | 307 | 0.755 | 0.748 ± 0.009 |
| MLP-Adam 3 neuronas (entrenado como el QNN) | 199 | 0.580 | 0.559 ± 0.013 |
| Centroides | – | 0.834 | 0.832 |
| Regresión logística (LDA 16) | 629 | 0.849 | 0.848 |
| Regresión logística jerárquica | 392 | 0.850 | 0.848 |
| SVM RBF (LDA 16) | – | 0.848 | 0.846 |
| MLP 64-32 | 4 389 | 0.833 | 0.832 |
| Regresión logística (2 048 características) | 75 813 | 0.911 | 0.911 |

Otros datos: top-5 de 0.909 (plano) y 0.956 (jerárquico). En la jerarquía, el 22.8 % de error total se reparte en
1.25 % por especie equivocada y 21.6 % por raza equivocada dentro de la especie correcta.

Ablaciones (una semilla, F1 en prueba): `L = 1` 0.096, `L = 2` 0.361, `L = 3` 0.523, `L = 5` 0.678, `L = 8` 0.731 (0.713 ± 0.013 con tres semillas);
sin re-subida de datos con `L = 5`: 0.552; lectura con ⟨Z⟩ y capa lineal: 0.731.
Con *shots* finitos: exacto 0.683, `S = 100` 0.518, `S = 500` 0.643, `S = 2000` 0.676, `S = 10 000` 0.681.

### Lectura honesta de los resultados

- **No hay ventaja cuántica.** Los modelos clásicos de entrada comparable (regresión logística, SVM, centroides) superan al QNN, y la mayor parte del trabajo ya la hace la ResNet.
- **La jerarquía ayuda por sí misma.** Con casi los mismos parámetros, el plano con `L = 8` (273) logra 0.713 ± 0.013 de F1 y el jerárquico (288), 0.760 ± 0.007.
- **Pero ayuda al circuito, no al problema.** La regresión logística jerárquica empata con la plana (0.848 contra 0.848). Nuestra lectura: la jerarquía alivia la lectura del circuito (37 clases en 64 estados base), igual que la lectura con ⟨Z⟩ y capa lineal.
- **A igual tamaño, el QNN aguanta.** Frente a MLP entrenados con el mismo procedimiento, el jerárquico empata con el de 5 neuronas (0.760 contra 0.748) y el plano supera al de 3 neuronas (0.665 contra 0.559).
- La re-subida de datos importa: sin ella el F1 baja de 0.678 a 0.552.
- Las ablaciones (salvo `L = 8`) usan una sola semilla; las diferencias pequeñas no son concluyentes.
- Entrenar con la regla del desplazamiento de parámetros en hardware costaría ~1e9 *shots* por época con `S = 1000`.

## Estructura del repositorio

```
.
├── Proyecto_Final_Razas_QML.ipynb   # Cuaderno con todo el código, explicaciones y resultados
├── README.md
└── data/                            # Se genera solo (no se versiona)
    ├── oxford-iiit-pet/             # Fotos y anotaciones (descarga automática)
    └── features.npz                 # Características de la ResNet-50 (2 048 por foto)
```

## Reproducibilidad

- Entorno: Python 3.11, PennyLane, Qiskit, scikit-learn, PyTorch y torchvision (entorno `conda` `compu_cuantica`).
- Ejecutar el cuaderno completo. Si no encuentra `data/`, descarga el conjunto y extrae las características
  (la extracción es lo más lento y se hace una sola vez; con GPU tarda poco). El entrenamiento completo corre en CPU.
- La variable `MODO_RAPIDO` (al inicio del cuaderno) pone `True` para una corrida corta de prueba; el valor por
  defecto `False` reproduce los resultados de este documento.
- Semillas fijas: partición con `SEED` y semillas 0, 1 y 2 para el QNN.

## Referencias

- Parkhi, Vedaldi, Zisserman & Jawahar (2012). *Cats and Dogs*. CVPR.
- He, Zhang, Ren & Sun (2016). *Deep residual learning for image recognition*. CVPR.
- Pérez-Salinas et al. (2020). *Data re-uploading for a universal quantum classifier*. Quantum 4, 226.
- Schuld, Sweke & Meyer (2021). *Effect of data encoding on the expressive power of variational quantum-machine-learning models*. Phys. Rev. A 103, 032430.
- Bergholm et al. (2018). *PennyLane: Automatic differentiation of hybrid quantum-classical computations*.
