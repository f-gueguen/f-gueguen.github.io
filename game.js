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
  dir: 32,
  life: 2,
  score: 0,
  kills: 0
};

let enemy = {
  x: 15,
  y: 11,
  radius: 0.5,
  life: 2,
  score: 0,
  kills: 0
};

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
  if (keys["w"]) {
    // Move forward
    let newX = player.x + Math.cos(player.dir * Math.PI / 180) * 0.1;
    let newY = player.y + Math.sin(player.dir * Math.PI / 180) * 0.1;

    if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
      player.x = newX;
      player.y = newY;
    }
  }

  if (keys["s"]) {
    // Move backward
    let newX = player.x - Math.cos(player.dir * Math.PI / 180) * 0.1;
    let newY = player.y - Math.sin(player.dir * Math.PI / 180) * 0.1;

    if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
      player.x = newX;
      player.y = newY;
    }
  }

  if (keys["ArrowLeft"]) {
    // Left strafe
    let newX = player.x - Math.cos((player.dir + 90) * Math.PI / 180) * 0.1;
    let newY = player.y - Math.sin((player.dir + 90) * Math.PI / 180) * 0.1;

    if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
      player.x = newX;
      player.y = newY;
    }
  }

  if (keys["ArrowRight"]) {
    // Right strafe
    let newX = player.x - Math.cos((player.dir - 90) * Math.PI / 180) * 0.1;
    let newY = player.y - Math.sin((player.dir - 90) * Math.PI / 180) * 0.1;

    if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
      player.x = newX;
      player.y = newY;
    }
  }

  if (keys["a"]) {
    // Turn left
    player.dir -= 2;
  }

  if (keys["d"]) {
    // Turn right
    player.dir += 2;
  }

  if (keys[" "]) {
    let projectile = {
      x: player.x,
      y: player.y,
      dir: player.dir
    };
    projectiles.push(projectile);
    keys[" "] = false;
  }

  if (keys["ArrowUp"]) {
    // Jump
    if (player.z == 0) { // The player can only jump if they are standing on the floor
      player.vz = -0.04; // Set the initial vertical velocity
    }
  }

  // Update the vertical position and velocity
  player.z += player.vz;
  player.vz += 0.005; // Gravity

  // Make sure the player can't fall through the floor
  if (player.z > 0) {
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

function respawn(player) {
  player.x = Math.floor(Math.random() * map[0].length);
  player.y = Math.floor(Math.random() * map.length);
  while (map[Math.floor(enemy.y)][Math.floor(enemy.x)] !== 0) {
    player.x = Math.floor(Math.random() * map[0].length);
    player.y = Math.floor(Math.random() * map.length);
  }
  player.life = 2;

  player.z = 0;
  player.vz = 0;
  player.dir = Math.floor(Math.random() * 360);
}

function updateProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    let proj = projectiles[i];

    // Move the projectile in the direction it was shot.
    proj.x += Math.cos(proj.dir * Math.PI / 180) * 0.2;
    proj.y += Math.sin(proj.dir * Math.PI / 180) * 0.2;

    // Check for collision with wall.
    if (map[Math.floor(proj.y)][Math.floor(proj.x)] === 1) {
      projectiles.splice(i, 1); // Remove the projectile.
      i--;
      continue;
    }

    // Check for collision with the enemy.
    if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < 0.2) {
      enemy.life -= 1;
      if (enemy.life <= 0) {
        // Respawn the enemy at a new location.
        respawn(enemy);
        player.score += 3;
        player.kills += 1;
      } else {
        player.score += 1;
      }

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
const FOV = 120 // Default 60
const RAY_QTY = FOV * 2; // Default 60
const RAY_STEP = 0.01 // Default 0.1

// Draw the 3D projection
function draw3D() {
  let previousDist = 0;
  let previousHeight = 0;
  let previousSlope = 0;
  let zBuffer = Array(RAY_QTY).fill(0);

  for (let ray = 0; ray < RAY_QTY; ray++) {
    let rayDir = player.dir + ray / (RAY_QTY / FOV) - FOV / 2;
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

    let slope = (height - previousHeight === 0) ? previousSlope : height - previousHeight;

    let changeSlope = isEdge && ((previousSlope > 0 && slope < 0) || (previousSlope < 0 && slope > 0));

    // Detect sharp changes in distance or corners in the wall
    let isBorder = isEdge && Math.abs(previousDist - dist) > 0.5;

    if (isBorder) {
      ctx.fillStyle = '#000';
    } else {
      ctx.fillStyle = '#EEE';
    }

    ctx.fillRect(ray * (PROJECTION_WIDTH / RAY_QTY), (SCREEN_HEIGHT - height) / 2 - player.z * SCREEN_HEIGHT, PROJECTION_WIDTH / RAY_QTY, height); // Subtract player.z * SCREEN_HEIGHT from the y coordinate

    if (changeSlope) {
      ctx.fillStyle = '#000';
      // Display the border at the previous ray position
      ctx.fillRect((ray - 1) * (PROJECTION_WIDTH / RAY_QTY), (SCREEN_HEIGHT - previousHeight) / 2 - player.z * SCREEN_HEIGHT, PROJECTION_WIDTH / RAY_QTY, previousHeight);
    }

    // Draw a black dot at the top of the wall
    ctx.fillStyle = '#000';
    let borderHeight = Math.max(1, Math.round(10 / dist)); // Border height scales with distance
    ctx.fillRect(ray * (PROJECTION_WIDTH / RAY_QTY), (SCREEN_HEIGHT - height) / 2 - player.z * SCREEN_HEIGHT, PROJECTION_WIDTH / RAY_QTY, borderHeight);

    previousDist = dist;
    previousHeight = height;
    previousSlope = slope;
    zBuffer[ray] = previousDist;
  }

  // Draw enemy
  displaySprite3D(enemy, zBuffer);



  // Draw projectiles
  for (let i = 0; i < projectiles.length; i++) {
    let proj_dx = projectiles[i].x - player.x;
    let proj_dy = projectiles[i].y - player.y;
    let proj_dist = Math.sqrt(proj_dx * proj_dx + proj_dy * proj_dy);
    let proj_angle = ((Math.atan2(proj_dy, proj_dx) * 180 / Math.PI) - player.dir + 360) % 360;
    if (proj_angle > 180) proj_angle -= 360;
    let proj_height = SCREEN_HEIGHT / (proj_dist + 0.0001);
    let proj_center = (proj_angle / FOV + 0.5) * SCREEN_WIDTH;

    let projRay = Math.floor(proj_center / (PROJECTION_WIDTH / RAY_QTY));

    if (projRay >= 0 && projRay < RAY_QTY && proj_dist < zBuffer[projRay]) {
      // Draw projectiles as squares
      ctx.fillStyle = "green";
      ctx.fillRect(proj_center - proj_height / 2, (SCREEN_HEIGHT - proj_height) / 2, proj_height, proj_height);
    }
  }
}

function drawVisor() {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'; // white color with 50% opacity
  ctx.lineWidth = 2;

  // Draw horizontal line
  ctx.beginPath();
  ctx.moveTo(SCREEN_WIDTH / 2 - 20, SCREEN_HEIGHT / 2);
  ctx.lineTo(SCREEN_WIDTH / 2 + 20, SCREEN_HEIGHT / 2);
  ctx.stroke();

  // Draw vertical line
  ctx.beginPath();
  ctx.moveTo(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);
  ctx.lineTo(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 20);
  ctx.stroke();

  ctx.restore();
}


function displaySprite3D(sprite, zBuffer) {
  let sprite_dx = sprite.x - player.x;
  let sprite_dy = sprite.y - player.y;
  let spriteDist = Math.sqrt(sprite_dx * sprite_dx + sprite_dy * sprite_dy);

  // Angle between player's direction and the sprite, in degrees
  let spriteAngle = ((Math.atan2(sprite_dy, sprite_dx) * 180 / Math.PI) - player.dir + 540) % 360 - 180;
  if (spriteAngle > 180) spriteAngle -= 360;

  let spriteHeight = SCREEN_HEIGHT / (spriteDist + 0.0001);
  // Center of the sprite on screen, as a fraction of FOV
  let spriteCenterAngle = spriteAngle / FOV + 0.5;
  let spriteCenter = spriteCenterAngle * SCREEN_WIDTH;

  // The width of the sprite on screen, in degrees
  let spriteWidthAngle = Math.abs(Math.atan2(sprite.radius, spriteDist) * 180 / Math.PI);

  // Start and end of the sprite on screen, as ray indexes
  let spriteStartRay = Math.floor((spriteCenterAngle - spriteWidthAngle / FOV / 2) * RAY_QTY);
  let spriteEndRay = Math.floor((spriteCenterAngle + spriteWidthAngle / FOV / 2) * RAY_QTY);

  // Only draw the sprite if it is within the player's FOV
  if (spriteStartRay >= 0 && spriteEndRay < RAY_QTY) {
    for (let ray = spriteStartRay; ray <= spriteEndRay; ray++) {
      if (spriteDist < zBuffer[ray]) {
        let height = spriteHeight * (1 - Math.abs(ray - spriteCenter) / (spriteEndRay - spriteStartRay));
        ctx.fillStyle = "blue";
        ctx.fillRect(ray * (PROJECTION_WIDTH / RAY_QTY), (SCREEN_HEIGHT - spriteHeight) / 2, PROJECTION_WIDTH / RAY_QTY, spriteHeight);
      }
    }
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
  ctx.fillRect(enemy.x * (MAP_WIDTH / map.length), enemy.y * (MAP_HEIGHT / map.length), MAP_WIDTH / map.length, MAP_HEIGHT / map.length);

  // Draw the projectiles on the map
  ctx.fillStyle = "#00FF00";
  for (let i = 0; i < projectiles.length; i++) {
    let proj = projectiles[i];
    ctx.fillRect(proj.x * (MAP_WIDTH / map.length) - 1, proj.y * (MAP_HEIGHT / map.length) - 1, 2, 2);
  }
}


function displayStats() {
  ctx.fillStyle = "black";
  ctx.textAlign = 'end';
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${player.score}`, canvas.width - 15, 20);
  ctx.fillText(`Kills: ${player.kills}`, canvas.width - 15, 40);
  ctx.font = '12px Arial';
  ctx.fillText(`FPS: ${fps}`, canvas.width - 10, canvas.height);
}

function draw(currentTime) {
  let delta = currentTime - lastFrameTimeMs;
  lastFrameTimeMs = currentTime;
  fps = Math.round(1000 / delta);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  draw3D();
  drawRadarMap();
  drawVisor();
  displayStats();

  updatePlayer();
  moveEnemy();
  updateProjectiles();

  requestAnimationFrame(draw);
}

window.addEventListener('DOMContentLoaded', (event) => {
  draw();
});
