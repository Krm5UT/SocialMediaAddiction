/* THE IDEA
make three pages 
1st page three catergories in circles (other, undergrad, graduate) 
floating softly around the screen. when you click on one of the circles, it will take you to the second page.

Get 4 column in CSV, Academic_Level
Show text for the three types academic level listed in three different circles 
*/


let table;
let Academic_Level;
let circles = [];
let ripples = [];
let lastRippleFrame = -100;
let lastRippleX = -9999;
let lastRippleY = -9999;
let phoneOutlineImage;
let phoneFrame = null;
let phoneScreen = null;
let isPhoneScreenOn = false;
const floatingPromptText = 'click screen to turn on';
let floatingPromptPosition;
let floatingPromptVelocity;
let customCursorElement;

function loadImageAsync(path) {
  return new Promise((resolve) => {
    loadImage(
      path,
      (imageAsset) => resolve(imageAsset),
      () => resolve(null)
    );
  });
}

function loadTableAsync(path) {
  return new Promise((resolve) => {
    loadTable(
      path,
      'csv',
      'header',
      (tableAsset) => resolve(tableAsset),
      () => resolve(null)
    );
  });
}

async function setup() {
  createCanvas(windowWidth, windowHeight);

  phoneOutlineImage = await loadImageAsync('images/phoneoutline.png');
  table = await loadTableAsync('Data/StudentsSocialMediaAddiction.csv');

  if (table && typeof table.getColumn === 'function') {
    Academic_Level = table.getColumn('Academic_Level');
  } else {
    Academic_Level = [];
  }

  setupCustomCursor();
  initializeFloatingPrompt();
  buildCategoryCircles();
}

function draw() {
  clear();
  updateAndDrawRipples();
  updateAndDrawFloatingPrompt();
  drawPhoneInnerScreen();

  if (circles.length > 0) {
    textAlign(CENTER, CENTER);
    textSize(20);

    for (const categoryCircle of circles) {
      updateCircle(categoryCircle);
      drawCircleTrail(categoryCircle);

      drawGlowSquare(
        categoryCircle.position.x,
        categoryCircle.position.y,
        categoryCircle.diameter,
        130
      );

      fill(255);  //text color
      noStroke();
      text(categoryCircle.label, categoryCircle.position.x, categoryCircle.position.y);
    }
  }

  drawStaticPhoneText();
  drawPhoneBlackOverlay();
  drawPhoneOutline();

}

function windowResized() {  //makes sure its responsive to window resizing
  resizeCanvas(windowWidth, windowHeight);
  initializeFloatingPrompt();
  updatePhoneLayout();
  buildCategoryCircles();
  ripples = [];
}

function initializeFloatingPrompt() {
  floatingPromptPosition = createVector(random(width), random(height));
  floatingPromptVelocity = p5.Vector.random2D().mult(1.4);
}

function updateAndDrawFloatingPrompt() {
  if (!floatingPromptPosition || !floatingPromptVelocity) {
    initializeFloatingPrompt();
  }

  textAlign(CENTER, CENTER);
  textSize(clamp(width * 0.016, 16, 28));

  const halfTextWidth = textWidth(floatingPromptText) / 2;
  const halfTextHeight = textAscent() * 0.6;

  floatingPromptPosition.add(floatingPromptVelocity);

  if (floatingPromptPosition.x < halfTextWidth || floatingPromptPosition.x > width - halfTextWidth) {
    floatingPromptVelocity.x *= -1;
    floatingPromptPosition.x = constrain(floatingPromptPosition.x, halfTextWidth, width - halfTextWidth);
  }

  if (floatingPromptPosition.y < halfTextHeight || floatingPromptPosition.y > height - halfTextHeight) {
    floatingPromptVelocity.y *= -1;
    floatingPromptPosition.y = constrain(floatingPromptPosition.y, halfTextHeight, height - halfTextHeight);
  }

  push();
  const ctx = drawingContext;
  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.55)';

  noStroke();
  fill(255, 255, 255, 175);
  text(floatingPromptText, floatingPromptPosition.x, floatingPromptPosition.y);

  ctx.restore();
  pop();
}

function drawStaticPhoneText() {
  if (!phoneScreen) {
    return;
  }

  const labelY = phoneScreen.y + phoneScreen.h - max(16, phoneScreen.h * 0.06);

  textAlign(CENTER, CENTER);
  textSize(clamp(phoneScreen.w * 0.06, 13, 24));
  noStroke();
  fill(255, 255, 255, 220);
  text('SOCIAL MEDIA ADDICTION', phoneScreen.x + phoneScreen.w / 2, labelY);
}

//-------------RIPPLE EFFECT FUNCTIONS----------------//
function mouseMoved() {
  addRipple(mouseX, mouseY);
}

function mouseDragged() {
  addRipple(mouseX, mouseY);
}

function addRipple(x, y) {
  const minDistanceBetweenRipples = 28;
  const minFramesBetweenRipples = 2;
  const mouseDistance = dist(x, y, lastRippleX, lastRippleY);

  if (frameCount - lastRippleFrame < minFramesBetweenRipples || mouseDistance < minDistanceBetweenRipples) {
    return;
  }

  ripples.push({
    x,
    y,
    radius: 3,
    alpha: 70,
    growth: random(1.0, 1.6),
    fade: random(0.5, 0.9),
    thickness: random(0.8, 1.6)
  });

  if (ripples.length > 70) {
    ripples.shift();
  }

  lastRippleFrame = frameCount;
  lastRippleX = x;
  lastRippleY = y;
}

function updateAndDrawRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const ripple = ripples[i];

    noFill();
    stroke(255, 255, 255, ripple.alpha);
    strokeWeight(ripple.thickness);
    circle(ripple.x, ripple.y, ripple.radius * 2);

    ripple.radius += ripple.growth;
    ripple.alpha -= ripple.fade;

    if (ripple.alpha <= 0 || ripple.radius > max(width, height) * 0.22) {
      ripples.splice(i, 1);
    }
  }

  noStroke();
}

function buildCategoryCircles() {
  const fallbackAcademicLevels = ['undergraduate', 'graduate', 'high school'];
  const levelsToUse = (Academic_Level && Academic_Level.length > 0)
    ? Academic_Level
    : fallbackAcademicLevels;

  updatePhoneLayout();

  if (!phoneScreen) {
    circles = [];
    return;
  }

  const normalize = (value) => String(value).trim().toLowerCase();
  const normalizedLevels = levelsToUse.map(normalize);

  const countsByLevel = new Map();
  for (const level of normalizedLevels) {
    countsByLevel.set(level, (countsByLevel.get(level) || 0) + 1);
  }

  const categories = [  //catergories with their corresponding paths to the next pages
    { key: 'undergraduate', label: 'Undergraduate', targetPath: 'html/undergrad.html' },
    { key: 'graduate', label: 'Graduate', targetPath: 'html/graduate.html' },
    { key: 'high school', label: 'High School', targetPath: 'html/highschool.html' }
  ]
    .map((category) => ({
      ...category,
      count: countsByLevel.get(category.key) || 0
    }))
    .filter((category) => category.count > 0);

  const spacing = phoneScreen.w / (categories.length + 1);
  const y = phoneScreen.y + phoneScreen.h / 2;
  const minDiameter = min(phoneScreen.w, phoneScreen.h) * 0.23;
  const maxDiameter = min(phoneScreen.w, phoneScreen.h) * 0.38;
  const totalCount = categories.reduce((sum, category) => sum + category.count, 0);

  circles = categories.map((category, index) => {
    const percentage = totalCount > 0 ? category.count / totalCount : 0;
    const diameter = lerp(minDiameter, maxDiameter, percentage);

    return {
      label: category.label,
      targetPath: category.targetPath,
      diameter,
      position: createVector(phoneScreen.x + spacing * (index + 1), y),
      velocity: p5.Vector.random2D().mult(random(0.9, 1.5)), //Starting Speed
      trail: []
    };
  });
}

function mousePressed() {
  if (!isPhoneScreenOn && isPointInsidePhoneScreen(mouseX, mouseY)) {
    isPhoneScreenOn = true;
    return;
  }

  if (!isPhoneScreenOn) {
    return;
  }

  for (const categoryCircle of circles) {
    const distanceToMouse = dist(mouseX, mouseY, categoryCircle.position.x, categoryCircle.position.y);
    const isInsideCircle = distanceToMouse <= categoryCircle.diameter / 2;

    if (isInsideCircle && categoryCircle.targetPath) {
      window.location.href = categoryCircle.targetPath;
      return;
    }
  }
}

function updateCircle(categoryCircle) {
  categoryCircle.velocity.add(p5.Vector.random2D().mult(0.03)); //Float Jitter (how much the circle floats around on its own)

  if (mouseIsPressed) {
    const toMouse = createVector(mouseX, mouseY).sub(categoryCircle.position);
    const distance = max(toMouse.mag(), 1);
    toMouse.setMag(min(0.3, 18 / distance));
    categoryCircle.velocity.add(toMouse);
  }

  categoryCircle.velocity.limit(3.4); //Max Speed
  categoryCircle.velocity.mult(0.99);//Drag/Friction (how much the circle slows down on its own)
  categoryCircle.position.add(categoryCircle.velocity);

  if (!phoneScreen) {
    return;
  }

  const collisionHalfSize = categoryCircle.diameter * 0.43;
  const minX = phoneScreen.x + collisionHalfSize;
  const maxX = phoneScreen.x + phoneScreen.w - collisionHalfSize;
  const minY = phoneScreen.y + collisionHalfSize;
  const maxY = phoneScreen.y + phoneScreen.h - collisionHalfSize;

  if (categoryCircle.position.x < minX || categoryCircle.position.x > maxX) {
    categoryCircle.velocity.x *= -1;
    categoryCircle.position.x = constrain(categoryCircle.position.x, minX, maxX);
  }
  if (categoryCircle.position.y < minY || categoryCircle.position.y > maxY) {
    categoryCircle.velocity.y *= -1;
    categoryCircle.position.y = constrain(categoryCircle.position.y, minY, maxY);
  }

  categoryCircle.trail.push({
    x: categoryCircle.position.x,
    y: categoryCircle.position.y
  });
  if (categoryCircle.trail.length > 16) {
    categoryCircle.trail.shift();
  }
}

function drawCircleTrail(categoryCircle) {
  const trailLength = categoryCircle.trail.length;
  if (trailLength === 0) {
    return;
  }

  for (let i = 0; i < trailLength; i++) {
    const trailPoint = categoryCircle.trail[i];
    const t = (i + 1) / trailLength;
    const trailDiameter = categoryCircle.diameter * (0.35 + 0.45 * t);
    const trailAlpha = 8 + 45 * t;

    drawGlowSquare(trailPoint.x, trailPoint.y, trailDiameter, trailAlpha);
  }
}

function updatePhoneLayout() {
  if (!phoneOutlineImage || !phoneOutlineImage.width || !phoneOutlineImage.height) {
    phoneFrame = {
      x: width * 0.2,
      y: height * 0.08,
      w: width * 0.6,
      h: height * 0.84
    };

    phoneScreen = {
      x: phoneFrame.x,
      y: phoneFrame.y,
      w: phoneFrame.w,
      h: phoneFrame.h
    };
    return;
  }

  const targetHeight = min(height * 0.82, width * 1.05);
  const aspectRatio = phoneOutlineImage.width / phoneOutlineImage.height;
  const frameHeight = targetHeight;
  const frameWidth = frameHeight * aspectRatio;
  const frameX = (width - frameWidth) / 2;
  const frameY = (height - frameHeight) / 2;

  phoneFrame = {
    x: frameX,
    y: frameY,
    w: frameWidth,
    h: frameHeight
  };

  phoneScreen = {
    x: frameX + frameWidth * 0.055,
    y: frameY + frameHeight * 0.055,
    w: frameWidth * 0.89,
    h: frameHeight * 0.89
  };
}

function drawPhoneOutline() {
  if (!phoneOutlineImage) {
    return;
  }

  if (!phoneFrame) {
    updatePhoneLayout();
  }

  image(phoneOutlineImage, phoneFrame.x, phoneFrame.y, phoneFrame.w, phoneFrame.h);
}

function drawPhoneInnerScreen() {
  if (!phoneScreen || !isPhoneScreenOn) {
    return;
  }

  const overlayScreen = getOverlayScreenRect();

  noStroke();
  fill(212, 212, 212);
  rectMode(CORNER);
  rect(
    overlayScreen.x,
    overlayScreen.y,
    overlayScreen.w,
    overlayScreen.h,
    max(18, overlayScreen.w * 0.07)
  );
}

function drawPhoneBlackOverlay() {
  if (!phoneScreen || isPhoneScreenOn) {
    return;
  }

  const overlayScreen = getOverlayScreenRect();

  noStroke();
  fill(0, 0, 0, 245);
  rectMode(CORNER);
  rect(
    overlayScreen.x,
    overlayScreen.y,
    overlayScreen.w,
    overlayScreen.h,
    max(18, overlayScreen.w * 0.07)
  );
}

function isPointInsidePhoneScreen(pointX, pointY) {
  if (!phoneScreen) {
    return false;
  }

  const overlayScreen = getOverlayScreenRect();

  return (
    pointX >= overlayScreen.x &&
    pointX <= overlayScreen.x + overlayScreen.w &&
    pointY >= overlayScreen.y &&
    pointY <= overlayScreen.y + overlayScreen.h
  );
}

function getOverlayScreenRect() {
  const expandX = phoneScreen.w * 0.015;
  const expandY = phoneScreen.h * 0.035;

  return {
    x: phoneScreen.x - expandX,
    y: phoneScreen.y - expandY,
    w: phoneScreen.w + expandX * 2,
    h: phoneScreen.h + expandY * 2
  };
}

function drawGlowSquare(centerX, centerY, size, alpha) {
  const cornerRadius = max(10, size * 0.12);
  const glowPasses = 3;

  noStroke();
  for (let i = glowPasses; i > 0; i--) {
    const glowSize = size + i * (size * 0.2);
    const glowAlpha = alpha * (0.14 / i);
    fill(0, 0, 255, glowAlpha);
    rectMode(CENTER);
    rect(centerX, centerY, glowSize, glowSize, cornerRadius);
  }

  fill(0, 0, 255, alpha);
  rectMode(CENTER);
  rect(centerX, centerY, size, size, cornerRadius);
}

//-------------GRADIENT BACKGROUND FUNCTION----------------//

function drawRadialGradientBackground(centerX, centerY) {
  const maxDistance = dist(0, 0, max(centerX, width - centerX), max(centerY, height - centerY));
  const ctx = drawingContext;
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxDistance);

  gradient.addColorStop(0, 'rgb(134, 134, 134)');
  gradient.addColorStop(0.50, 'rgb(84, 84, 84)');
  gradient.addColorStop(1, 'rgb(0, 0, 0)');

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

//-------------EMBER CURSOR FUNCTION----------------//
function drawEmberCursor() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return;
  }

  push();
  blendMode(ADD);

  const ctx = drawingContext;
  ctx.save();
  ctx.shadowBlur = 22;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.65)';

  noStroke();

  fill(50, 50, 50, 10);
  circle(mouseX, mouseY, 26);

  fill(255, 255, 255, 150);
  circle(mouseX, mouseY, 10);

  ctx.restore();
  pop();
}

function setupCustomCursor() {
  customCursorElement = document.createElement('div');
  customCursorElement.className = 'custom-cursor';
  customCursorElement.innerHTML = '<div class="custom-cursor-outer"></div><div class="custom-cursor-inner"></div>';
  document.body.appendChild(customCursorElement);

  const updateCursorPosition = (event) => {
    customCursorElement.style.left = `${event.clientX}px`;
    customCursorElement.style.top = `${event.clientY}px`;
    customCursorElement.style.opacity = '1';
  };

  window.addEventListener('mousemove', updateCursorPosition);
  window.addEventListener('mousedown', () => customCursorElement.classList.add('is-down'));
  window.addEventListener('mouseup', () => customCursorElement.classList.remove('is-down'));
  window.addEventListener('mouseleave', () => {
    customCursorElement.style.opacity = '0';
  });
}