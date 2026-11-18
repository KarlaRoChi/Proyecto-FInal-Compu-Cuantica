# Clasificación de variedades de frijol seco con una Red Neuronal Cuántica de *Data Re-Uploading*

Proyecto Final de **Computación Cuántica** (Opción 1: Clasificación de Semillas).
Profesora: Naomi Itzel Reyes Granados · Ayudante: Sebastián González Juárez.

## Descripción

Se clasifican siete variedades de frijol seco (Barbunya, Bombay, Cali, Dermason, Horoz, Seker y Sira)
a partir de 16 medidas morfológicas de cada grano, usando el conjunto
[*Dry Bean* de UCI](https://archive.ics.uci.edu/dataset/602/dry+bean+dataset) (13 611 granos; 13 543 tras
eliminar 68 duplicados).

El clasificador es un **circuito variacional cuántico de 4 qubits con *data re-uploading*** (65 parámetros),
implementado con PennyLane y verificado de forma independiente con Qiskit. Se compara contra modelos
clásicos (centroides, regresión logística, MLP, SVM-RBF, Random Forest) y se analiza el efecto de la
profundidad, de la re-subida de datos y del número de *shots*.

## Pipeline

1. Partición estratificada 70 / 30 (con 10 % del entrenamiento para validación).
2. Estandarización → PCA a 4 componentes (~95 % de varianza) → escalado a `[0, π]`.
   Todo se ajusta únicamente con el conjunto de entrenamiento (sin fuga de información).
3. Circuito de 4 qubits: `L` capas de `RX(α·x)` + `Rot` entrenable + anillo de CNOT.
   Las 7 clases se leen de las probabilidades de los estados base con un *softmax* de temperatura entrenable.
4. Entrenamiento con Adam (entropía cruzada, 20 épocas, 3 semillas).

## Resultados principales (conjunto de prueba, 4 063 granos)

| Modelo | Entrada | Parámetros | Accuracy | F1 macro |
|---|---|---:|:---:|:---:|
| **QNN re-uploading (L=4)** | 4 PCA | 65 | 0.884 | 0.886 |
| MLP 6 neuronas | 4 PCA | 79 | 0.885 | 0.887 |
| SVM RBF | 4 PCA | – | 0.895 | 0.898 |
| SVM RBF | 16 características | – | 0.924 | 0.936 |

El QNN es competitivo con modelos clásicos de capacidad comparable, pero **no muestra ventaja cuántica**:
el cuello de botella es comprimir la entrada a 4 componentes. Más detalles en el documento de metodología.

## Estructura del repositorio

```
.
├── Proyecto_Final_Semillas_QML.ipynb   # Cuaderno con todo el código y resultados
├── metodologia.tex / metodologia.pdf   # Documento de metodología (LaTeX)
├── Presentaciones_Proyecto.pdf         # Presentación
├── ProyectosCC.pdf                     # Enunciado / lineamientos del proyecto
├── figures/                            # Figuras generadas por el cuaderno
└── data/                               # Dataset Dry Bean (UCI)
```

## Reproducibilidad

- Entorno: Python 3.11, PennyLane 0.45, Qiskit 2.6, scikit-learn 1.9 (entorno `conda` `compu_cuantica`).
- Ejecutar el cuaderno `Proyecto_Final_Semillas_QML.ipynb` completo (~25 min en CPU). Si no encuentra
  `data/`, descarga el dataset de UCI.
- Semillas fijas: partición con `random_state=42`; semillas 0, 1 y 2 para el QNN.
- Para compilar la metodología: `pdflatex metodologia.tex` (dos pasadas; requiere `quantikz`).

## Referencias

- Koklu & Özkan (2020). *Multiclass classification of dry beans using computer vision and machine learning techniques*. Computers and Electronics in Agriculture.
- Pérez-Salinas et al. (2020). *Data re-uploading for a universal quantum classifier*. Quantum 4, 226.
- Schuld, Sweke & Meyer (2021). *Effect of data encoding on the expressive power of variational quantum-machine-learning models*. Phys. Rev. A 103, 032430.
- Bergholm et al. (2018). *PennyLane: Automatic differentiation of hybrid quantum-classical computations*.
