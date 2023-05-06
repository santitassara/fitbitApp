import document from "document";
import { HeartRateSensor } from "heart-rate";
import { Accelerometer } from "accelerometer";
import { Gyroscope } from "gyroscope";

const MINUTE = 60 * 1000;
const HEART_RATE_REFRESH_RATE = 10 * 1000; // 10 seconds
const HRV_REFRESH_RATE = 10 * 1000; // 10 seconds
const ACCEL_REFRESH_RATE = 5 * 1000; // 5 seconds
const GYRO_REFRESH_RATE = 5 * 1000; // 5 seconds

const accelerometer = new Accelerometer({ frequency: ACCEL_REFRESH_RATE });
const gyroscope = new Gyroscope({ frequency: GYRO_REFRESH_RATE });
const hrm = new HeartRateSensor({ frequency: HEART_RATE_REFRESH_RATE });

let lastHR = 0;
let lastHRV = 0;
let lastAccel = null;
let lastGyro = null;
let lastMaxMinDiff = 0;
let lastSleepState = "awake";

let accelData = [];
let gyroData = [];
let hrData = [];
let hrvData = [];

// Start sensors
accelerometer.start();
gyroscope.start();
hrm.start();

// Get UI elements
const sleepStateText = document.getElementById("sleep-state");

// Define function to calculate HRV
function calculateHRV(hrData) {
  const timeDiff = hrData[hrData.length - 1].timestamp - hrData[0].timestamp;
  const intervalCount = Math.floor(timeDiff / (HRV_REFRESH_RATE / 2));
  const intervals = [];
  for (let i = 0; i < intervalCount; i++) {
    intervals.push([]);
  }
  hrData.forEach((hrItem) => {
    const intervalIndex = Math.floor(
      (hrItem.timestamp - hrData[0].timestamp) / (HRV_REFRESH_RATE / 2)
    );
    intervals[intervalIndex].push(hrItem.bpm);
  });
  const sdnn = intervals.map((interval) => {
    const avg = interval.reduce((a, b) => a + b, 0) / interval.length;
    const variance = interval.reduce((a, b) => a + (b - avg) ** 2, 0) / interval.length;
    return Math.sqrt(variance);
  });
  const meanSDNN = sdnn.reduce((a, b) => a + b, 0) / sdnn.length;
  return meanSDNN;
}

// Define function to calculate max-min HR difference
function calculateMaxMinDiff(hrData) {
  const max = Math.max(...hrData.map((hrItem) => hrItem.bpm));
  const min = Math.min(...hrData.map((hrItem) => hrItem.bpm));
  return max - min;
}

// Define function to classify sleep state based on sensor data
function classifySleepState() {
  let sleepState = "awake";
  const currentTime = Date.now();
  const timeDiff = currentTime - hrData[0].timestamp;

  if (timeDiff < MINUTE) {
    return sleepState;
  }

  // Calculate HRV
  if (timeDiff > HRV_REFRESH_RATE) {
    lastHRV = calculateHRV(hrData);
    hrvData.push(lastHRV);
    if (hrvData.length > 6) {
      hrvData.shift();
    }
    hrData.shift();
  }

  // Calculate max-min HR difference
if (hrData.length > 12 && timeDiff > MINUTE) {
  const maxMinDiff = calculateMaxMinDiff(hrData);
  if (maxMinDiff < lastMaxMinDiff) {
  if (lastSleepState !== "deep" && lastSleepState !== "rem") {
  sleepState = "light";
  }
  } else if (maxMinDiff > lastMaxMinDiff) {
  if (lastSleepState === "light") {
  sleepState = "deep";
  } else {
  sleepState = "rem";
  }
  }
  lastMaxMinDiff = maxMinDiff;
  hrData.shift();
  }
  
  // Calculate movement
  if (timeDiff > ACCEL_REFRESH_RATE) {
  const accelValue = Math.sqrt(
  accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2
  );
  const gyroValue = Math.sqrt(
  gyroscope.x ** 2 + gyroscope.y ** 2 + gyroscope.z ** 2
  );
  accelData.push(accelValue);
  gyroData.push(gyroValue);
  if (accelData.length > 12) {
  accelData.shift();
  }
  if (gyroData.length > 12) {
  gyroData.shift();
  }
  lastAccel = accelData.reduce((a, b) => a + b, 0) / accelData.length;
  lastGyro = gyroData.reduce((a, b) => a + b, 0) / gyroData.length;
  }
  
  // Classify sleep state
  if (sleepState !== lastSleepState) {
  lastSleepState = sleepState;
  sleepStateText.text = lastSleepState;
  }
  
  return sleepState;
  }
  
  // Define function to refresh sensor data
  function refreshSensorData() {
  lastHR = hrm.heartRate ? hrm.heartRate : lastHR;
  hrData.push({ bpm: lastHR, timestamp: Date.now() });
  if (hrData.length > 12) {
  hrData.shift();
  }
  
  classifySleepState();
  }
  
  // Refresh sensor data every second
  setInterval(refreshSensorData, 1000);
  
  // Stop sensors when the app is unloaded
  me.addEventListener("unload", () => {
  accelerometer.stop();
  gyroscope.stop();
  hrm.stop();
  });