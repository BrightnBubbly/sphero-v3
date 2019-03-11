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
      voltage: state.batteryVoltage, // current battery voltage, scaled in 100ths of a volt
      charges: state.chargeCount, // number of total charges to date
      lastCharged: (state.secondsSinceCharge / 60) + ' ago'// minues since last charge
    };

    return stats;
  } catch (error) {
    console.log("BATTERY ERROR:", error);
  }
}

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
      roll(270, 100, 1);
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

    if (key.name === 't') {
      console.log("What would you like to write?")
    }

    if (key.name === 'a') {
      console.log("a")
      roll(45, 100, 10);
      roll(135, 100, 10);
      roll(315, 100, 2);
      roll(270, 100, 1);
      roll(90, 100, 1);
      roll(135, 100, 1);
    }

  } catch (error) {
    console.log("HANDLE ERROR", error);
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
