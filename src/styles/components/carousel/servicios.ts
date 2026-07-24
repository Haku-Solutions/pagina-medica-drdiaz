export interface Servicio {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  backTitle: string;
  backItems: string[];
}

export const servicios: Servicio[] = [
  {
    id: 1,
    titulo: "Cirugía de Vesícula Biliar",
    descripcion: "Es una cirugía para extirpar la vesícula biliar usando un dispositivo médico llamado laparoscopio para tratar cálculos biliares o inflamación.",
    imagen: "/assets/servicios/cirugía_vesícula_biliar.jpg",

    backTitle: "¿Cuándo se necesita?",
    backItems: [
      "Dolor ocasionado por cálculos biliares.",
      "Vesícula biliar que no funciona correctamente.",
      "Indigestión (distensión, acidez y gases).",
      "Dolor después de comer.",
      "Náuseas y vómitos.",
    ],
  },
  {
      id: 2,
      titulo: "Cirugía de Hernia",
      descripcion: "Una hernia ocurre cuando las capas internas de la pared abdominal se debilitan, lo que provoca un abultamiento o desgarro.",
      imagen: "/assets/servicios/cirugia_hernia.avif",

      backTitle: "¿Cuándo se necesita?",
      backItems: [
        "la cirugía para una hernia se realiza si usted tiene dolor o la hernia le molesta durante sus actividades cotidianas.",
        "Algunas veces, el intestino puede quedar atrapado en el interior de la hernia. Esto se conoce como una hernia encarcelada o estrangulada. Este tipo de hernia puede cortar el suministro de sangre a los intestinos."
      ],
    },
    {
      id: 3,
      titulo: "Cirugía de Apéndice",
      descripcion: "El apéndice es un órgano pequeño se extiende desde la primera parte del intestino grueso. Cuando se inflama o se infecta, su apéndice puede necesitar ser removido.",
      imagen: "/assets/servicios/cirugia_apendice.avif",

      backTitle: "Síntomas",
      backItems: [
       "Dolor agudo o intenso",
       "Dolor que traslada al cuadrante abdominal inferior derecho y se vuelve más concentrado en esta área.",
       "Diarrea o estreñimiento",
       "Fiebre (generalmente no muy alta)",
       "Náuseas y vómitos",
       "Disminución del apetito",
      ],
    },
    {
      id: 4,
      titulo: "Cirugía de Obstrucción Intenstinal",
      descripcion: "Se realiza cuando los contenidos del intestino no pueden pasar ni salir del cuerpo.",
      imagen: "/assets/servicios/obstruccion_intestinal.jpg",

      backTitle: "¿Cuándo se necesita?",
      backItems: [
        "Un bloqueo que dura mucho tiempo puede reducir o bloquear la circulación de la sangre a la zona. Esto puede causar la muerte del intestino.",
      ],
    },
    {
      id: 5,
      titulo: "Cirugía de Pie Diabético",
      descripcion: "Consiste en eliminar el tejido no viable o necrótico de la herida causada por las úlceras del pié diabético.",
      imagen: "/assets/servicios/cirugia_pie_diabetico.jpg",

      backTitle: "¿Cuándo se necesita?",
      backItems: [
        "Cuando hay exposición prolongada a niveles altos de azúcar en la sangre los nervios y los vasos sanguíneos de los pies se dañan.",
        "Perder la sensibilidad del pie puede provocar complicaciones, como cortes, ampollas o úlceras inadvertidas. Estas heridas pueden infectarse, especialmente porque los vasos sanguíneos dañados afectan el flujo sanguíneo adecuado en los pies."
      ],
    },
    {
      id: 6,
      titulo: "Endoscopía",
      descripcion: "Es un procedimiento que permite que el médico vea el interior de su cuerpo para buscar anomalías como úlceras, pólipos, tumores u otros.",
      imagen: "/assets/servicios/cirugía_endoscopia.avif",

      backTitle: "¿Cuándo se necesita?",
      backItems: [
        "Puede ayudar a determinar qué está causando los signos y síntomas digestivos a través de la observación o la toma de muestras de tejido (biopsia).",
        "Una endoscopia se puede usar para quemar un vaso con sangrado y detener el sangrado, ensanchar un esófago estrecho, cortar un pólipo o extraer un objeto extraño.",
      ],
    },
    {
      id: 7,
      titulo: "Consultas de gastro cirugía",
      descripcion: "Evaluación especializada para el diagnóstico y tratamiento de enfermedades del aparato digestivo que pueden requerir manejo quirúrgico.",
      imagen: "/assets/servicios/consulta.png",

      backTitle: "¿Cuándo acudir a una consulta de gastrocirugía?",
      backItems: [
        "Dolor abdominal persistente o recurrente.",
        "Reflujo gastroesofágico que no mejora con tratamiento médico.",
        "Hernias abdominales o inguinales.",
        "Enfermedades de la vesícula biliar, como cálculos biliares.",
        "Problemas del estómago, intestino, colon o recto que requieran valoración quirúrgica.",
        "Seguimiento antes o después de una cirugía del aparato digestivo.",
      ],
    },
];