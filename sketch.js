// RELEASE - 1.1.2 (WR Edition - HighScore Verified)
var playerX = 200;
var playerY = 350;
var playerSpeed = 5;
var playerSize = 5;
var score = 0;
var lastMilestone = -1;
var obstacles = [];
var obstacleSpeed = 2.5;
var gameOverFlag = false;
var playerColor = [0, 0, 255];
var gameRunning = true;
var showBreakCheck = false;
var breakCheckTimer = 0;
var lastColorChangeScore = 0;
var obstacleColor = "red";
var isInvincible = false;
var slowActive = false;
var slowCooldown = false;
var slowStartTime = 0;
var cooldownStartTime = 0;
var slowUnlocked = false;
var slowUnlockTime = null;
var highScore = 0;
var isPaused = false;
var highScoreCount = true;
var worldRecord = 0; // WR

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER, CENTER);
  textSize(18);
  frameRate(60);
  getWorldRecord();
}

function draw() {
  if (!gameRunning) return;
  if (isPaused) {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    fill(255);
    text("PAUSED", width / 2, height / 2);
    return;
  }

  background(220);

  if (score >= 10 && score % 10 === 0 && obstacleSpeed <= 8) {
    obstacleSpeed *= 1.005;
  }

  if (score % 500 === 0 && score !== 0 && score !== lastMilestone) {
    obstacleSpeed *= 0.25;
    lastMilestone = score;
    showBreakCheck = true;
    breakCheckTimer = millis();
  } else if (lastMilestone !== -1 && score === lastMilestone + 10) {
    obstacleSpeed = 9;
  }

  if (showBreakCheck && millis() - breakCheckTimer < 2000) {
    fill(255, 0, 0);
    text("BREAK CHECK", width / 2, height / 2);
  } else {
    showBreakCheck = false;
  }

  if (score >= 50 && score % 50 === 0 && score !== lastColorChangeScore) {
    obstacleColor = color(random(30, 225), random(30, 225), random(30, 225));
    lastColorChangeScore = score;
  }

  if (keyIsDown(73) && keyIsDown(78)) {
    isInvincible = true;
    highScoreCount = false;
  } else {
    isInvincible = false;
  }

  var currentSpeed = keyIsDown(16) ? playerSpeed / 2 : playerSpeed;
  var currentObstacleSpeed = obstacleSpeed;

  if (keyIsDown(38) || keyIsDown(87)) {
    currentObstacleSpeed *= 3;
  }

  if (slowActive) {
    currentObstacleSpeed *= 1 / 3;
    if (millis() - slowStartTime >= 5000) {
      slowActive = false;
      slowCooldown = true;
      cooldownStartTime = millis();
    }
  }

  if (slowCooldown && millis() - cooldownStartTime >= 25000) {
    slowCooldown = false;
  }

  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    playerX -= currentSpeed;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    playerX += currentSpeed;
  }

  if (playerX > width || playerX < 0) {
    gameOver();
  }

  if (frameCount % 10 === 0) {
    spawnObstacle();
  }

  for (var i = 0; i < obstacles.length; i++) {
    var obstacle = obstacles[i];
    obstacle.y += currentObstacleSpeed;

    fill(obstacleColor);
    rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    if (!isInvincible && collides(obstacle)) {
      gameOver();
    }

    if (obstacle.y > height) {
      obstacles.splice(i, 1);
      score++;
    }
  }

  if (!gameOverFlag) {
    fill(0);
    text("Score: " + score, width / 2, 30);
    text("High Score: " + highScore, width / 2, 50);
  }

  if (slowCooldown) {
    fill(0);
    textSize(16);
    text("Slowdown cooling down...", width / 2, height - 30);
  }

  if (gameOverFlag) {
    drawGameOverText();
  }

  fill(isInvincible ? [255, 255, 0] : playerColor);
  ellipse(playerX, playerY, playerSize, playerSize);

  if (keyIsDown(38) || keyIsDown(87)) {
    fill(0, 0, 0);
    text("TURBO MODE!", width / 2, 70);
  }

  if (score >= 100 && slowUnlockTime === null) {
    slowUnlockTime = millis();
    slowUnlocked = true;
  }

  if (slowUnlockTime !== null && millis() - slowUnlockTime < 5000) {
    fill(0, 128, 255);
    text("Slowmode unlocked:\nPress ↓ or S for 5s slow (25s cooldown)", width / 2, playerY + 30);
  }

  if ((keyCode === 40 || keyCode === 83) && !slowActive && !slowCooldown && slowUnlocked) {
    slowActive = true;
    slowStartTime = millis();
  }
}

function spawnObstacle() {
  var obstacleWidth = random(30, 60);
  var obstacleHeight = random(20, 40);
  var spawnAbovePlayer = random() < 0.3;
  var obstacleX = spawnAbovePlayer ? playerX + random(-30, 30) : random(0, width - obstacleWidth);
  obstacles.push({ x: obstacleX, y: -obstacleHeight, width: obstacleWidth, height: obstacleHeight });
}

function collides(obstacle) {
  var distX = abs(playerX - obstacle.x - obstacle.width / 2);
  var distY = abs(playerY - obstacle.y - obstacle.height / 2);
  return distX <= (obstacle.width / 2 + playerSize / 2) && distY <= (obstacle.height / 2 + playerSize / 2);
}

function gameOver() {
  gameRunning = false;
  gameOverFlag = true;
  playerColor = [255, 255, 255];
  slowUnlocked = false;

  if ((score > highScore) && highScoreCount) {
    highScore = score;
  }

  if (highScore > worldRecord) {
    updateWorldRecord(highScore);
    worldRecord = highScore;
  }

  drawGameOverText();
}

function drawGameOverText() {
  fill(0, 0, 0, 100);
  rect(0, 0, width, height);
  fill(255);
  textSize(32);
  text("Game Over", width / 2, height / 2);
  textSize(18);
  text("Final Score: " + score, width / 2, height / 2 + 40);
  text("WR: " + worldRecord, width / 2, height / 2 + 65);
  text("Click or press any key to reset", width / 2, height / 2 + 95);
}

function mousePressed() {
  if (gameOverFlag) resetGame();
}

function keyPressed() {
  if (keyCode === 80 || keyCode === 27) {
    isPaused = !isPaused;
    return;
  }
  if (gameOverFlag) {
    if (keyCode !== 37 && keyCode !== 39 && keyCode !== 65 && keyCode !== 68) {
      resetGame();
    }
  }
}

function resetGame() {
  playerX = 200;
  playerY = 350;
  playerSpeed = 5;
  score = 0;
  obstacles = [];
  obstacleSpeed = 2.5;
  gameOverFlag = false;
  playerColor = [0, 0, 255];
  gameRunning = true;
  lastColorChangeScore = 0;
  obstacleColor = "red";
  slowActive = false;
  slowCooldown = false;
  slowStartTime = 0;
  cooldownStartTime = 0;
  slowUnlockTime = null;
  highScoreCount = true;
  loop();
}

// ----------- WORLD RECORD FUNCTIONS -------------

async function getWorldRecord() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/RedstoneNG/Falling-Block-WR/main/wr.json");
    const data = await res.json();
    worldRecord = data.highScore;
  } catch (err) {
    console.error("Failed to fetch WR:", err);
  }
}

async function updateWorldRecord(score) {
  const token = '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';
  const repo = 'RedstoneNG/Falling-Block-WR';
  const path = 'wr.json';
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  const newData = {
    highScore: score
  };

  try {
    const getRes = await fetch(url, {
      headers: {
        Authorization: `token ${token}`
      }
    });

    if (!getRes.ok) {
      throw new Error(`GET failed: ${await getRes.text()}`);
    }

    const { sha } = await getRes.json();

    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `New WR: ${score}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2)))), // safely encode
        sha
      })
    });

    if (putRes.ok) {
      console.log("✅ WR updated");
    } else {
      console.error("❌ WR update failed:", await putRes.text());
    }
  } catch (err) {
    console.error("⚠️ Error during WR update:", err);
  }
}
