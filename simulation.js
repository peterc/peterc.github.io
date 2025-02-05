var canvas, ctx;
var grid;
var cols, rows, cellSize;
var sphereCenterX, sphereCenterY, sphereRadius;
var updateInterval = 150; // milliseconds update interval for the simulation
var lastUpdateTime = 0;
var frameCount = 0; // for animating colors

function init() {
  canvas = document.getElementById("simulationCanvas");
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  sphereCenterX = canvas.width / 2;
  sphereCenterY = canvas.height / 2;
  sphereRadius = Math.min(canvas.width, canvas.height) * 0.45;
  
  // Use a square grid for simplicity.
  cols = 100;
  rows = 100;
  cellSize = (sphereRadius * 2) / cols;
  
  grid = createGrid(rows, cols);
  
  // Randomly initialise grid cells (alive with 30% chance)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[i][j] = Math.random() < 0.3 ? 1 : 0;
    }
  }
  
  requestAnimationFrame(loop);
}

function createGrid(rows, cols) {
  let arr = new Array(rows);
  for (let i = 0; i < rows; i++) {
    arr[i] = new Array(cols).fill(0);
  }
  return arr;
}

function countNeighbors(x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      // Wrap around grid edges (toroidal)
      const row = (x + i + rows) % rows;
      const col = (y + j + cols) % cols;
      count += grid[row][col];
    }
  }
  return count;
}

function updateGrid() {
  let newGrid = createGrid(rows, cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let neighbors = countNeighbors(i, j);
      if (grid[i][j] === 1) {
        // Survival condition
        newGrid[i][j] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
      } else {
        // Birth condition
        newGrid[i][j] = (neighbors === 3) ? 1 : 0;
      }
    }
  }
  grid = newGrid;
}

function drawGrid() {
  // Clear canvas with a black background.
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Optionally draw the sphere outline.
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sphereCenterX, sphereCenterY, sphereRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw each cell that lies within the sphere.
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = sphereCenterX - sphereRadius + j * cellSize;
      let y = sphereCenterY - sphereRadius + i * cellSize;
      
      // Determine the center of the cell.
      let cx = x + cellSize / 2;
      let cy = y + cellSize / 2;
      let dx = cx - sphereCenterX;
      let dy = cy - sphereCenterY;
      
      // Only draw cells whose centers are inside the sphere.
      if (dx * dx + dy * dy <= sphereRadius * sphereRadius) {
        if (grid[i][j] === 1) {
          // Create a dynamic hue based on position and frame count.
          let hue = (j * 3 + i * 3 + frameCount) % 360;
          ctx.fillStyle = "hsl(" + hue + ", 100%, 50%)";
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
  }
}

function loop(timestamp) {
  if (!lastUpdateTime) lastUpdateTime = timestamp;
  if (timestamp - lastUpdateTime > updateInterval) {
    updateGrid();
    lastUpdateTime = timestamp;
  }
  frameCount++;
  drawGrid();
  requestAnimationFrame(loop);
}

window.onload = init;
