/* THE IDEA
make three pages 
1st page three catergories in circles (other, undergrad, graduate) 
floating softly around the screen. when you click on one of the circles, it will take you to the second page.

Get 4 column in CSV, Academic_Level
Show text for the three types academic level listed in three different circles 
*/


let table;
let Academic_Level;


async function setup() {
  createCanvas(windowWidth, windowHeight);
  table = await loadTable('/Data/StudentsSocialMediaAddiction.csv', ',', 'header');
  console.log(table);

  Academic_Level = table.getColumn('Academic_Level');
}

function draw() {
  background(220);

if(table){
    for(let i = 0; i < table.getRowCount(); i++){  
        let textX = random(width);
        let textY = random(height);
        let scale = width * 0.01;


        text(Academic_Level[i], textX, textY);
        circle(textX, textY, Academic_Level[i] * scale);
}
}
noLoop();
}