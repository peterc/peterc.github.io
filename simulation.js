var renderer, scene, camera, sphere, simulationTexture;
var grid;
var cols = 100, rows = 100;
var updateInterval = 150; // milliseconds update interval for the simulation
var lastUpdateTime = 0;
var frameCount = 0;

// Offscreen canvas for simulation texture
var textureCanvas, textureCtx;
var textureSize = 500;

function createGrid(rows, cols) {
  var arr = new Array(rows);
  for (var i = 0; i < rows; i++) {
    arr[i] = new Array(cols).fill(0);
  }
  return arr;
}

function countNeighbors(x, y) {
  var count = 0;
  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      var row = (x + i + rows) % rows;
      var col = (y + j + cols) % cols;
      count += grid[row][col];
    }
  }
  return count;
}

function updateGrid() {
  var newGrid = createGrid(rows, cols);
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      var neighbors = countNeighbors(i, j);
      if (grid[i][j] === 1) {
        newGrid[i][j] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
      } else {
        newGrid[i][j] = (neighbors === 3) ? 1 : 0;
      }
    }
  }
  grid = newGrid;
}

function drawSimulationOnTexture() {
  textureCtx.fillStyle = "black";
  textureCtx.fillRect(0, 0, textureSize, textureSize);
  
  var cellWidth = textureSize / cols;
  var cellHeight = textureSize / rows;
  
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      if (grid[i][j] === 1) {
        var hue = (j * 3 + i * 3 + frameCount) % 360;
        textureCtx.fillStyle = "hsl(" + hue + ", 100%, 50%)";
        textureCtx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
      }
    }
  }
}

function init() {
  var canvas = document.getElementById("simulationCanvas");
  renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 3;

  textureCanvas = document.createElement("canvas");
  textureCanvas.width = textureSize;
  textureCanvas.height = textureSize;
  textureCtx = textureCanvas.getContext("2d");

  simulationTexture = new THREE.CanvasTexture(textureCanvas);
  simulationTexture.minFilter = THREE.LinearFilter;

  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var material = new THREE.MeshBasicMaterial({ map: simulationTexture });
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  grid = createGrid(rows, cols);
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid[i][j] = Math.random() < 0.3 ? 1 : 0;
    }
  }

  requestAnimationFrame(animate);
}

function animate(timestamp) {
  if (!lastUpdateTime) lastUpdateTime = timestamp;
  if (timestamp - lastUpdateTime > updateInterval) {
    updateGrid();
    lastUpdateTime = timestamp;
  }
  frameCount++;
  
  drawSimulationOnTexture();
  simulationTexture.needsUpdate = true;
  
  sphere.rotation.y += 0.005;
  sphere.rotation.x += 0.003;
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.onload = init;
