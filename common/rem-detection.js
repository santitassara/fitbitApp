import document from "document";
import { me } from "appbit";
import { BodyPresenceSensor } from "body-presence";
import { Accelerometer } from "accelerometer";
import { Sleep } from "fitbit-sleep";
import { vibration } from "haptics";

// Configuración
const VIBRATION_DURATION = 2000; // Duración de la vibración en milisegundos
const VIBRATION_STRENGTH = 1.0; // Fuerza de la vibración (0.0 a 1.0)
const MIN_REM_CONFIDENCE = 2; // Confianza mínima para considerar que se está en REM (0 a 3)
const SAMPLE_SIZE = 32; // Tamaño de la muestra de aceleración para el análisis (potencia de 2)

// Variables
let bodyPresence = new BodyPresenceSensor();
let accelerometer = new Accelerometer({ frequency: 25 });
let sleep = new Sleep();
let remDetected = false;

// Función que se ejecuta cuando se detecta que el usuario está durmiendo
function onSleepStart() {
  console.log("User is sleeping!");
  remDetected = false;
  accelerometer.start();
}

// Función que se ejecuta cuando se detecta que el usuario se despierta
function onSleepEnd() {
  console.log("User woke up!");
  accelerometer.stop();
  remDetected = false;
}

// Función que se ejecuta cada vez que se recibe una muestra de aceleración
function onAccelerometerData(data) {
  // Se verifica si se detectó REM en la muestra anterior
  if (remDetected) {
    return;
  }

  // Se obtiene la magnitud de la aceleración
  let magnitude = Math.sqrt(
    data.x * data.x + data.y * data.y + data.z * data.z
  );

  // Se agrega la magnitud a la lista de muestras
  sampleList.push(magnitude);

  // Se verifica si se completó la muestra
  if (sampleList.length >= SAMPLE_SIZE) {
    // Se aplica la transformada rápida de Fourier (FFT)
    let fft = new FFT(SAMPLE_SIZE, 25);
    fft.forward(sampleList);

    // Se calcula la potencia en la banda de frecuencia correspondiente a REM
    let frequencyBins = fft.spectrum;
    let power = 0;
    for (let i = 0; i < frequencyBins.length; i++) {
      let frequency = i * 25 / SAMPLE_SIZE;
      if (frequency >= 0.3 && frequency <= 1.5) {
        power += frequencyBins[i];
      }
    }

    // Se verifica si se detectó REM
    if (power >= MIN_REM_CONFIDENCE) {
      console.log(`REM detected with power ${power.toFixed(2)}.`);
      vibration.start("nudge-max");
      setTimeout(() => vibration.stop(), VIBRATION_DURATION);
      remDetected = true;
    }

    // Se vacía la lista de muestras para comenzar una nueva
    sampleList = [];
  }
}

// Función que se ejecuta cuando se inicia la aplicación
function onStart() {
  console.log("App started!");
  sleep.onchange = (state) => {
    if (state === "sleep") {
      onSleepStart();
    } else {
      onSleepEnd();
    }
  };
  bodyPresence.on
}