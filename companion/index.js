import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { vibration } from "./haptics";



settingsStorage.addEventListener("change", (evt) => {
  if (evt.key === "vibrationIntensity") {
    const intensity = parseInt(JSON.parse(evt.newValue).values.map((v)=>v.value));
    console.log(intensity);
    // let data = {
    //   key: evt.key,
    //   newValue: evt.newValue
    // };
    //sendVal(data);
    switch (intensity) {
      case 1:
        console.log("Starting nudge-max pattern");
        sendVal("nudge-max");
        break;
      case 2:
        console.log("Starting nudge pattern");
        sendVal("nudge");
        break;
      case 3:
        console.log("Starting bump pattern");
        sendVal("bump");
        break;
      default:
        console.log("Starting default nudge-max pattern");
        sendVal("nudge-max");
        break;
    }
  }
});


function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

messaging.peerSocket.onopen = () => {
  console.log("Companion socket open");
};

messaging.peerSocket.onerror = (err) => {
  console.log(`Companion error: ${err.code} - ${err.message}`);
};

async function fetchSleepData(accessToken)  {
  let date = new Date();
  let todayDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; //YYYY-MM-DD
  let YesterdayDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()-1}`;
  // Sleep API docs - https://dev.fitbit.com/reference/web-api/sleep/
  await fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${YesterdayDate}.json`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  })
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    console.log(data.sleep);
    let myData = {
      data: data.sleep
    }
    sendVal(myData)
  })
  .catch(err => console.log('[FETCH]: ' + err));
}

// A user changes Settings
settingsStorage.addEventListener("change", (evt) => {
  console.log("HAPPENS");
  if (evt.key === "oauth") {
    // Settings page sent us an oAuth token
    let data = JSON.parse(evt.newValue);
    fetchSleepData(data.access_token) ;
  }
}
);



// Restore previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key && key === "oauth") {
      // We already have an oauth token
      let data = JSON.parse(settingsStorage.getItem(key))
      fetchSleepData(data.access_token);
    }
  }
}

// Message socket opens
messaging.peerSocket.onopen = () => {
  restoreSettings();
};