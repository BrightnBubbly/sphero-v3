// STEPS
// 1. yarn add xpc-connection (use git version with resolutions)
// 2. yarn add btlejuice --unsafe-perm
// 3. yarn add serialport (use pr referenced in package.json)

const noble = require("noble"); // required by sphero js sdk
const sphero = require("sphero");
const keypress = require("keypress");

// init
const orb = sphero("/dev/tty.Sphero-ORG-AMP-SPP"); // change BLE address accordingly (get address by running ls -a /dev | grep tty.Sphero)

async function init() {
  try {
    process.stdin.resume();
    await orb.connect(listen);

    // print system/battery state
    console.log(await battery());
  } catch (error) {
    console.log("::CONNECTION ERROR", error);
  }
}

async function battery() {
  try {
    const state = await orb.getPowerState();

    const stats = {
      system: state.batteryState, // high-level state of the power system
      voltage: state.batteryVoltage + ' * 100 volts', // current battery voltage, scaled in 100ths of a volt
      charges: state.chargeCount + ' lifetime charges', // number of total charges to date
      lastCharged: (state.secondsSinceCharge / 60) + ' min ago'// minues since last charge
    };

    return stats;
  } catch (error) {
    console.log("BATTERY ERROR:", error);
  }
}

// once I figure out the delays, each letter will get its own "create" function that will be called in a switch statement
// (which has a case for each letter) within a "spell" function that has the user input something for the bot to spell
// and splits the user input string into an array that gets looped through to spell each letter contained within it

// async function spell(string) {
//     var rl = require('readline-sync');
//     var response = '';
//
//     response = rl.question("What would you like to write?");
//
//     process.stdin.resume();
//     process.stdin.setEncoding('utf8');
//
//     var characters = response.split('')
//
//     characters.forEach((character) => {
//       switch (character) {
//         case a:
//           console.log("a")
//           roll(20, 45, 4);
//           await delay(4);
//           roll(20, 135, 4);
//           await delay(4);
//           roll(315, 20, 2);
//           await delay(2);
//           roll(270, 20, 1);
//           await delay(1);
//           roll(90, 20, 1);
//           await delay(1);
//           roll(135, 20, 1);
//           break;
//         default:
//           console.log('sorry, I don\'t understand')
//       }
//     })
// }

async function handle(ch, key) {
  try {
    const stop = orb.roll.bind(orb, 0, 0);
    const roll = orb.roll.bind(orb, 60);

    if (key.ctrl && key.name === "c") {
      // TODO on start get pid and store it to a variable and kill the process
      console.log(process.pid)

      process.stdin.pause();
      process.exit(0);
    }

    if (key.name === "e") {
      orb.startCalibration();
      setTimeout(() => {
        orb.finishCalibration();
      }, 5000);
    }

    if (key.name === "up") {
      roll(0, 50, 10);
      orb.color(0xff0000);
      console.log("UP");
    }

    if (key.name === "down") {
      roll(180);
      orb.color(0xC0FFEE);
      console.log("DOWN");
    }

    if (key.name === "left") {
      roll(270);
      orb.color(0xf4de98);
      console.log("LEFT");
    }

    if (key.name === "right") {
      roll(90);
      orb.color(0xd4fe98);
      console.log("RIGHT");
    }

    if (key.name === "space") {
      stop();
    }

    if (key.name === 'a') {
      console.log("a")
      orb.color(0xff0000);
      roll(20, 45, 4);
      await delay(4);
      roll(20, 135, 4);
      await delay(4);
      roll(315, 20, 2);
      await delay(2);
      roll(270, 20, 1);
      await delay(1);
      roll(90, 20, 1);
      await delay(1);
      roll(135, 20, 1);
    }

    // if (key.name === 's') {
    // spell ()
    // }

  } catch (error) {
    console.log("HANDLE ERROR", error);

    process.stdin.pause();
    process.exit(0);
  }
}

async function listen() {
  try {
    keypress(process.stdin);
    process.stdin.on("keypress", handle);

    console.log("Starting to listen for arrow key presses...");

    process.stdin.setRawMode(true);
    process.stdin.resume();
  } catch (error) {
    console.log("::LISTEN ERROR", error);
  }
}

init();
