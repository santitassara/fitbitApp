import clock from "clock";
import document from "document";
import * as messaging from "messaging";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { initialize } from "./sleepTracking";
//import { me } from "appbit";
//import { sleep } from "sleep";
//import { vibration } from "haptics";
//import "./companion.js";
//ACTIVE ZONE REQUEST PERMISSIONS
import { me as appbit } from "appbit";
import { primaryGoal } from "user-activity";


console.log("INICIADO!!");
if (appbit.permissions.granted("access_activity")) {
  console.log(`User's primary activity goal is ${primaryGoal}`);
}

//AZM
import { goals, today } from "user-activity";
console.log(`${goals.activeZoneMinutes.total} activeZoneMinutes Goal`);

goals.addEventListener("reachgoal", (evt) => {
  if (today.adjusted.activeZoneMinutes.total >= goals.activeZoneMinutes.total) {
    // AZM Goal has been met
  }
});

console.log(`${today.local.activeZoneMinutes.fatBurn}`);
console.log(`${today.local.activeZoneMinutes.cardio}`);
console.log(`${today.local.activeZoneMinutes.peak}`);
console.log(`${today.adjusted.activeZoneMinutes.total}`);


// Update the clock every second
clock.granularity = "seconds";

// Get a handle on the <text> element
const myLabel = document.getElementById("myLabel");

// Update the <text> element every tick with the current time & date

let days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat",];
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  myLabel.text = `${hours}:${mins}`;

  myDate.text = days[evt.date.getDay()] + ", "
    + months[evt.date.getMonth()]
    + " " + evt.date.getDate();

}



//HR sensor
import { HeartRateSensor } from "heart-rate";
//Activity
import { today } from 'user-activity';
//Styles
import document from "document";
//Clock
import clock from "clock";
//Battery
import { battery } from "power";
import { charger } from "power";
//Time and Date
import * as util from "../common/utils";
import { preferences } from "user-settings";
import * as battery from "battery"


//Text Elements
let myHR = document.getElementById("myHR");
let mySteps = document.getElementById("mySteps");
let myCalories = document.getElementById("myCalories");
let myAzm = document.getElementById("myAzm")
let myFloors = document.getElementById("myFloors")
let myTime = document.getElementById("myTime")
let myDate = document.getElementById("myDate")
let mySleep = document.getElementById("mySleep")



messaging.peerSocket.onmessage = evt => {
  console.log(`App received: ${JSON.stringify(evt.data)}`);

  console.log(`App received: ${evt.data}`);

  // // Función para detectar la etapa REM del sueño y activar una vibración si es necesario
  // if (me.permissions.granted("access_sleep")) {
  //   //const sleep = new Sleep();
  //   console.log("PERMITIDO");
  // async function detectREM() {
  //   console.log("detectRem");
  //   console.log(sleep.state);
  //   //const stageData = await sleep.stages();
  //   //const sleepState = await sleep.state
  //   //console.log(stageData);
  //   //console.log(sleepState);
  //   console.log(localStorage);

  // console.log(sleep.state === "awake");
  //   if (sleep.state === "awake") {
  //     console.log(localStorage);
  //     console.log("JJJJ");
  //     vibration.start(`${JSON.stringify(evt.data)}`);
  //     // const vibrationIntensity = parseInt(localStorage.getItem("vibrationIntensity")) || 1;
  //     // switch (vibrationIntensity) {
  //     //   case 1:
  //     //     vibration.start("nudge-max");
  //     //     break;
  //     //   case 2:
  //     //     vibration.start("nudge");
  //     //     break;
  //     //   case 3:
  //     //     vibration.start("bump");
  //     //     break;
  //     //   default:
  //     //     vibration.start("nudge-max");
  //     //     break;
  //     // }
  //   }
  // }

  // // sleep.onchange = function() {
  // //   console.log(sleep.state);
  // //   if (sleep.state === "awake") {
  // //     vibration.start("nudge-max");
  // //   } else if (sleep.state === "light" || sleep.state === "deep") {
  // //     vibration.start("ring");
  // //   }
  // // };
  // // sleep.onchange()

  // async function updateSleepStatus() {
  //   console.log("updateSleepStatus");

  //   if (me.permissions.granted("access_sleep")) {
  //   console.log("updateSleepStatus ACCESO");
  //   detectREM();
  //   console.log("no hay sleep");
  //   console.log(sleep.today());

  //     const sleepData = await sleep.today();
  //     if (sleepData) {
  //   console.log("sleepData");

  //     }
  //   }
  //   setTimeout(updateSleepStatus, 5000);
  // }

  // updateSleepStatus();
  // }else{
  //   console.log("Sleep API permission not granted");
  // }



}

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
  const intervalCount = Math.floor(hrData.length / 4);
  const intervals = [];
  for (let i = 0; i < intervalCount; i++) {
    intervals.push([]);
  }
  hrData.forEach((hrItem, index) => {
    const intervalIndex = Math.floor(index / 4);
    if (!intervals[intervalIndex]) {
      intervals[intervalIndex] = [];
    }
    intervals[intervalIndex].push(hrItem);
    console.log(intervals);
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

  const max = Math.max(...hrData);
  const min = Math.min(...hrData);


  return max - min;
}

// Define function to classify sleep state based on sensor data
function classifySleepState() {
  const currentHR = hrm.heartRate ? hrm.heartRate : lastHR;
  const currentAccel = accelerometer.readings ? accelerometer.readings : lastAccel;
  const currentGyro = gyroscope.readings ? gyroscope.readings : lastGyro;
  const currentMaxMinDiff = calculateMaxMinDiff(hrData);


  let sleepState = "awake resting";


  // Calculate HRV
  if (hrData.length === 6) {
    lastHRV = calculateHRV(hrData);
    hrvData.push(lastHRV);
    if (hrvData.length > 60) { // HRV data for the last 10 minutes
      hrvData.shift();
    }
  }
  console.log(lastHRV);
  // Classify sleep state based on sensor data and HRV
  if (currentMaxMinDiff >= 20 && lastMaxMinDiff >= 20 && lastHRV >= 50) {
    sleepState = "awake";
  } else if (currentAccel && currentGyro) {
    const accelSum = currentAccel.reduce((sum, reading) => {
      return sum + Math.abs(reading.x + reading.y + reading.z);
    }, 0);
    const gyroSum = currentGyro.reduce((sum, reading) => {
      return sum + Math.abs(reading.x + reading.y + reading.z);
    }, 0);
    if (accelSum >= 4 && gyroSum >= 0.3) {
      sleepState = "awake";
    }

  } else if (currentMaxMinDiff >= 20 && lastMaxMinDiff >= 20 && lastHRV >= 5) {
    sleepState = "REM";
  } else if (currentMaxMinDiff >= 10 && lastMaxMinDiff >= 10 && lastHRV >= 2) {
    sleepState = "light sleep";
  } else if (currentMaxMinDiff >= 10 && lastMaxMinDiff >= 10 && lastHRV <= 2) {
    sleepState = "deep sleep";
  } else if (currentHR <= 50 && lastHR <= 50 && lastHRV >= 10) {
    sleepState = "light sleep";
  } else if (currentHR <= 50 && lastHR <= 50 && lastHRV >= 10) {
    sleepState = "deep sleep";
  } else if (currentHR <= 70 && lastHR <= 70 && lastHRV >= 5) {
    sleepState = "awake resting";
  } else if (currentHR <= 70 && lastHR <= 70 && lastHRV >= 5) {
    sleepState = "light sleep";
  }

  lastSleepState = sleepState;
  lastHR = currentHR;
  lastAccel = currentAccel;
  lastGyro = currentGyro;
  lastMaxMinDiff = currentMaxMinDiff;

  console.log(lastSleepState);

  // Update UI
  //sleepStateText.text = sleepState;
  return sleepState;
}

// Define function to refresh sensor data
function refreshData() {
  const currentHR = hrm.heartRate ? hrm.heartRate : lastHR;
  const currentAccel = accelerometer.readings ? accelerometer.readings : lastAccel;
  const currentGyro = gyroscope.readings ? gyroscope.readings : lastGyro;


  if (currentHR) {

    hrData.push(currentHR);
    if (hrData.length > 12) {
      hrData.shift();
    }
    console.log(hrData);
  }
  if (currentAccel) {
    accelData.push(currentAccel);
    if (accelData.length > 12) {
      accelData.shift();
    }
  }

  if (currentGyro) {
    gyroData.push(currentGyro);
    if (gyroData.length > 12) {
      gyroData.shift();
    }
  }
  console.log("sleepy");
  // Classify sleep state based on sensor data
  classifySleepState();
  const sleepy = classifySleepState()
  console.log(sleepy);
}
// Refresh data after a minute
setInterval(() => {
  refreshData();
}, 1000);


// Refresh HRV after 10 seconds
setInterval(() => {
  const currentHR = hrm.heartRate ? hrm.heartRate : lastHR;
  if (currentHR) {
    hrvData.push(lastHRV);
    if (hrvData.length > 6) {
      hrvData.shift();
    }
  }
  lastHR = currentHR;
  lastHRV = calculateHRV(hrData);
}, HRV_REFRESH_RATE);

// Refresh accelerometer data after 5 seconds
setInterval(() => {
  const currentAccel = accelerometer.readings ? accelerometer.readings : lastAccel;
  if (currentAccel) {
    accelData.push(currentAccel);
    if (accelData.length > 12) {
      accelData.shift();
    }
  }
  lastAccel = currentAccel;
}, ACCEL_REFRESH_RATE);

// Refresh gyroscope data after 5 seconds
setInterval(() => {
  const currentGyro = gyroscope.readings ? gyroscope.readings : lastGyro;
  if (currentGyro) {
    gyroData.push(currentGyro);
    if (gyroData.length > 12) {
      gyroData.shift();
    }
  }
  lastGyro = currentGyro;
}, GYRO_REFRESH_RATE);

// Refresh UI after a minute
setInterval(() => {
  // Update UI
}, MINUTE);

// Stop sensors when the app is unloaded
document.addEventListener("unload", () => {
  accelerometer.stop();
  gyroscope.stop();
  hrm.stop();
});

//  function refresh_mySleep() {
//   //mySleep.text = "" + sleep.state
//   initialize()
//   };

//    setInterval(refresh_mySleep, 100); 

// function refresh_mySleep() {
//   mySleep.text = "" + sleep.state

//   };

//   setInterval(refresh_mySleep, 100); 
//Add step monitor
function refresh_mySteps() {
  mySteps.text = "" + today.adjusted.steps

};

setInterval(refresh_mySteps, 100);

//Add calories
function refresh_myCalories() {
  myCalories.text = today.adjusted.calories
};

setInterval(refresh_myCalories, 100);

//REFRESH AZM
function refresh_myAzm() {
  myAzm.text = today.adjusted.activeZoneMinutes.total
};
setInterval(refresh_myAzm, 1000);


//Add floors
function refresh_myelevationGain() {


};
setInterval(refresh_myelevationGain, 20)
//Add HR-------------------
//var hrm = new HeartRateSensor();

hrm.start();

function refresh_myHR() {
  myHR.text = hrm.heartRate ? hrm.heartRate : "--";



};

setInterval(refresh_myHR, 50);

