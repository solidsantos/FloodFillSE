const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const pencilButton = document.getElementById('pencil');
const bucketButton = document.getElementById('bucket');
const colorPicker = document.getElementById('colorPicker');

let currentTool = 'pencil';
let drawing = false;
let currentColor = colorPicker.value;

// Atualiza a cor atual escolhida
colorPicker.addEventListener('input', () => {
  currentColor = colorPicker.value;
});

// Troca de ferramenta para lápis
pencilButton.addEventListener('click', () => {
  currentTool = 'pencil';
});

// Troca de ferramenta para balde de tinta
bucketButton.addEventListener('click', () => {
  currentTool = 'fill';
});

// Desenha linhas com o lápis
canvas.addEventListener('mousedown', (e) => {
  if (currentTool === 'pencil') {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (drawing && currentTool === 'pencil') {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.closePath();
});

// Implementando o flood fill morfológico (balde de tinta)
canvas.addEventListener('click', (e) => {
  if (currentTool === 'fill') {
    const startX = e.offsetX;
    const startY = e.offsetY;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const startColor = getPixelColor(imageData, startX, startY);
    const fillColor = hexToRGBA(currentColor);

    if (!colorsMatch(startColor, fillColor)) {
      morphologicalFloodFill(imageData, startX, startY, startColor, fillColor);
      ctx.putImageData(imageData, 0, 0);
    }
  }
});

// Função para pegar a cor de um pixel
function getPixelColor(imageData, x, y) {
  const index = (y * imageData.width + x) * 4;
  const data = imageData.data;
  return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

// Função para comparar duas cores
function colorsMatch(color1, color2) {
  return color1[0] === color2[0] && color1[1] === color2[1] && 
         color1[2] === color2[2] && color1[3] === color2[3];
}

// Converte cor hexadecimal para RGBA
function hexToRGBA(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b, 255];
}

// Define a cor de um pixel
function setPixelColor(imageData, x, y, color) {
  const index = (y * imageData.width + x) * 4;
  imageData.data[index] = color[0];
  imageData.data[index + 1] = color[1];
  imageData.data[index + 2] = color[2];
  imageData.data[index + 3] = color[3];
}

// Operação de dilatação com um elemento estruturante 3x3
function dilate(imageData, pixels, width, height) {
  const newPixels = [];
  const elementStruct = [
    [-1, 0], [1, 0], // Horizontal
    [0, -1], [0, 1], // Vertical
    [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonais
  ];
  
  pixels.forEach(([x, y]) => {
    elementStruct.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (isValid(nx, ny, width, height)) {
        newPixels.push([nx, ny]);
      }
    });
  });
  return newPixels;
}

// Checa se o pixel está dentro dos limites da imagem
function isValid(x, y, width, height) {
  return x >= 0 && x < width && y >= 0 && y < height;
}

// Interseção: Verifica se o pixel atual é da cor inicial
function intersection(currentColor, startColor) {
  return colorsMatch(currentColor, startColor);
}

// Complemento: Verifica se o pixel não é da cor de preenchimento
function complement(currentColor, fillColor) {
  return !colorsMatch(currentColor, fillColor);
}

// Flood fill morfológico com dilatação e controle de critério de parada
function morphologicalFloodFill(imageData, startX, startY, startColor, fillColor) {
  let pixels = [[startX, startY]]; // Começa pelo ponto inicial
  const width = imageData.width;
  const height = imageData.height;
  const visited = new Set(); // Evita processar o mesmo pixel mais de uma vez

  while (pixels.length > 0) {
    let newPixels = [];

    pixels.forEach(([x, y]) => {
      const pixelKey = `${x},${y}`;
      if (!visited.has(pixelKey)) {
        const currentColor = getPixelColor(imageData, x, y);
        
        // Interseção: Verifica se a cor atual é igual à cor inicial
        if (intersection(currentColor, startColor)) {
          setPixelColor(imageData, x, y, fillColor);
          visited.add(pixelKey);
          
          // Dilatação
          newPixels = newPixels.concat(dilate(imageData, [[x, y]], width, height));
        } else if (complement(currentColor, fillColor)) {
          // Complemento: não preenche o pixel se já tiver a cor de preenchimento
        }
      }
    });

    pixels = newPixels;
  }
}
