//*****************************************************************************
// TITLE:         Point sequence for editing polylines and polyloops  
// AUTHOR:        Prof Jarek Rossignac
// DATE CREATED:  September 2012
// EDITS:         Last revised Sept 10, 2016
//*****************************************************************************
class pts 
  {
  int nv=0;                                // number of vertices in the sequence
  int pv = 0;                              // picked vertex 
  int iv = 0;                              // insertion index 
  int maxnv = 100*2*2*2*2*2*2*2*2;         //  max number of vertices
  Boolean loop=true;                       // is a closed loop

  pt[] G = new pt [maxnv];                 // geometry table (vertices)

 // CREATE


  pts() {}
  
  void declare() {for (int i=0; i<maxnv; i++) G[i]=P(); }               // creates all points, MUST BE DONE AT INITALIZATION

  void empty() {nv=0; pv=0; }                                                 // empties this object


  // PICK AND EDIT INDIVIDUAL POINT
  
  void pickClosest(pt M) 
    {
    pv=0; 
    if(showControlCircles)
      {
      for (int i=1; i<nv; i++) 
        if (d(M,G[i])<d(M,G[pv])) pv=i; 
      }
    else
      for (int i=1; i<4; i++) 
        if (d(M,G[i])<d(M,G[pv])) pv=i;
    }

  void dragPicked()  // moves selected point (index pv) by the amount by which the mouse moved recently
    { 
    G[pv].moveWithMouse(); 
    if(pv==4) G[5].moveWithMouse(); // also drag the magenta control handle while the user is dragging the center of the control circle
    if(pv<4) 
      { 
      CM.setCircle(G[4],G[5]); 
      CM.COTSupdateMap(G[0],G[1],G[2],G[3],ne); 
      P.G[4]=P(CM.CircleCenterPoint()); 
      P.G[5]=P(CM.CircleRadiusPoint(P.G[5])); 
      }
    }     
  
 

  // EDIT ALL POINTS TRANSALTE, ROTATE, ZOOM, FIT TO CANVAS
  
  void dragAll() // moves all points to mimick mouse motion
    { 
    for (int i=0; i<nv; i++) G[i].moveWithMouse(); 
    }      
  

  void rotateAll(float a, pt C) // rotates all points around pt G by angle a
    {
    for (int i=0; i<nv; i++) G[i].rotate(a,C); 
    } 
  
  void rotateAllAroundCentroid(pt P, pt Q, int n) // rotates all points around their center of mass G by angle <GP,GQ>
    {
    pt G = CentroidOfVertices(4); show(G,10);
    rotateAll(angle(V(G,P),V(G,Q)),G); 
    }

  void scaleAllAroundCentroid(pt M, pt P) // scales all points wrt centroid G using distance change |GP| to |GM|
    {
    pt C=CentroidOfVertices(4); show(C,10);
    float m=d(C,M),p=d(C,P); 
    scaleAll((p-m)/p,C); 
    }

  void scaleAll(float s, pt C) // scales all pts by s wrt C
    {
    for (int i=0; i<nv; i++) G[i].translateTowards(s,C); 
    }  
  
  void scaleAllAroundCentroid(float s) 
    {
    scaleAll(s,CentroidOfVertices(4)); 
    }
  
     
  // MEASURES 
  

  pt CentroidOfVertices(int n) 
    {
    pt C=P(); // will collect sum of points before division
    for (int i=0; i<n; i++) C.add(G[i]); 
    return P(1./n,C); // returns divided sum
    }


  // READ / WRITE CORNERS TO FILE  
     
  void savePts(String fn) 
    {
    String [] inppts = new String [nv+1];
    int s=0;
    inppts[s++]=str(nv);
    for (int i=0; i<nv; i++) {inppts[s++]=str(G[i].x)+","+str(G[i].y);}
    saveStrings(fn,inppts);
    };
  

  void loadPts(String fn) 
    {
    println("loading: "+fn); 
    String [] ss = loadStrings(fn);
    String subpts;
    int s=0;   int comma, comma1, comma2;   float x, y;   int a, b, c;
    nv = int(ss[s++]); print("nv="+nv);
    for(int k=0; k<nv; k++) {
      int i=k+s; 
      comma=ss[i].indexOf(',');   
      x=float(ss[i].substring(0, comma));
      y=float(ss[i].substring(comma+1, ss[i].length()));
      G[k].setTo(x,y);
      };
    pv=0;
    }; 
  
  }  // end class pts
