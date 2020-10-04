import document from "document";
import exercise from "exercise";
import { display } from "display";
import { battery } from "power";
import { user } from "user-profile"
import { me } from "appbit";

const LaatZien = { ONBEKEND:0, HARTSLAG:1, PUNTEN:2, UIT:3}
    
var KM=0,PUNTEN=0,HARTSLAG=0,MINUTEN=0,DISPLAY=LaatZien.HARTSLAG,PREV_HARTSLAG=0,
    QUIT_TELLER=6;

// Hartslagzones
var HART100=user.maxHeartRate;
if(!HART100) HART100=172;
let HART70 = HART100*0.7;
let HART80 = HART100*0.8;
let HART90 = HART100*0.9;
let ZONE_D2=0,ZONE_D3=0,ZONE_W=0; // Tijd in seconden in die zone
console.log("Max hartslag="+HART100)

let Wissel = document.getElementById("BtnWissel");
let Quit = document.getElementById("BtnQuit");
let TxtInfo = document.getElementById("TxtInfo");
let TxtUnit = document.getElementById("TxtUnit");
let BarAccu = document.getElementById("BarAccu");
let BarTijd = document.getElementById("BarTijd");

// KLeuren
let WIT   = "#999999";
let ROOD  = "#D90000";
let CYAN  = "#00B1D9";
let GEEL  = "#D9B800";
    
exercise.start("bootcamp",{disableTouch:true,autopause:false});
setInterval(update,3000);

//clock.granularity = "minutes";
//clock.ontick = (evt) => {
 //tijd = convertUTCDateToLocalDate(evt.date).toLocaleTimeString();
 //MINUTEN++;
//}

Wissel.onactivate = function(evt) {
 DISPLAY++;
 if(DISPLAY>LaatZien.UIT) DISPLAY=LaatZien.HARTSLAG;
 console.log(DISPLAY);
 ToonInfo();
 QUIT_TELLER=6;
}

Quit.onactivate = function(evt) {
 QUIT_TELLER--;  
 console.log(QUIT_TELLER);
 TxtInfo.text = QUIT_TELLER; TxtUnit.text=""; 
 TxtInfo.style.fill=WIT;
 if(QUIT_TELLER<=0)
  me.exit();
}

function ToonInfo() {
 switch(DISPLAY) {
  case LaatZien.HARTSLAG: 
   TxtInfo.text = HARTSLAG; TxtUnit.text="BPM"; 
   TxtInfo.style.fill=ROOD;
   break;
  case LaatZien.PUNTEN: 
   TxtInfo.text = Math.round(PUNTEN); TxtUnit.text="";
   TxtInfo.style.fill=WIT;
   break;  
  case LaatZien.UIT:  
   TxtInfo.text = HARTSLAG; TxtUnit.text="*** UIT ***";
   TxtInfo.style.fill=ROOD;
   break;  
 }
}

function update() {
 // Elke 3 seconden
 var h = exercise.stats.heartRate.current; 
 if(h) {
  PREV_HARTSLAG=HARTSLAG;
  HARTSLAG=h;
  if(PREV_HARTSLAG>0 && HARTSLAG>0) {
   var gemiddeld = (HARTSLAG+PREV_HARTSLAG)/2;
   if(gemiddeld>HART90) ZONE_W+=3;
   else if(gemiddeld>HART80) ZONE_D3+=3; 
   else if(gemiddeld>HART70) ZONE_D2+=3; 
   // Bereken fitnesspunten deze sessie
   PUNTEN=(ZONE_W/60.0)*32.0 +
    (ZONE_D3/60.0)*20.0 +
    (ZONE_D2/60.0)*5.0;    
  }
 }
 if(!HARTSLAG) HARTSLAG="...";
 MINUTEN = Math.round(exercise.stats.activeTime/1000/60);
 ToonInfo(); 
  
 // Accustatus
 BarAccu.width=battery.chargeLevel*3.48;//+"%"; 
 // Tijdbalk (100% is een uur)
 BarTijd.width=exercise.stats.activeTime/1000/60*1.66666667;
}

display.addEventListener("change", () => {
 if (display.on) {
  // Doe niets
 } 
 else  {
  if(DISPLAY!=LaatZien.UIT)
   // Zorg dat het scherm aan blijft  
   display.on = true;
 }
});

document.onkeypress = function(e) {
 // Zorg dat je niet kunt stoppen met onopdrul
 console.log("Key pressed: " + e.key);
 e.preventDefault();
}