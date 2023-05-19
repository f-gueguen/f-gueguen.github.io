let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let lastFrameTimeMs = Date.now();
let fps = 0;

// Create a simple 20x15 grid map
let map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Create a simple 20x15 edges map initialized to 0s
let edges = Array.from({
  length: map.length
}, () => Array.from({
  length: map[0].length
}, () => 0));

for (let y = 1; y < map.length - 1; y++) {
  for (let x = 1; x < map[0].length - 1; x++) {
    if (map[y][x] === 0) continue;
    // Check the four neighboring cells
    if (
      (map[y - 1][x] !== map[y + 1][x]) || // top and bottom
      (map[y][x - 1] !== map[y][x + 1]) // left and right
    ) {
      edges[y][x] = 1; // This cell is an edge
    }
  }
}

// Initialize the player position and direction
let player = {
  x: 6,
  y: 3,
  z: 0,
  vz: 0,
  dir: 32
};

let enemy = {
  x: 15,
  y: 11
};

let score = 0;

let keys = {};

let projectiles = [];

// Listen for keydown and keyup events to keep track of which keys are pressed
window.addEventListener("keydown", function(e) {
  keys[e.key] = true;
});

window.addEventListener("keyup", function(e) {
  keys[e.key] = false;
});

function updatePlayer() {
  if (keys["ArrowUp"]) {
    // Move forward
    let newX = player.x + Math.cos(player.dir * Math.PI / 180) * 0.1;
    let newY = player.y + Math.sin(player.dir * Math.PI / 180) * 0.1;

    if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
      player.x = newX;
      player.y = newY;
    }
  }

  if (keys["ArrowDown"]) {
    // Move backward
    let newX = player.x - Math.cos(player.dir * Math.PI / 180) * 0.1;
    let newY = player.y - Math.sin(player.dir * Math.PI / 180) * 0.1;

    if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
      player.x = newX;
      player.y = newY;
    }
  }

  if (keys["ArrowLeft"]) {
    // Turn left
    player.dir -= 2;
  }

  if (keys["ArrowRight"]) {
    // Turn right
    player.dir += 2;
  }

  if (keys["b"]) {
    let projectile = {
      x: player.x,
      y: player.y,
      dir: player.dir
    };
    projectiles.push(projectile);
    keys["b"] = false;
  }

  if (keys[" "]) {
    // Jump
    if (player.z == 0) { // The player can only jump if they are standing on the floor
      player.vz = 0.05; // Set the initial vertical velocity
    }
  }

  // Update the vertical position and velocity
  player.z += player.vz;
  player.vz -= 0.01; // Gravity

  // Make sure the player can't fall through the floor
  if (player.z < 0) {
    player.z = 0;
    player.vz = 0;
  }
}

function moveEnemy() {
  let dx = Math.random() - 0.5;
  let dy = Math.random() - 0.5;
  let newX = enemy.x + dx * 0.05;
  let newY = enemy.y + dy * 0.05;

  if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
    enemy.x = newX;
    enemy.y = newY;
  }
}

function updateProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    let proj = projectiles[i];

    // Move the projectile in the direction it was shot.
    proj.x += Math.cos(proj.dir * Math.PI / 180) * 0.2;
    proj.y += Math.sin(proj.dir * Math.PI / 180) * 0.2;

    // Check for collision with the enemy.
    if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < 0.2) {
      // Respawn the enemy at a new location.
      enemy.x = Math.floor(Math.random() * map[0].length);
      enemy.y = Math.floor(Math.random() * map.length);
      while (map[Math.floor(enemy.y)][Math.floor(enemy.x)] !== 0) {
        enemy.x = Math.floor(Math.random() * map[0].length);
        enemy.y = Math.floor(Math.random() * map.length);
      }

      score++;
      projectiles.splice(i, 1); // Remove the projectile.
      i--;
    }
  }
}

// Get the size of the window
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

let maxWidth = windowHeight * (16 / 9);
let maxHeight = windowWidth * (9 / 16);

if (windowWidth > maxWidth) {
  canvas.width = maxWidth;
  canvas.height = maxWidth * (9 / 16);
} else {
  canvas.width = maxHeight * (16 / 9);
  canvas.height = maxHeight;
}

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;
const PROJECTION_WIDTH = SCREEN_WIDTH;
const MAP_WIDTH = 100;
const MAP_HEIGHT = MAP_WIDTH;
const RAY_QTY = 60 * 4; // Default 60
const RAY_STEP = 0.008 // Default 0.1

// Draw the 3D projection
const draw3D = () => {
  let previousDist = 0;
  let previousHeight = 0;
  let previousSlope = 0;

  for (let ray = 0; ray < RAY_QTY; ray++) {
    let rayDir = player.dir + ray / (RAY_QTY / 60) - 30;
    let dist = 0;
    let hitWall = false;
    let isEdge = false;

    while (true) {
      let x = player.x + Math.cos(rayDir * Math.PI / 180) * dist;
      let y = player.y + Math.sin(rayDir * Math.PI / 180) * dist;

      if (map[Math.floor(y)][Math.floor(x)] === 1) {
        isEdge = edges[Math.floor(y)][Math.floor(x)] === 1;
        hitWall = true;
        break;
      }

      dist += RAY_STEP;
    }

    let height = SCREEN_HEIGHT / (dist + 0.0001);

    let currentSlope = (height - previousHeight === 0) ? previousSlope : height - previousHeight;

    // Detect sharp changes in distance or corners in the wall
    let isBorder = isEdge && Math.abs(previousDist - dist) > 0.5 || (previousSlope > 0 && currentSlope < 0) || (previousSlope < 0 && currentSlope > 0);

    if (isBorder) {
      ctx.fillStyle = '#000'; // Draw border
    } else {
      ctx.fillStyle = '#EEE';
    }

    ctx.fillRect(ray * (PROJECTION_WIDTH / RAY_QTY), (SCREEN_HEIGHT - height) / 2 - player.z * SCREEN_HEIGHT, PROJECTION_WIDTH / RAY_QTY, height); // Subtract player.z * SCREEN_HEIGHT from the y coordinate


    // Draw a black dot at the top of the wall
    ctx.fillStyle = '#000';
    let borderHeight = Math.max(1, Math.round(10 / dist)); // Border height scales with distance
    ctx.fillRect(ray * (PROJECTION_WIDTH / RAY_QTY), (SCREEN_HEIGHT - height) / 2 - player.z * SCREEN_HEIGHT, PROJECTION_WIDTH / RAY_QTY, borderHeight);

    previousDist = dist;
    previousHeight = height;
  }
}


function drawRadarMap() {
  // Draw the top-down map
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 1) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(x * (MAP_WIDTH / map.length), y * (MAP_HEIGHT / map.length), MAP_WIDTH / map.length, MAP_HEIGHT / map.length);
      }
    }
  }

  // Draw the player on the map
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(player.x * (MAP_WIDTH / map.length) - 2, player.y * (MAP_HEIGHT / map.length) - 2, 4, 4);
  ctx.beginPath();
  ctx.moveTo(player.x * (MAP_WIDTH / map.length), player.y * (MAP_HEIGHT / map.length));
  ctx.lineTo((player.x + Math.cos(player.dir * Math.PI / 180)) * (MAP_WIDTH / map.length), (player.y + Math.sin(player.dir * Math.PI / 180)) * (MAP_HEIGHT / map.length));
  ctx.stroke();

  // Draw the enemy on the map
  ctx.fillStyle = "#0000FF";
  ctx.fillRect(MAP_WIDTH + enemy.x * (MAP_WIDTH / map.length), enemy.y * (MAP_HEIGHT / map.length), MAP_WIDTH / map.length, MAP_HEIGHT / map.length);
}

function drawFPS() {
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.textAlign = 'end';
  ctx.fillText('FPS: ' + fps, canvas.width - 10, 20);
}

function draw(currentTime) {
  let delta = currentTime - lastFrameTimeMs;
  lastFrameTimeMs = currentTime;
  fps = Math.round(1000 / delta);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  draw3D();
  drawRadarMap();
  drawFPS();

  updatePlayer();
  moveEnemy();
  updateProjectiles();

  requestAnimationFrame(draw);
}

window.addEventListener('DOMContentLoaded', (event) => {
  draw();
});
