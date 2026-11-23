# ¿De qué raza es? Clasificación de 37 razas de perros y gatos con una red neuronal cuántica de *data re-uploading*

Proyecto Final de **Computación Cuántica** (Propuesta A: Razas de mascotas).
Profesora: Naomi Itzel Reyes Granados · Ayudante: Sebastián González Juárez.

Autores: Karla Beatriz Rojas Chimal (320048025) y Victor Emiliano Calderón Gutiérrez (423097331).

## Descripción

Se identifica la raza de una mascota a partir de una foto, usando el conjunto
[Oxford-IIIT Pet](https://www.robots.ox.ac.uk/~vgg/data/pets/) (7 349 fotos, 37 razas: 25 de perro y 12 de gato).
Las fotos no entran directamente al circuito: una ResNet-50 preentrenada y congelada las convierte en un vector
de 2 048 números, y de ahí se reduce a 12 características que sí caben en 6 qubits.

El clasificador es un **circuito variacional cuántico de 6 qubits con *data re-uploading*** (121 parámetros con
`L = 5` capas), construido y entrenado con las mismas herramientas del Lab 7 (PennyLane con interfaz de PyTorch)
y verificado de forma independiente con Qiskit. Se prueban dos
arquitecturas:

- **Plana:** un solo circuito que decide entre las 37 razas.
- **Jerárquica:** un circuito decide la especie (gato o perro) y otro por especie decide la raza (231 parámetros en total).

Se compara contra modelos clásicos y se estudian el efecto de la profundidad, de la re-subida de datos, de la
lectura del circuito y del número de *shots*.

## Pipeline

1. Extracción de características con ResNet-50 (pesos de ImageNet, sin reentrenar). Se calcula una sola vez.
2. Partición estratificada entrenamiento / validación / prueba. La prueba es la partición oficial `test` del conjunto y no se toca hasta el final.
3. Estandarización y reducción a 12 dimensiones con **LDA**, ajustadas solo con el conjunto de entrenamiento (sin fuga de información). En validación, LDA superó con claridad a PCA (F1 del QNN 0.627 contra 0.385 con `d = 12`). También se probó LDA con *shrinkage*: mejora a los modelos clásicos, pero empeora al QNN (0.552), así que la validación eligió LDA sin regularizar.
4. Circuito de 6 qubits: `L` capas de codificación de los datos (`RY`/`RZ` escaladas por pesos entrenables) + el *ansatz* del Lab 7 (`RY` y `RZ` entrenables y CNOT entre vecinos), con re-subida de los datos en cada capa.
5. Entrenamiento como en el Lab 7: QNode de PennyLane sobre `default.qubit` con `interface="torch"` y `diff_method="backprop"`, entropía cruzada y `torch.optim.Adam` (30 épocas, 3 semillas). Los hiperparámetros se eligieron solo con validación.

La única diferencia práctica con el Lab 7 es que al QNode se le pasa el minibatch completo (*parameter broadcasting*)
en lugar de una foto a la vez. Da exactamente el mismo resultado (comprobado en la sección 5.2) y es unas 100 veces
más rápido: unos 2 s por época y menos de un minuto por modelo. El cuaderno completo corre en unos 20 minutos en CPU.

## Resultados principales (conjunto de prueba, 3 semillas)

| Modelo | Parámetros | Accuracy | F1 macro |
|---|---:|:---:|:---:|
| **QNN jerárquico** | 231 | 0.739 ± 0.010 | 0.738 ± 0.009 |
| **QNN plano (LDA 12, L=10)** | 241 | 0.704 ± 0.008 | 0.702 ± 0.007 |
| **QNN plano (LDA 12, L=5)** | 121 | 0.616 ± 0.007 | 0.615 ± 0.008 |
| MLP-Adam 4 neuronas (entrenado como el QNN) | 237 | 0.651 | 0.640 ± 0.047 |
| MLP-Adam 2 neuronas (entrenado como el QNN) | 137 | 0.290 | 0.261 ± 0.184 |
| Centroides | – | 0.818 | 0.816 |
| Regresión logística (LDA 12) | 481 | 0.823 | 0.822 |
| Regresión logística jerárquica | 392 | 0.851 | 0.849 |
| SVM RBF (LDA 12) | – | 0.829 | 0.826 |
| MLP 64-32 | 4 133 | 0.813 | 0.811 |
| Regresión logística (2 048 características) | 75 813 | 0.911 | 0.911 |

Otros datos: top-5 de 0.908 (plano) y 0.947 (jerárquico). En la jerarquía, el 25.4 % de error total se reparte en
1.7 % por especie equivocada y 23.7 % por raza equivocada dentro de la especie correcta.

Ablaciones (una semilla, F1 en prueba): `L = 1` 0.088, `L = 2` 0.254, `L = 3` 0.433, `L = 5` 0.622, `L = 10` 0.706 (0.702 ± 0.007 con tres semillas);
sin re-subida de datos con `L = 5`: 0.433; lectura con ⟨Z⟩ y matriz aprendida (Método B del Lab 7): 0.739.
Con *shots* finitos: exacto 0.624, `S = 100` 0.427, `S = 500` 0.574, `S = 2000` 0.611, `S = 10 000` 0.623.

### Lectura honesta de los resultados

- **No hay ventaja cuántica.** Los modelos clásicos de entrada comparable (regresión logística, SVM, centroides) superan al QNN, y la mayor parte del trabajo ya la hace la ResNet.
- **La jerarquía ayuda por sí misma.** Con un poco más de parámetros, el plano con `L = 10` (241) logra 0.702 ± 0.007 de F1 y el jerárquico (231), 0.738 ± 0.009.
- **Ayuda más al circuito que al modelo clásico.** La regresión logística jerárquica sube de 0.822 a 0.849 frente a la plana; el QNN, 3.6 puntos frente al plano de tamaño parecido y 12 frente al plano de `L = 5`. Nuestra lectura: además de dar a cada etapa variables propias, la jerarquía alivia la lectura del circuito (37 clases en 64 estados base), igual que la lectura con ⟨Z⟩.
- **A igual tamaño, el QNN supera a un MLP entrenado igual:** el jerárquico frente al de 4 neuronas (0.738 contra 0.640) y el plano frente al de 2 neuronas (0.615 contra 0.261, aunque ese MLP es muy inestable).
- Sin re-subida de datos el F1 baja de 0.622 a 0.433, pero el circuito con re-subida y `L = 3`, con los mismos 73 parámetros, da lo mismo: el efecto de la re-subida no se puede separar del número de parámetros con estos experimentos.
- Las ablaciones (salvo `L = 10`) usan una sola semilla; las diferencias pequeñas no son concluyentes.
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

- Entorno: Python 3.11 con PennyLane 0.45.1 (la misma versión de los laboratorios), Qiskit 2.6, scikit-learn, PyTorch y torchvision.
  Por ejemplo: `python -m venv .venv`, luego `pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu`
  y `pip install pennylane==0.45.1 qiskit scikit-learn pandas matplotlib ipykernel pylatexenc`.
- Ejecutar el cuaderno completo. Si no encuentra `data/`, descarga el conjunto y extrae las características
  (se hace una sola vez; unos 5 minutos en CPU). El resto del cuaderno corre en unos 20 minutos en CPU.
- La variable `MODO_RAPIDO` (al inicio del cuaderno) pone `True` para una corrida corta de prueba; el valor por
  defecto `False` reproduce los resultados de este documento.
- Semillas fijas: partición con `SEED` y semillas 0, 1 y 2 para el QNN.

## Referencias

- Parkhi, Vedaldi, Zisserman & Jawahar (2012). *Cats and Dogs*. CVPR.
- He, Zhang, Ren & Sun (2016). *Deep residual learning for image recognition*. CVPR.
- Pérez-Salinas et al. (2020). *Data re-uploading for a universal quantum classifier*. Quantum 4, 226.
- Schuld, Sweke & Meyer (2021). *Effect of data encoding on the expressive power of variational quantum-machine-learning models*. Phys. Rev. A 103, 032430.
- Bergholm et al. (2018). *PennyLane: Automatic differentiation of hybrid quantum-classical computations*.
