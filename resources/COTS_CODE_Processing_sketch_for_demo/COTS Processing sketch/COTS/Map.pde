// COTS MAP CLASS. Jarek ROssignac. May 2019

class COTSMap 
  {
  int n=6;                                // cell-count in each direction
  pt A=P(), B=P(), C=P(), D=P();          // corners
  float mu=1, mv=1;                       // spiral scalings
  float au=0, av=0;                       // spiral angles
  float cx=0.5, cy=0.5, cr = 0.5; // control-circle center coordinates and radius wrt cell [0,0]
  pt F=P();                                // fixed point of quad

COTSMap() {}
  
  COTSMap(pt A1, pt B1, pt C1, pt D1)      // creates map and sets its parameters
    {
    A=P(A1);  B=P(B1);  C=P(C1);  D=P(D1);  
    au = spiralAngle(A,B,D,C); 
    mu = spiralScale(A,B,D,C); 
    F = SpiralCenter(au,mu,A,D);  
    av = spiralAngle(A,D,B,C); 
    mv = spiralScale(A,D,B,C);
    }
    
  COTSMap(pt A1, pt B1, pt C1, pt D1, int np) // creates map and sets its parameters and cell-count
    {
    A=P(A1);  B=P(B1);  C=P(C1);  D=P(D1);  
    au = spiralAngle(A,B,D,C); 
    mu = spiralScale(A,B,D,C); 
    F = SpiralCenter(au,mu,A,D);  
    av = spiralAngle(A,D,B,C); 
    mv = spiralScale(A,D,B,C);
    n=np;
    }

  void n(int np) {n=np;}                  // changes cell-count

  void COTSupdateMap(pt A1, pt B1, pt C1, pt D1, int np)     // recomputes COTS parameter, selecting angle branchings that minimize pops
    {
    n=np;
    A=P(A1);  B=P(B1);  C=P(C1);  D=P(D1);  
    mu = spiralScale(A,B,D,C);
    mv = spiralScale(A,D,B,C);
    float pau=au, pav=av; // previous angles
    float aun = spiralAngle(A,B,D,C), avn = spiralAngle(A,D,B,C); // new values

    float aue = aun-au; // u difference
    if(abs(aue+TWO_PI)<abs(aue)) aue+=TWO_PI;
    if(abs(aue-TWO_PI)<abs(aue)) aue-=TWO_PI;
    if(abs(aue+TWO_PI)<abs(aue)) aue+=TWO_PI;
    if(abs(aue-TWO_PI)<abs(aue)) aue-=TWO_PI;
     
    float ave = avn-av; // v difference
    if(abs(ave+TWO_PI)<abs(ave)) ave+=TWO_PI;
    if(abs(ave-TWO_PI)<abs(ave)) ave-=TWO_PI;
    if(abs(ave+TWO_PI)<abs(ave)) ave+=TWO_PI;
    if(abs(ave-TWO_PI)<abs(ave)) ave-=TWO_PI;

    if(resetBranching) {au=aun; av=avn; resetBranching=false;} 
    else {au=pau+aue; av=pav+ave;}

    F = SpiralCenter(au,mu,A,D);  
    }

  void showCorners() {noStroke(); fill(black); fill(red); show(A,6); fill(dgreen); show(B,6); fill(blue); show(C,6); fill(magenta); show(D,6);  }    

  void showLabels() {pen(black,1); showId(CM.A,"a"); showId(CM.B,"b"); showId(CM.C,"c"); showId(CM.D,"d"); if(showFixedPoint) showId(CM.F,"f"); }

  float scaling(float x, float y) {return pow(mu,x)*pow(mv,y);} // returns relative scaling factor that corresponds to parameter translation by (x,y)
  
  void showCircMappedTo(pt O, pt R, pt M) {pt Mi=Inverse(M); pt Oi=Inverse(O);  show(M,d(O,R)*scaling(Mi.x-Oi.x,Mi.y-Oi.y)); }  
  void showCircMappedTo(pt C, float r, pt M) {pt Mi=Inverse(M);  show(M,r*scaling(Mi.x-C.x,Mi.y-C.y)); }  
  pt ImageOf(float u, float v) {return spiralPt(spiralPt(A,F,mu,au,u),F,mv,av,v);}
  pt ImageOf(pt P) {return spiralPt(spiralPt(A,F,mu,au,P.x),F,mv,av,P.y);}
  pt ImageNotExponentialOf(pt P) {return spiralNotExponentialPt(spiralNotExponentialPt(A,F,mu,au,P.x),F,mv,av,P.y);}
  pt Transform(pt P, float u, float v) {return spiralPt(spiralPt(P,F,mu,au,u),F,mv,av,v);}

  pt ImageCoonsOf(pt P) 
    {
    float u = P.x, v=P.y;
    pt Su0 =   Map(u,0,F,A,au,mu,av,mv); 
    pt Su1 =   Map(u,1,F,A,au,mu,av,mv); 
    pt Su =    L(Su0,v,Su1);
    pt S0v =   Map(0,v,F,A,au,mu,av,mv); 
    pt S1v =   Map(1,v,F,A,au,mu,av,mv); 
    pt Sv =    L(S0v,u,S1v);
    pt L = BiL(A,D,B,C,u,v);
    pt S = P(Su,V(L,Sv));
      //noFill(); strokeWeight(2);
      //stroke(dgreen); show(Su0,5); show(Su1,5); edge(Su0,Su1); show(Su,5);
      //stroke(blue); show(S0v,5); show(S1v,5); edge(S0v,S1v); show(Sv,5);
      //stroke(magenta); show(L,5);
      //stroke(red); show(S,5);
    return S;
    }


 void showCirclePattern()
   {
   float r = 100000;
   float s = 1./n;
   pt CC = ImageOf(cx*s,cy*s);  
   for(float t = 0; t<TWO_PI*0.99; t+=TWO_PI/36) 
     {
     pt CR = ImageOf((cx+cos(t))*s,(cy+sin(t))*s); 
     float d = d(CC,CR);
     r=min(r,d);
     }
   for(int i=0; i<n; i++) 
     for(int j=0; j<n; j++) 
       show( ImageOf( (cx+i)/n,(cy+j)/n),r*cr*scaling(((float)i)/n,((float)j)/n) );  
   }

 pt CircleCenterPoint()
   {
   return ImageOf(cx/n,cy/n);
   }
   
 pt CircleRadiusPoint(pt CRP)
   {
   float r = 100000;
   float s = 1./n;
   pt CirRadPt = P();
   pt CC = ImageOf(cx*s,cy*s); 
   pt CR = P();
   for(float t = 0; t<TWO_PI*0.999; t+=TWO_PI/120) 
     {
     CR = ImageOf((cx+cos(t)*cr)*s,(cy+sin(t)*cr)*s); 
     float d = d(CC,CR);
     if(d<r) {r=d; CirRadPt=P(CR);}
     }
   return MoveByDistanceTowards(CC,r,CRP);
   }
   
 void setCircle(pt Cc, pt Cr) // computes cx, cy, cr of circle from its center and sample point
   {
   pt Ci = Inverse(Cc); cx=Ci.x*n; cy=Ci.y*n;
   float d = d(Cc,Cr);
   float s = 1./n;
   float m=0.5;
   float r = 0;
   for(float t = 0; t<TWO_PI*0.99; t+=TWO_PI/36) 
     {
     pt CR =  Inverse(P(Cc,d,R(V(1,0),t))); // ImageOf((cx+cos(t)*m)*s,(cy+sin(t)*m)*s); show(CR,1);
     float rr = d(Ci,CR);
     r=max(r,rr);
     }
   cr=r*n;
   }
 
 void ShowCircleField(pt O, pt R)
   {
   pt Oi = Inverse(O);               
   int i=0, j=0; // for(int i=0; i<n; i++) for(int j=0; j<n; j++) // for displaying the whole pattern of magenta circles
   showCircMappedTo(O,R,ImageOf((float)i/n+Oi.x,(float)j/n+Oi.y));
   }

 pt Inverse(pt M) 
    {
    pt Mi; 
    float x, y;
    int lineShift=0;
    float amin = min(min(0.0,au+av),min(au,av));
    float amax = max(max(0.0,au+av),max(au,av));
    float mmin = min(min(1.0,mu*mv),min(mu,mv));
    float mmax = max(max(1.0,mu*mv),max(mu,mv)); 
    float pm = d(F,M)/d(F,A);
    float pa = angle(V(F,A),V(F,M));
    for(int i=-2; i<=2; i++)  
      {
      float ppa = pa +TWO_PI*i;
      Mi =  MapInv(ppa, pm, F, A,  au,  mu,  av,  mv);
      x = Mi.x; y=Mi.y;
      if(amin<ppa && ppa<amax && mmin<pm && 0<=x && x<=1 && 0<=y && y<=1 )
        {
        return Mi;
        }
      }
    return MapInv(pa, pm, F, A,  au,  mu,  av,  mv);
    }

  void showUcurve(float u)
    {
    int s=100; // sample count along each isocurve
    noFill(); pen(red,4); 
    beginShape();
    for(int j=0; j<s; j++) 
      {
      pt P = P(u,(float)j/(s-1)); 
      v(ImageOf(P)); 
      }
    endShape();
    }

  void showVcurve(float v)
    {
    int s=100; // sample count along each isocurve
    noFill(); pen(blue,4); 
    beginShape();
       for(int i=0; i<s; i++) 
        {
        pt P = P((float)i/(s-1),v); 
        v(ImageOf(P)); 
        }
    endShape();
    }

  void showIsocurves()
    {
    noFill();
    int s=100; // sample count along each isocurve
    pen(red,2); 
    for(int i=0; i<=n; i++)
      {
      beginShape();
      for(int j=0; j<s; j++) 
        {
        pt P = P((float)i/n,(float)j/(s-1)); 
        v(ImageOf(P)); 
        }
      endShape();
      }
    pen(blue,2); 
    for(int j=0; j<=n; j++)
      {
      beginShape();
      for(int i=0; i<s; i++) 
        {
        pt P = P((float)i/(s-1),(float)j/n); 
        v(ImageOf(P)); 
        }
      endShape();
      }
    }
    
  void showPMIsocurves()
    {
    noFill();
    int s=100; // sample count along each isocurve
    pen(orange,6); 
    for(int i=0; i<=n; i++)
      {
      beginShape();
      for(int j=0; j<s; j++) 
        {
        pt P = P((float)i/n,(float)j/(s-1)); 
        v(ImageNotExponentialOf(P)); 
        }
      endShape();
      }
    pen(green,6); 
    for(int j=0; j<=n; j++)
      {
      beginShape();
      for(int i=0; i<s; i++) 
        {
        pt P = P((float)i/(s-1),(float)j/n); 
        v(ImageNotExponentialOf(P)); 
        }
      endShape();
      }
    }

   
  void showCoonsIsocurves()
    {
    noFill();
    int s=100; // sample count along each isocurve
    pen(magenta,6); 
    for(int i=0; i<=n; i++)
      {
      beginShape();
      for(int j=0; j<s; j++) 
        {
        pt P = P((float)i/n,(float)j/(s-1)); 
        v(ImageCoonsOf(P)); 
        }
      endShape();
      }
    pen(cyan,6); 
    for(int j=0; j<=n; j++)
      {
      beginShape();
      for(int i=0; i<s; i++) 
        {
        pt P = P((float)i/(s-1),(float)j/n); 
        v(ImageCoonsOf(P)); 
        }
      endShape();
      }
    }


    
  void showPattern()
    {
    float s=1./ne;
      
    float r = 100000;
    pt CC = ImageOf(cx*s,cy*s);  
    for(float t = 0; t<TWO_PI*0.99; t+=TWO_PI/36) 
       {
       pt CR = ImageOf((cx+cos(t))*s,(cy+sin(t))*s); 
       float d = d(CC,CR);
       r=min(r,d);
       }

    for(float u=0; u<1+s/2; u+=s)
        for(float v=0; v<1+s/2; v+=s)
            {
            pushMatrix();
            translate(F.x,F.y);
            rotate(u*au+v*av);
            scale(scaling(u,v)); // scale(pow(mu,u)*pow(mv,v)); 
            translate(-F.x,-F.y);
            translate(A.x,A.y);
            scale(r/400);
            showTemplate();
            popMatrix();
            }
    }
    
  void showBorder() 
    {
    noFill(); pen(grey,4);
    int s=100; // sample count along each isocurve
    for(int i=0; i<n; i+=n-1)
      {
      beginShape();
      for(int j=0; j<s; j++) 
        {
        pt P = P((float)i/(n-1),(float)j/(s-1)); 
        v(ImageOf(P)); 
        }
      endShape();
      }
    for(int j=0; j<n; j+=n-1)
      {
      beginShape();
      for(int i=0; i<s; i++) 
        {
        pt P = P((float)i/(s-1),(float)j/(n-1)); 
        v(ImageOf(P)); 
        }
      endShape();
      }
     }
  
  void warpCircle()
    {
    noFill();
    stroke(orange);
    strokeWeight(6);
    beginShape();
    for(float u=0; u<TWO_PI; u+=0.03)
      {
      pt Q = Map( 0.5+sqrt(0.5)*cos(u),0.5+sqrt(0.5)*sin(u), F, A, au, mu, av, mv); 
      v(Q);
      }
    endShape(CLOSE);
    }

  void warpCircles()
    {
    noFill();
    stroke(magenta);
    strokeWeight(3);
    for(int i=0; i<n; i++) for(int j=0; j<n; j++) warpCircle(i,j);
    }
    
  void warpCircle(int i, int j)
    {
    beginShape();
    float r = 1./n;
    for(float u=0; u<TWO_PI; u+=0.12)
      {
      pt Q = Map( r/2+r*i+r/2*cos(u),r/2+r*j+r/2*sin(u), F, A, au, mu, av, mv); 
      v(Q);
      }
    endShape(CLOSE);
    }

  void showHubs()
   {
   noStroke(); fill(dgreen);
   float r = 100000;
   float s = 1./n;
   pt CC = ImageOf(cx*s,cy*s);  
   for(float t = 0; t<TWO_PI*0.99; t+=TWO_PI/36) 
     {
     pt CR = ImageOf((cx+cos(t))*s,(cy+sin(t))*s); 
     float d = d(CC,CR);
     r=min(r,d);
     }
    for(int i=0; i<n; i++) 
     for(int j=0; j<n; j++) 
       {
       stump(ImageOf( (cx+i)/n,(cy+j)/n) ,   r*cr*scaling(((float)i)/n,((float)j)/n) , 
             ImageOf( (cx+i-1)/n,(cy+j)/n) , r*cr*scaling(((float)(i-1))/n,((float)j)/n) ); 
       stump(ImageOf( (cx+i)/n,(cy+j)/n) ,   r*cr*scaling(((float)i)/n,((float)j)/n) , 
             ImageOf( (cx+i+1)/n,(cy+j)/n) , r*cr*scaling(((float)(i+1))/n,((float)j)/n) ); 
       stump(ImageOf( (cx+i)/n,(cy+j)/n) ,   r*cr*scaling(((float)i)/n,((float)j)/n) , 
             ImageOf( (cx+i)/n,(cy+j-1)/n) , r*cr*scaling(((float)(i))/n,((float)(j-1))/n) ); 
       stump(ImageOf( (cx+i)/n,(cy+j)/n) ,   r*cr*scaling(((float)i)/n,((float)j)/n) , 
             ImageOf( (cx+i)/n,(cy+j+1)/n) , r*cr*scaling(((float)(i))/n,((float)(j+1))/n) );
       }
    }

   void showCheckerboard()
     {
     noStroke();
     for(int i=0; i<n; i++)
       for(int j=0; j<n; j++)
         {
         if( (i+j) % 2 == 0 ) fill(yellow); else fill(grey);
         showCell(i,j);
         }
     noFill();
     }

   void showTextured()
     {
     noStroke();
     noFill();
     for(int i=0; i<n; i++)
       for(int j=0; j<n; j++)
         // showCell(i, j);
         showCellTextured(i, j);
     }
     
   void showCellTextured(int i, int j)
    {
    float d=1./n, e=0, m=d*e, u=d*i, v=d*j;
    int s=max(1,ceil(127./(n-1)));
    float w=(d-m*2)/(s-1);
    beginShape();
    texture(myFace);
    for(int k=0; k<s-1; k++) 
          {
          pt Q = Map( u+m, v+m+w*k, F, A, au, mu, av, mv); 
          v(Q, u+m, v+m+w*k); //show(Q,2);
          }
    for(int k=0; k<s-1; k++) 
          {
          pt Q = Map( u+m+w*k, v+d-m, F, A, au, mu, av, mv); 
          v(Q, u+m+w*k, v+d-m);   //show(Q,2);
          }
    for(int k=0; k<s-1; k++) 
          {
          pt Q = Map( u+d-m, v+d-m-w*k, F, A, au, mu, av, mv); 
          v(Q, u+d-m, v+d-m-w*k); //show(Q,2);
          }
      for(int k=0; k<s-1; k++) 
          {
          pt Q = Map( u+d-m-w*k, v+m, F, A, au, mu, av, mv); 
          v(Q, u+d-m-w*k, v+m);   //show(Q,2);
          }
    endShape(CLOSE); 
    }
  
   void showCell(int i, int j)
    {
    float d=1./n, e=0, m=d*e, u=d*i, v=d*j;
    int s=max(1,ceil(127./(n-1)));
    float w=(d-m*2)/(s-1);
    beginShape();
    for(int k=0; k<s-1; k++) 
          {
          pt Q = Map( u+m, v+m+w*k, F, A, au, mu, av, mv); 
          v(Q); //show(Q,2);
          }
    for(int k=0; k<s-1; k++) 
          {
          pt Q = Map( u+m+w*k, v+d-m, F, A, au, mu, av, mv); 
          v(Q);   //show(Q,2);
          }
    for(int k=0; k<s-1; k++) 
          {
          pt Q = Map( u+d-m, v+d-m-w*k, F, A, au, mu, av, mv); 
          v(Q); //show(Q,2);
          }
      for(int k=0; k<s-1; k++) 
          {
          pt Q = Map( u+d-m-w*k, v+m, F, A, au, mu, av, mv); 
          v(Q);   //show(Q,2);
          }
    endShape(CLOSE); 
    }
  
 
  } // end of COTSMap
  
  
  
  
//************************* SPIRAL ***************** Between Edge(A,B) and Edge(C,D), not (D,C) as in COTS
float spiralAngle(pt A0, pt B0, pt A1, pt B1) {return angle(V(A0,B0),V(A1,B1));} 

float spiralScale(pt A0, pt B0, pt A1, pt B1) {return d(A1,B1)/d(A0,B0);}

pt SpiralCenter(float a, float m, pt A0, pt A1)  // computes fixed-point of spiral that takes A0 to A1 
  {
  float c=cos(a), s=sin(a);
  vec W = V(m*c-1,m*s);
  float d = dot(W,W);
  vec A1A0 = V(A1,A0);
  vec V = V(dot(W,A1A0),det(W,A1A0));
  return P(A0,1./d,V);
  }
  

pt spiralPt(pt A, pt F, float m, float a, float t)     //  A rotated by at and scaled by s^t wrt G
  {return L(F,R(A,t*a,F),pow(m,t));}  

pt spiralNotExponentialPt(pt A, pt F, float m, float a, float t)     //  A rotated by at and scaled by s^t wrt G
  {return L(F,R(A,t*a,F),1.+t*(m-1));}  

vec spiralVec(vec V, float m, float a, float t)     //  A rotated by at and scaled by s^t wrt G
  {return S(pow(m,t),R(V,t*a));}  


//************************* Bi-Spiral MAP **********************************
pt Map(float u, float v, pt F, pt A, float au, float mu, float av, float mv) 
  {
  return spiralPt(spiralPt(A,F,mu,au,u),F,mv,av,v);
  }

pt Map(pt P, pt F, pt A, float au, float mu, float av, float mv) 
  {
  return spiralPt(spiralPt(A,F,mu,au,P.x),F,mv,av,P.y);
  }

pt MapInv(pt M, pt F, pt A, float au, float mu, float av, float mv) 
  {
  float a = angle(V(F,A),V(F,M));
  float m = d(F,M)/d(F,A);
  float u = (log(m)*av-log(mv)*a) / (log(mu)*av-log(mv)*au);
  float v = (a-u*au)/av;
  return P(u,v);
  }
  
pt MapInv(float a, float m, pt F, pt A, float au, float mu, float av, float mv) 
  {
  float u = (log(m)*av-log(mv)*a) / (log(mu)*av-log(mv)*au);
  float v = (a-u*au)/av;
  return P(u,v);
  }
  
//************************* DISPLAY BLUE STAR **********************************
void showTemplate()
  {
  float d=100, b=d*sqrt(3);
  show(P(0,-d*2),P(b,d),P(-b,d));
  rotate(PI/3);
  show(P(0,-d*2),P(b,d),P(-b,d));
  }
  
 
