//**************************** user actions ****************************
void keyPressed()  // executed each time a key is pressed: sets the Boolean "keyPressed" till it is released   
                    // sets  char "key" state variables till another key is pressed or released
    {
    if(key=='~') recordingPDF=true; // to snap an image of the canvas and save as zoomable a PDF, compact and great quality, but does not always work
    if(key=='!') {filming=!filming;  if(filming) println("FILMING"); else println("RESTING");}// filming on/off capture frames into folder IMAGES/MOVIE_FRAMES_TIF/
    if(key=='b') showBorder=!showBorder; 
    if(key=='@') showControlCircles=!showControlCircles;  
    if(key=='o') showCircumCircles=!showCircumCircles;  
    if(key=='O') showCircumCircle=!showCircumCircle;  
    if(key=='d') showDisks=!showDisks;  
    if(key=='e') showPM=!showPM;
    if(key=='#') showIsoCurves=!showIsoCurves;
    if(key=='h') showHubs=!showHubs;
    if(key=='c') showCoons=!showCoons;
    if(key=='l') showLabels=!showLabels; 
    if(key=='f') showFixedPoint=!showFixedPoint; 
    if(key=='p') showCrossForPick=!showCrossForPick;
    if(key=='*') showStars=!showStars;
    if(key=='L') P.loadPts("data/pts");    // load current positions of control points from file
    if(key=='S') P.savePts("data/pts");    // save current positions of control points on file
    if(key==',') if(ne>2)             // decrements cell-count
      {
      CM.COTSupdateMap(P.G[0],P.G[1],P.G[2],P.G[3],ne);
      pt RI = CM.Inverse(RadiusPoint);
      pt CI = CM.Inverse(CenterPoint);
      RI.scale(float(ne)/(ne-1));
      CI.scale(float(ne)/(ne-1));
      ne=max(2,ne-1); println("ne="+ne); 
      CM.COTSupdateMap(P.G[0],P.G[1],P.G[2],P.G[3],ne);
      RadiusPoint.setTo(CM.ImageOf(RI));
      CenterPoint.setTo(CM.ImageOf(CI));
      }
    if(key=='.') // increments cell-count
      {
      CM.COTSupdateMap(P.G[0],P.G[1],P.G[2],P.G[3],ne);
      pt RI = CM.Inverse(RadiusPoint);
      pt CI = CM.Inverse(CenterPoint);
      RI.scale(float(ne)/(ne+1));
      CI.scale(float(ne)/(ne+1));
      ne++;  println("ne="+ne); 
      CM.COTSupdateMap(P.G[0],P.G[1],P.G[2],P.G[3],ne);
      RadiusPoint.setTo(CM.ImageOf(RI));
      CenterPoint.setTo(CM.ImageOf(CI));
      //RadiusPoint.translateTowards(1./ne,CenterPoint);
      }
    if(key==';') {ne*=2;  println("ne="+ne); }
    if(key=='x') showTextured=!showTextured;
    if(key=='T') showTiles=!showTiles;
    if(key=='2') P.G[3].setTo(CM.ImageOf(P(0,1./2))); // align control-point (d) with specific point along border from (a) to (b)
    if(key=='3') P.G[3].setTo(CM.ImageOf(P(0,1./3)));
    if(key=='5') P.G[3].setTo(CM.ImageOf(P(0,1./5)));
    if(key=='7') P.G[3].setTo(CM.ImageOf(P(0,1./7)));
    if(key=='0') resetBranching=true;                  // resets branching to zero (removes swirls)
    if(key=='u') CM.au+=TWO_PI;                        // increments branching
    if(key=='v') CM.av+=TWO_PI;
    if(key==' ') showMenu=!showMenu; 
    change=true; // to make sure that we save a movie frame each time something changes
    println("key pressed = "+key);
    }

void mousePressed()   // executed when the mouse is pressed
  {
  P.pickClosest(Mouse()); // pick vertex closest to mouse: sets pv ("picked vertex") in pts
  change=true;
  }

void mouseDragged() // executed when the mouse is dragged (while mouse buttom pressed)
  {
  if (!keyPressed || (key=='a')|| (key=='i')) P.dragPicked();   // drag selected point with mouse
  if (keyPressed) {
      if (key=='t') P.dragAll(); // move all vertices
      if (key=='r') P.rotateAllAroundCentroid(Mouse(),Pmouse(),4); // turn all vertices around their center of mass
      if (key=='z') P.scaleAllAroundCentroid(Mouse(),Pmouse()); // scale all vertices with respect to their center of mass
      }
  change=true;
  }  

void mouseMoved()   // executed when the mouse is pressed
  {
  change=true;
  }

void mouseWheel(MouseEvent event) { // reads mouse wheel and uses to zoom
  float s = event.getAmount();
  P.scaleAllAroundCentroid(s/100);
  change=true;
  }

       
 
