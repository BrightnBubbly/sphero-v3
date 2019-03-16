// STEPS
// 1. yarn add xpc-connection (use git version with resolutions)
// 2. yarn add btlejuice --unsafe-perm
// 3. yarn add serialport (use pr referenced in package.json)

const noble = require("noble"); // required by sphero js sdk
const sphero = require("sphero");
const keypress = require("keypress");
const rl = require("readline-sync");

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

async function draw() {
  var sides = rl.question("How many sides would you like your shape to have?");

  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  for (var i = 0; i < sides+1; i++) {
  		orb.setHeading((orb.getHeading() + (360/sides)));
  		await delay(0.25);
    }
}

async function createA(roll) {
  // it seems like the roll parameters are in the order angle, duration, speed
  await roll(45, 4, 10);
  await delay(4);
  await roll(135, 4, 10);
  // await delay(4);
  // await roll(315, 2, 10);
  // await delay(2);
  // await roll(270, 1, 10);
  // await delay(1);
  // await roll(90, 1, 10);
  // await delay(1);
  // await roll(135, 1, 10);
}

// once I figure out the delays, each letter will get its own "create" function that will be called in a switch statement
// (which has a case for each letter) within a "spell" function that has the user input something for the bot to spell
// and splits the user input string into an array that gets looped through to spell each letter contained within it

// async function spell() {
//     var response = rl.question("What would you like to write?");
//
//     process.stdin.resume();
//     process.stdin.setEncoding('utf8');
//
//     var characters = response.split('')
//
//     characters.forEach(((function(character) {
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
    // changing the second parameter of the bind changes the speed at which the
    // orb goes every time it is asked to roll
    // changing the third parameter of the roll bind changes the angle at which
    // the bot goes every time. With that said, only two keys will cause the robot
    // to move. With the angle set at 1, the up and down, do not cause the bot
    // to move at, but left and right cause it to go full speed ahead. With the
    // angle set at 100, the case is the same. I was thinking that it might be
    // the keys that most align with the angle that would be "active", but that
    // does not seem to be the case. For a while, it was the down and right keys
    // that were functional. There does not (yet) seem to be a reason why only
    // specific keys work.
    // if a low number (anything less than 100) is given as a 4th parameter and
    // empty single quotes are fed to the "angle" parameter, all 4 arrow keys
    // work, but they all send the bot at roughly a 0 degree angle. The number,
    // itself, does not seem to affect the speed, angle or duration.
    // if a high number (100+) is given as the 4th parameter and empty single quotes are
    // fed to the "angle" parameter, the bot will not go anywhere.
    const roll = orb.roll.bind(orb, 100);

    if (key.name === 'a') {
      console.log("a")
      orb.color(0xff0000);
      createA(roll)
    }

    if (key.ctrl && key.name === "c") {
      process.stdin.pause();
      process.exit(0);
    }

    if (key.name === "d") {
      setInterval(function() { orb.randomColor() }, 1000);
      draw();
    }

    if (key.name === "e") {
      orb.startCalibration();
      setTimeout(function() {
        orb.finishCalibration();
      }, 5000);
    }

    if (key.name === "up") {
      roll(0);
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
