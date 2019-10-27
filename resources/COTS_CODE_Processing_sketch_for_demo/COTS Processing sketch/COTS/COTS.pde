// Processing sketch for demoeing and exploring results disseminated in the ACM TOG paper:
// Corner-Operated Tran-Similar (COTS) maps, patterns, and lattices 
// Author: Jarek ROSSIGNAC, Georgia Tech
// Last update: September 2019
// please read the included readme.rtf file 
import processing.pdf.*;    // to save screen shots as PDFs, does not always work: accuracy problems, stops drawing or messes up some curves !!!
import java.awt.Toolkit;
import java.awt.datatransfer.*;
//**************************** global variables ****************************
pts P = new pts(); // class containing array of points, used to standardize GUI
COTSMap CM;
boolean showMenu=true, 
        showTiles=false,
        showIsoCurves=true, 
        showLabels=true, 
        resetBranching=false, 
        showDisks=false, 
        showBorder=true, 
        showCrossForPick=true, 
        showControlCircles=false,
        showFixedPoint=true,
        showStars=true,
        showHubs=false,
        showCircumCircle=false, 
        showCircumCircles=false, 
        showPointer=false,
        showTextured=false,
        showCoons=false,
        showPM=false; 

pt CenterPoint = P(), RadiusPoint = P(); // to control editing the disk
int ne=8; // current cell-count in each direction
float r=2.8; // initial radius of disk
PFont bigFont; // for showing large labels at corner



//**************************** initialization ****************************
void setup()               // executed once at the begining LatticeImage
  {
  size(900, 900, P2D);            // window size
  smooth();                  // turn on antialiasing
  P.declare(); // declares all points in P. MUST BE DONE BEFORE ADDING POINTS 
  P.loadPts("data/pts");  // loads points form file saved with this program
  bigFont = createFont("AdobeFanHeitiStd-Bold-32", 20); textFont(bigFont); textAlign(CENTER, CENTER);
  CM = new COTSMap(P.G[0],P.G[1],P.G[2],P.G[3],8);
  //CM.au+=TWO_PI; // to force particular branching for the demo file
  CenterPoint=P(P.G[4]); RadiusPoint=P(P.G[5]);
  CM.setCircle(CenterPoint,RadiusPoint); // adjust the green disks as the control handle is dragged
  myFace = loadImage("data/myface.jpg"); 
  textureMode(NORMAL);
  } // end of setup



//**************************** display current frame ****************************
void draw()      
  {
  background(white);
  
  if(recordingPDF) startRecordingPDF(); // starts recording graphics to make a PDF
  
  // renames points of array P[] for readability
  int k=0;  
  pt A = P.G[k++],  B = P.G[k++], C = P.G[k++], D = P.G[k++];
  CenterPoint = P.G[4]; 
  RadiusPoint = P.G[5];
  
  CM.COTSupdateMap(A,B,C,D,ne); // updates COTS map CM to current position of corners

  CM.setCircle(CenterPoint,RadiusPoint); // control points of disk for hub-pattern

  if(showTiles) CM.showCheckerboard(); 
  pen(red,2);
  if(showTextured) 
    {
    float mag = (float) width / max(myFace.width,myFace.height)/5;
    image(myFace,0,0,mag*myFace.width,mag*myFace.height);
    CM.showTextured();
    }

  if(showPM) CM.showPMIsocurves(); // draws n+1 red and n+1  blue iso-curves 
  
  if(showCoons) CM.showCoonsIsocurves(); // draws Coons iso-curves for COTS border 
   
  if(showIsoCurves) CM.showIsocurves(); // draws n+1 red and n+1  blue iso-curves 
  
  if(showBorder) CM.showBorder(); // draws border isocurves in thicker grey
 
  if(showHubs) CM.showHubs(); // show all hubs of the lattice

  if(showDisks) { noStroke(); fill(green); CM.showCirclePattern();  noFill();} // shows green pattern of disks, one per cell. Self-adjusting radii.

  if(showStars) { fill(blue); pen(blue,1); CM.showPattern(); } // shows pattern of stars displayed using OpenGL matrix stack commands  
 
  if(showControlCircles) // for editing the center and radius of orange control circles relative to cell [0,0] at corner (a)
    { 
    noFill(); pen(magenta,2); 
    CM.ShowCircleField(CenterPoint,RadiusPoint); // Draws magenta control circle
    noStroke();                          //  Draws dots at control handles of disk:
    fill(brown); show(CenterPoint,4);    //  brown for the center 
    fill(magenta); show(RadiusPoint,4);  //  magenta on circle for controlling the radius
    }
 
  if(showFixedPoint) {fill(black); noStroke(); show(CM.F,5);} 
 
  if(showCircumCircle) CM.warpCircle();

  if(showCircumCircles) CM.warpCircles();

  CM.showCorners();  // show colored dots for the four COTS corners
  
  if(showLabels) {textAlign(CENTER, CENTER); CM.showLabels();} // shows corner labels: (a), (b), (c), (d)

  if(showCrossForPick) // Demonstrates inversion by drawing U and V isocurves that pass through the mouse-pointer when it is inside
    {
    pt I = CM.Inverse(Mouse()); // preimage of mouse location 
    if((0<I.x && I.x<1) && (0<I.y && I.y<1)) // draw isocurves when mouse is in
      {CM.showUcurve(I.x); CM.showVcurve(I.y);} 
    }
  
  //pt P0 = Mouse(), Q=CM.Inverse(P0), P1=CM.ImageOf(Q); float d12 = d(P0,P1); scribe("d="+d12,100,100);

  
  pt End = P(Mouse(),1,V(-2,3)), Start = P(End,20,V(-2,3)); // show semi-opaque grey arrow pointing to mouse location (useful for demos and videos)
  strokeWeight(5);  noFill(); stroke(grey,70); arrow(Start,End);
  
 
  // image and video capture
  if(recordingPDF) endRecordingPDF();  // end saving a .pdf file with the image of the canvas
  noFill();
  if(showMenu) {background(255,255,200); displayMenu();}
  if(filming && (animating || change)) snapFrameToTIF(); // saves image on canvas as movie frame 
  if(snapTIF) snapPictureToTIF();   
  if(snapJPG) snapPictureToJPG();   
  change=false; // to avoid capturing movie frames when nothing happens
  
  }  // end of draw

//==============================



  
