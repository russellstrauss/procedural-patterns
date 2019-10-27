PImage myFace; // picture of author's face, should be: data/pic.jpg in sketch folder

// ************************************************************************ COLORS 
color black=#000000, white=#FFFFFF, // set more colors using Menu >  Tools > Color Selector
   red=#FF0000, green=#00FF01, dgreen=#026F0A, blue=#0300FF, yellow=#FEFF00, cyan=#00FDFF, magenta=#FF00FB, orange=#FCA41F, 
   brown=#AF6E0B, grey=#5F5F5F;

// ************************************************************************ GRAPHICS 
void pen(color c, float w) {stroke(c); strokeWeight(w);}
void showDisk(float x, float y, float r) {ellipse(x,y,r*2,r*2);}

// ************************************************************************ SAVING INDIVIDUAL IMAGES OF CANVAS  
int pictureCounterPDF=0, pictureCounterJPG=0, pictureCounterTIF=0;

boolean recordingPDF=false; // most compact and great, but does not always work
String PicturesFileName = "P";
void startRecordingPDF() {beginRecord(PDF,"IMAGES/PICTURES_PDF/"+PicturesFileName+nf(pictureCounterPDF++,3)+".pdf"); }
void endRecordingPDF() {endRecord(); recordingPDF=false;}

boolean snapJPG=false;
void snapPictureToJPG() {saveFrame("IMAGES/PICTURES_JPG/"+PicturesFileName+nf(pictureCounterJPG++,3)+".jpg"); snapJPG=false;}

boolean snapTIF=false;   
void snapPictureToTIF() {saveFrame("IMAGES/PICTURES_TIF/"+PicturesFileName+nf(pictureCounterTIF++,3)+".tif"); snapTIF=false;}


//***************************************************************************************** MAKING A MOVIE
boolean filming=false;  // when true frames are captured in FRAMES for a movie
boolean change=false;   // true when the user has presed a key or moved the mouse
boolean animating=false; // must be set by application during animations to force frame capture
int frameCounter=0;
void snapFrameToTIF(){saveFrame("IMAGES/MOVIE_FRAMES_TIF/F"+nf(frameCounter++,4)+".tif");} 

// ************************************************************************ TEXT 
Boolean scribeText=false; // toggle for displaying of help text
void scribe(String S, float x, float y) {fill(0); text(S,x,y); noFill();} // writes on screen at (x,y) with current fill color
void scribeHeader(String S, int i) { text(S,30,20+i*40); noFill();} // writes black at line i
void scribeHeaderRight(String S) {fill(0); text(S,width-7.5*S.length(),20); noFill();} // writes black on screen top, right-aligned
void scribeFooter(String S, int i) {fill(0); text(S,10,height-10-i*20); noFill();} // writes black on screen at line i from bottom
void scribeAtMouse(String S) {fill(0); text(S,mouseX,mouseY); noFill();} // writes on screen near mouse
void scribeMouseCoordinates() {fill(black); text("("+mouseX+","+mouseY+")",mouseX+7,mouseY+25); noFill();}
void displayMenu() 
  {
  textAlign(LEFT, TOP);
  float dx=30, dy=40;
  int k=0;
  scribe("COTS: Corner-Operated Tran-Similar Map",dx,dy*k++);
  scribe("  Jarek Rossignac, Georgia Tech, 2019",dx,dy*k++);
  scribe(" ------------------------------",dx,dy*k++);
  scribe("MENU       Press SPACE to hide/show this menu",dx,dy*k++);
  scribe("CORNERS    click&drag:move, t:trans, r:rot, z:zoom, l:show/hide labels",dx,dy*k++);
  scribe("ARCHIVE    L:load saved corners, S:save corners",dx,dy*k++);
  scribe("BRANCHING: 0:reset both to zero; u/v:add 2PI to au/av",dx,dy*k++);
  scribe("TILES      ./,:more/fewer, T:show/hide checkerboard", dx,dy*k++);
  scribe("CIRCLES    o:in each tile, O:around Range ",dx,dy*k++);
  scribe("ISOCURVES  #:show/hide, b:show/hide border",dx,dy*k++);
  scribe("STARS      *:show/hide", dx,dy*k++); 
  scribe("TEXTURE    x:showTextured",dx,dy*k++);
  scribe("PICK       p:show/hide isocurves crossing at mouse",dx,dy*k++);
  scribe("COMPARE    e:non-exponential, c:Coons from COTS borders",dx,dy*k++);
  scribe("IMAGES     ~:pdf, !:filming start/stop saving into IMAGES/MOVIE_FRAMES_TIF/",dx,dy*k++);
  scribe("", dx,dy*k++);
  scribe("LATTICE    d:show/hide disks, h:show/hide beams", dx,dy*k++);
  scribe("CONTROL DISK @:show/hide, click&drag:change center/radius",dx,dy*k++);
  scribe("", dx,dy*k++);
  scribe("      ** DEMO (^:click&drag corners or control disk, -:move mouse) ** ", dx,dy*k++);
  scribe("           ^*-Tpfl....^To#^ox^x#,,,,@^dh^#^....",dx,dy*k++);
  }
