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


async function setup() {
  noCursor();

  createCanvas(windowWidth, windowHeight);
  table = await loadTable('/Data/StudentsSocialMediaAddiction.csv', ',', 'header');
  console.log(table);

  Academic_Level = table.getColumn('Academic_Level');
  buildCategoryCircles();
}

function draw() {
  drawRadialGradientBackground(width / 2, height / 2);
  updateAndDrawRipples();

  if (circles.length > 0) {
    textAlign(CENTER, CENTER);
    textSize(20);

    for (const categoryCircle of circles) {
      updateCircle(categoryCircle);
      drawCircleTrail(categoryCircle);

      fill(0, 0, 255, 130); //Blue circle fill color with some transparency
      noStroke();
      circle(categoryCircle.position.x, categoryCircle.position.y, categoryCircle.diameter);

      fill(255);  //text color
      noStroke();
      text(categoryCircle.label, categoryCircle.position.x, categoryCircle.position.y);
    }
  }

  drawEmberCursor();
}

function windowResized() {  //makes sure its responsive to window resizing
  resizeCanvas(windowWidth, windowHeight);
  buildCategoryCircles();
  ripples = [];
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
  if (!Academic_Level || Academic_Level.length === 0) {
    circles = [];
    return;
  }

  const normalize = (value) => value.trim().toLowerCase();
  const normalizedLevels = Academic_Level.map(normalize);

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

  const sizeScale = 2; // Adjust this value to increase/decrease overall circle sizes
  const spacing = width / (categories.length + 1);
  const y = height / 2;
  const minDiameter = min(width, height) * 0.16 * sizeScale;
  const maxDiameter = min(width, height) * 0.34 * sizeScale;
  const totalCount = categories.reduce((sum, category) => sum + category.count, 0);

  circles = categories.map((category, index) => {
    const percentage = totalCount > 0 ? category.count / totalCount : 0;
    const diameter = lerp(minDiameter, maxDiameter, percentage);

    return {
      label: category.label,
      targetPath: category.targetPath,
      diameter,
      position: createVector(spacing * (index + 1), y),
      velocity: p5.Vector.random2D().mult(random(0.9, 1.5)), //Starting Speed
      trail: []
    };
  });
}

function mousePressed() {
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

  const radius = categoryCircle.diameter / 2;
  if (categoryCircle.position.x < radius || categoryCircle.position.x > width - radius) {
    categoryCircle.velocity.x *= -1;
    categoryCircle.position.x = constrain(categoryCircle.position.x, radius, width - radius);
  }
  if (categoryCircle.position.y < radius || categoryCircle.position.y > height - radius) {
    categoryCircle.velocity.y *= -1;
    categoryCircle.position.y = constrain(categoryCircle.position.y, radius, height - radius);
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

    fill(0, 0, 255, trailAlpha);
    noStroke();
    circle(trailPoint.x, trailPoint.y, trailDiameter);
  }
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