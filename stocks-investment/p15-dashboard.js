/* Project 15 gold drivers dashboard. Needs window.P15DATA (p15-data.js). Dependency-free SVG. */
(function(){
var D=window.P15DATA;if(!D)return;
var NS='http://www.w3.org/2000/svg';
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function h(tag,cls,html,p){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(p)p.appendChild(e);return e;}
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}
function nice(min,max,n){var span=max-min||1,step=Math.pow(10,Math.floor(Math.log10(span/n))),err=span/n/step;step*=err>=7.5?10:err>=3.5?5:err>=1.5?2:1;var lo=Math.floor(min/step)*step,hi=Math.ceil(max/step)*step,t=[];for(var v=lo;v<=hi+step/2;v+=step)t.push(+v.toFixed(10));return t;}
function logTicks(lo,hi){var c=[1,2,5],t=[];for(var e=Math.floor(Math.log10(lo));e<=Math.ceil(Math.log10(hi));e++)c.forEach(function(m){var v=m*Math.pow(10,e);if(v>=lo*0.98&&v<=hi*1.02)t.push(v);});return t;}
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function md(s){var p=s.split('-');return MON[+p[1]-1]+' '+p[0];}
function mi(s){var p=s.split('-');return (+p[0])*12+(+p[1]-1);}
function fmtN(v,d){return v.toLocaleString('en-US',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});}
function usd(v){return '$'+fmtN(v);}
var S=D.series;
function at(s,m){var i=s.dates.indexOf(m);return i<0?null:s.values[i];}
function pts(s,from,to){var o=[];for(var i=0;i<s.dates.length;i++){var k=mi(s.dates[i]);if((from==null||k>=from)&&(to==null||k<=to))o.push({m:s.dates[i],k:k,v:s.values[i]});}return o;}
function setup(host,H){host.innerHTML='';host.classList.add('chart');var W=Math.max(300,host.clientWidth||600);var svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img'},host);var tip=h('div','tip',null,host);return{W:W,H:H,svg:svg,tip:tip};}
function tipOn(c,x,y,html){var r=c.svg.getBoundingClientRect();c.tip.innerHTML=html;c.tip.style.left=(x*r.width/c.W)+'px';c.tip.style.top=(y*r.height/c.H)+'px';c.tip.classList.add('on');}
function grad(svg,id,col,a1,a2){var defs=el('defs',{},svg),g=el('linearGradient',{id:id,x1:0,y1:0,x2:0,y2:1},defs);el('stop',{offset:'0%','stop-color':col,'stop-opacity':a1},g);el('stop',{offset:'100%','stop-color':col,'stop-opacity':a2},g);return 'url(#'+id+')';}
var GOLD=function(){return css('--gold')||'#b8862b';};
var uid=0;

/* ---------- 1. Live tiles ---------- */
var L=D.latest;
var TILES=[
 {k:'gold',name:'Gold spot',val:'$3,472',sub:'Nov 25, 2026, 9:00 a.m. ET',s:S.gold,unit:'$',rule:'gold'},
 {k:'fedfunds',name:'Fed funds rate',val:fmtN(L.fedfunds.value,2)+'%',sub:md(L.fedfunds.date.slice(0,7))+' average',s:S.fedfunds,rule:'up-bad',d:'pts'},
 {k:'realyield',name:'US 10-yr real yield',val:fmtN(L.realyield.value,2)+'%',sub:'10-yr TIPS, '+L.realyield.date,s:S.realyield,rule:'up-bad',d:'pts'},
 {k:'dollar',name:'US dollar index',val:fmtN(L.dollar.value,1),sub:'Broad index, '+L.dollar.date,s:S.dollar,rule:'up-bad'},
 {k:'oil',name:'WTI crude oil',val:'$'+fmtN(L.oil.value,2),sub:'Per barrel, '+L.oil.date,s:S.oil,rule:'up-good'},
 {k:'ust10',name:'10-yr Treasury',val:fmtN(L.ust10.value,2)+'%',sub:'Nominal yield, '+L.ust10.date,s:null,rule:'up-bad',d:'pts'},
 {k:'sp500',name:'S&P 500',val:fmtN(L.sp500.value,0),sub:'Close, '+L.sp500.date,s:S.sp500,rule:'stocks'},
 {k:'nasdaq',name:'Nasdaq Composite',val:fmtN(L.nasdaq.value,0),sub:'Close, '+L.nasdaq.date,s:S.nasdaq,rule:'stocks'}];
function drawTiles(){var host=document.getElementById('p15tiles');if(!host)return;host.innerHTML='';
 TILES.forEach(function(t){var card=h('div','dtile',null,host);h('div','dk',t.name,card);h('div','dv',t.val,card);
  var chg='',chip='';
  if(t.s){var n=t.s.values.length,a=t.s.values[n-1],b=t.s.values[n-13];if(t.k==='gold'){a=3471.52;b=at(S.gold,'2025-11')||b;}var diff=t.d==='pts'?(a-b):(a/b-1)*100;var up=diff>=0;
   chg='<span class="'+(up?'up':'dn')+'">'+(up?'▲':'▼')+' '+fmtN(Math.abs(diff),t.d==='pts'?2:1)+(t.d==='pts'?' pts':'%')+'</span> vs 12 months earlier';
   var good=t.rule==='up-bad'?!up:t.rule==='up-good'?up:t.rule==='stocks'?!up:null;
   var NOUN={fedfunds:'Rate',realyield:'Real yield',dollar:'Dollar',oil:'Oil',sp500:'Stocks',nasdaq:'Stocks'}[t.k];
   if(t.rule==='gold')chip='<span class="dchip warn">37% below record</span>';else chip=(good?'<span class="dchip good">▲ Good for gold price</span>':'<span class="dchip bad">▼ Bad for gold price</span>')+'<div class="dwhy">'+NOUN+(up?' rising':' falling')+' over 12 months</div>';}
  else chip='<span class="dchip bad">▼ Bad for gold price</span><div class="dwhy">Yield high, above 4.5%</div>';
  var RULE={'up-bad':'Usually: this rises → gold falls','up-good':'Usually: this rises → gold rises','stocks':'Usually: stocks fall → gold gains as a safe haven','gold':'Gold\'s own price'};
  h('div','ds',t.sub,card);if(chg)h('div','dc',chg,card);h('div','drule',RULE[t.rule],card);card.title=RULE[t.rule]+'. The badge shows whether the last 12 months\' move is good or bad for the gold price.';
  if(t.s){var sp=h('div','dspark',null,card);var c=setup(sp,40),p=t.s.values.slice(-60),lo=Math.min.apply(null,p),hi=Math.max.apply(null,p);
   var x=function(i){return i*(c.W)/(p.length-1)},y=function(v){return 36-32*(v-lo)/(hi-lo||1)};var d='';p.forEach(function(v,i){d+=(i?'L':'M')+x(i).toFixed(1)+','+y(v).toFixed(1)});
   var col=t.k==='gold'?GOLD():css('--accent');el('path',{d:d+'L'+c.W+',40L0,40Z',fill:grad(c.svg,'sp'+(uid++),col,.25,0)},c.svg);el('path',{d:d,fill:'none',stroke:col,'stroke-width':1.8},c.svg);el('circle',{cx:x(p.length-1),cy:y(p[p.length-1]),r:3,fill:col},c.svg);}
  h('div','dfoot',chip,card);});}

/* ---------- 2. Gold history with events ---------- */
var EVENTS=[
 ['1971-08','Nixon shock','The US ends dollar-to-gold convertibility; gold starts to float.'],
 ['1980-01','1980 peak','Gold hits $850 on high inflation and the Iran and Afghanistan crises.'],
 ['1987-10','Black Monday','The S&P 500 falls 20% in one day.'],
 ['1999-09','Washington Agreement','European central banks cap gold sales, near gold\'s 20-year low.'],
 ['2001-09','9/11 attacks','Start of gold\'s 2001–2011 bull market.'],
 ['2008-09','Lehman collapse','Global financial crisis; gold falls first, then rallies on rate cuts and QE.'],
 ['2011-09','2011 peak','Gold nears $1,900 after QE and the euro debt crisis.'],
 ['2013-04','Taper crash','Gold drops as real yields jump on Fed taper talk.'],
 ['2020-03','COVID crash','Stocks fall about 34%; the Fed cuts to zero.'],
 ['2022-02','Ukraine war and Fed hikes','Russia\'s reserves are frozen and central bank buying jumps above 1,000t a year; the Fed starts its fastest hikes in decades.'],
 ['2026-01','Record high','Gold hits $5,589 intraday on Jan 28, 2026.'],
 ['2026-10','2026 sell-off','Fed hike pricing, a 10-yr yield above 5% and a strong dollar push gold down.']];
var goldRange='all';
function rangeFrom(r,s){var end=mi(s.end);return r==='all'?null:end-12*(+r);}
function drawGold(){var host=document.getElementById('p15gold');if(!host)return;var narrow=host.clientWidth<600;var c=setup(host,narrow?300:380);
 var P=pts(S.gold,rangeFrom(goldRange,S.gold));var Lm=narrow?40:50,R=14,T=30,B=26;
 var lo=Math.min.apply(null,P.map(function(p){return p.v})),hi=Math.max.apply(null,P.map(function(p){return p.v}));
 var useLog=hi/lo>4;var f=useLog?Math.log:function(v){return v};
 var ticks=useLog?logTicks(lo,hi):nice(lo,hi,4);var ylo=useLog?Math.min(lo,ticks[0]):ticks[0],yhi=useLog?Math.max(hi,ticks[ticks.length-1]):ticks[ticks.length-1];
 var k0=P[0].k,k1=P[P.length-1].k;var x=function(k){return Lm+(c.W-Lm-R)*(k-k0)/(k1-k0||1)},y=function(v){return T+(c.H-T-B)*(1-(f(v)-f(ylo))/(f(yhi)-f(ylo)))};
 ticks.forEach(function(t){el('line',{x1:Lm,x2:c.W-R,y1:y(t),y2:y(t),class:'gridline'},c.svg);var tx=el('text',{x:Lm-6,y:y(t)+4,'text-anchor':'end',class:'axis'},c.svg);tx.textContent=t>=1000?'$'+(t/1000)+'k':'$'+t;});
 var yrs=(k1-k0)/12,step=yrs>40?10:yrs>15?5:yrs>6?2:1;for(var yr=Math.ceil(k0/12);yr*12<=k1;yr++){if(yr%step)continue;var t=el('text',{x:x(yr*12),y:c.H-6,'text-anchor':'middle',class:'axis'},c.svg);t.textContent=yr;}
 var d='';P.forEach(function(p,i){d+=(i?'L':'M')+x(p.k).toFixed(1)+','+y(p.v).toFixed(1)});
 el('path',{d:d+'L'+x(k1)+','+(c.H-B)+'L'+x(k0)+','+(c.H-B)+'Z',fill:grad(c.svg,'gg'+(uid++),GOLD(),.32,.02)},c.svg);
 el('path',{d:d,fill:'none',stroke:GOLD(),'stroke-width':2.2,'stroke-linejoin':'round'},c.svg);
 var evs=EVENTS.filter(function(e){var k=mi(e[0]);return k>=k0&&k<=k1;});
 evs.forEach(function(e,i){var k=mi(e[0]),v=at(S.gold,e[0]);var ex=x(k);el('line',{x1:ex,x2:ex,y1:T-12,y2:c.H-B,stroke:css('--muted'),'stroke-dasharray':'2 3',opacity:.45},c.svg);
  var num=EVENTS.indexOf(e)+1;var g=el('g',{style:'cursor:pointer'},c.svg);el('circle',{cx:ex,cy:T-14,r:narrow?7:9,fill:css('--ink')},g);var tt=el('text',{x:ex,y:T-10.5,'text-anchor':'middle','font-size':narrow?9:10.5,'font-weight':700,fill:css('--bg'),'font-family':css('--sans')},g);tt.textContent=num;
  if(v)el('circle',{cx:ex,cy:y(v),r:3.5,fill:css('--surface'),stroke:css('--ink'),'stroke-width':1.5},c.svg);
  function on(){tipOn(c,ex,T-4,'<b>'+num+'. '+e[1]+'</b> · '+md(e[0])+'<br>'+e[2]+(v?'<br>Gold '+usd(v)+' (monthly avg)':''));}
  g.addEventListener('mouseenter',on);g.addEventListener('click',on);g.addEventListener('mouseleave',function(){c.tip.classList.remove('on')});});
 var cross=el('line',{y1:T,y2:c.H-B,stroke:css('--muted'),opacity:0},c.svg),dot=el('circle',{r:4.5,fill:GOLD(),stroke:css('--surface'),'stroke-width':2,opacity:0},c.svg);
 var hit=el('rect',{x:Lm,y:T,width:c.W-Lm-R,height:c.H-T-B,fill:'transparent'},c.svg);
 function mv(ev){var r=c.svg.getBoundingClientRect(),px=((ev.touches?ev.touches[0].clientX:ev.clientX)-r.left)*c.W/r.width;var k=Math.round(k0+(px-Lm)/(c.W-Lm-R)*(k1-k0));var best=P[0];P.forEach(function(p){if(Math.abs(p.k-k)<Math.abs(best.k-k))best=p});
  cross.setAttribute('x1',x(best.k));cross.setAttribute('x2',x(best.k));cross.setAttribute('opacity',.5);dot.setAttribute('cx',x(best.k));dot.setAttribute('cy',y(best.v));dot.setAttribute('opacity',1);tipOn(c,x(best.k),y(best.v),'<b>'+md(best.m)+'</b><br>Gold '+usd(best.v)+' (monthly avg)');}
 hit.addEventListener('mousemove',mv);hit.addEventListener('touchstart',mv,{passive:true});hit.addEventListener('mouseleave',function(){c.tip.classList.remove('on');cross.setAttribute('opacity',0);dot.setAttribute('opacity',0)});
 var list=document.getElementById('p15events');if(list){list.innerHTML='';EVENTS.forEach(function(e,i){var g0=at(S.gold,e[0]),k=mi(e[0])+12,g1=null;S.gold.dates.forEach(function(m,j){if(mi(m)===k)g1=S.gold.values[j]});
  var ch=g0&&g1?((g1/g0-1)*100):null;var row=h('div','ev',null,list);row.innerHTML='<span class="evn">'+(i+1)+'</span><div><b>'+e[1]+'</b> <span class="evd">'+md(e[0])+'</span><div class="evt">'+e[2]+'</div></div><div class="evg">'+(ch==null?'<span class="muted">n/a</span>':'<span class="'+(ch>=0?'up':'dn')+'">'+(ch>=0?'+':'')+fmtN(ch,0)+'%</span>')+'<small>gold, next 12 mo</small></div>';});}}

/* ---------- 3. Factor explorer ---------- */
var FACT={
 fedfunds:{name:'Fed funds rate',s:S.fedfunds,unit:'%',dp:2,chg:'pts',why:'Higher policy rates raise the cost of holding gold, which pays no interest. Hiking cycles (1980, 2022, 2026) have pressured gold; cuts have helped.'},
 realyield:{name:'US 10-yr real yield (TIPS)',s:S.realyield,unit:'%',dp:2,chg:'pts',why:'The strongest short-term driver: when inflation-adjusted yields rise, gold usually falls. Central bank buying weakened this link after 2022.'},
 dollar:{name:'US dollar index (broad)',s:S.dollar,unit:'',dp:1,chg:'pct',why:'Gold is priced in dollars, so a stronger dollar tends to push gold down. The research puts the correlation at about −0.4 to −0.5.'},
 oil:{name:'WTI crude oil',s:S.oil,unit:'$',dp:2,chg:'pct',why:'Oil feeds inflation and inflation fears, so oil and gold often rise together, especially in supply shocks such as 1979 and 2022.'},
 sp500:{name:'S&P 500',s:S.sp500,unit:'',dp:0,chg:'pct',why:'Gold often holds up when stocks crash, but not always: in liquidity squeezes such as 2008 and 2020 gold fell at first, then recovered.'},
 nasdaq:{name:'Nasdaq Composite',s:S.nasdaq,unit:'',dp:0,chg:'pct',why:'Tech-led crashes (2000–02, 2022) show how gold behaves when growth stocks fall: up in 2000–02, down with rising rates in 2022.'}};
var curF='realyield',facRange='20';
function corr(a,b){var n=a.length;if(n<6)return null;var ma=0,mb=0;for(var i=0;i<n;i++){ma+=a[i];mb+=b[i]}ma/=n;mb/=n;var sa=0,sb=0,sab=0;for(i=0;i<n;i++){sa+=(a[i]-ma)*(a[i]-ma);sb+=(b[i]-mb)*(b[i]-mb);sab+=(a[i]-ma)*(b[i]-mb)}return sab/Math.sqrt(sa*sb);}
function drawFactor(){var host=document.getElementById('p15factor');if(!host)return;var F=FACT[curF];var narrow=host.clientWidth<600;var c=setup(host,narrow?280:340);
 var from=Math.max(mi(F.s.start),rangeFrom(facRange,F.s)||0),to=Math.min(mi(F.s.end),mi(S.gold.end));
 var FP=pts(F.s,from,to),GP=pts(S.gold,from,to);var Lm=narrow?40:52,R=narrow?40:52,T=12,B=26;
 var k0=Math.max(FP[0].k,GP[0].k),k1=Math.min(FP[FP.length-1].k,GP[GP.length-1].k);
 FP=FP.filter(function(p){return p.k>=k0&&p.k<=k1});GP=GP.filter(function(p){return p.k>=k0&&p.k<=k1});
 var x=function(k){return Lm+(c.W-Lm-R)*(k-k0)/(k1-k0||1)};
 var gv=GP.map(function(p){return p.v}),glo=Math.min.apply(null,gv),ghi=Math.max.apply(null,gv),gT=nice(glo,ghi,4);var gy=function(v){return T+(c.H-T-B)*(1-(v-gT[0])/(gT[gT.length-1]-gT[0]))};
 var fv=FP.map(function(p){return p.v}),flo=Math.min.apply(null,fv),fhi=Math.max.apply(null,fv),fT=nice(flo,fhi,4);var fy=function(v){return T+(c.H-T-B)*(1-(v-fT[0])/(fT[fT.length-1]-fT[0]))};
 gT.forEach(function(t){el('line',{x1:Lm,x2:c.W-R,y1:gy(t),y2:gy(t),class:'gridline'},c.svg);var tx=el('text',{x:Lm-6,y:gy(t)+4,'text-anchor':'end',class:'axis',fill:GOLD()},c.svg);tx.textContent=t>=1000?'$'+fmtN(t/1000,t%1000?1:0)+'k':'$'+t;});
 fT.forEach(function(t){var tx=el('text',{x:c.W-R+6,y:fy(t)+4,'text-anchor':'start',class:'axis'},c.svg);tx.textContent=(F.unit==='$'?'$':'')+(Math.abs(t)>=1000?fmtN(t/1000,0)+'k':t)+(F.unit==='%'?'%':'');});
 var yrs=(k1-k0)/12,step=yrs>40?10:yrs>15?5:yrs>6?2:1;for(var yr=Math.ceil(k0/12);yr*12<=k1;yr++){if(yr%step)continue;var t=el('text',{x:x(yr*12),y:c.H-6,'text-anchor':'middle',class:'axis'},c.svg);t.textContent=yr;}
 function line(P,y,col,w,dash){var d='';P.forEach(function(p,i){d+=(i?'L':'M')+x(p.k).toFixed(1)+','+y(p.v).toFixed(1)});el('path',{d:d,fill:'none',stroke:col,'stroke-width':w,'stroke-dasharray':dash||'','stroke-linejoin':'round'},c.svg);}
 var gd='';GP.forEach(function(p,i){gd+=(i?'L':'M')+x(p.k).toFixed(1)+','+gy(p.v).toFixed(1)});el('path',{d:gd+'L'+x(k1)+','+(c.H-B)+'L'+x(k0)+','+(c.H-B)+'Z',fill:grad(c.svg,'fg'+(uid++),GOLD(),.18,0)},c.svg);
 line(GP,gy,GOLD(),2.2);line(FP,fy,css('--accent'),2);
 var cross=el('line',{y1:T,y2:c.H-B,stroke:css('--muted'),opacity:0},c.svg);var hit=el('rect',{x:Lm,y:T,width:c.W-Lm-R,height:c.H-T-B,fill:'transparent'},c.svg);
 function mv(ev){var r=c.svg.getBoundingClientRect(),px=((ev.touches?ev.touches[0].clientX:ev.clientX)-r.left)*c.W/r.width;var k=Math.round(k0+(px-Lm)/(c.W-Lm-R)*(k1-k0));k=Math.max(k0,Math.min(k1,k));var g=GP.filter(function(p){return p.k===k})[0],f=FP.filter(function(p){return p.k===k})[0];if(!g||!f)return;
  cross.setAttribute('x1',x(k));cross.setAttribute('x2',x(k));cross.setAttribute('opacity',.5);tipOn(c,x(k),Math.min(gy(g.v),fy(f.v)),'<b>'+md(g.m)+'</b><br>Gold '+usd(g.v)+'<br>'+F.name+': '+(F.unit==='$'?'$':'')+fmtN(f.v,F.dp)+(F.unit==='%'?'%':''));}
 hit.addEventListener('mousemove',mv);hit.addEventListener('touchstart',mv,{passive:true});hit.addEventListener('mouseleave',function(){c.tip.classList.remove('on');cross.setAttribute('opacity',0)});
 /* correlation of 12-month changes */
 var a=[],b=[];var gm={},fm={};GP.forEach(function(p){gm[p.k]=p.v});FP.forEach(function(p){fm[p.k]=p.v});
 for(var k=k0+12;k<=k1;k++){if(gm[k]&&gm[k-12]&&fm[k]!=null&&fm[k-12]!=null){a.push(Math.log(gm[k]/gm[k-12]));b.push(F.chg==='pts'?fm[k]-fm[k-12]:Math.log(fm[k]/fm[k-12]));}}
 var r=corr(a,b);var info=document.getElementById('p15finfo');
 var n=FP.length,last=FP[n-1].v;info.innerHTML='<div class="fstat"><span class="lg" style="background:'+GOLD()+'"></span>Gold <b>'+usd(GP[GP.length-1].v)+'</b></div><div class="fstat"><span class="lg" style="background:'+css('--accent')+'"></span>'+F.name+' <b>'+(F.unit==='$'?'$':'')+fmtN(last,F.dp)+(F.unit==='%'?'%':'')+'</b></div>'+
  (r==null?'':'<div class="fstat">Correlation of 12-month changes <b class="'+(r>=0?'up':'dn')+'">'+(r>=0?'+':'')+r.toFixed(2)+'</b></div>')+'<p class="fwhy">'+F.why+'</p>';}

/* ---------- 4. Central banks ---------- */
var CB=[['2022',1082],['2023',1037],['2024',1092],['2025',863],['2026*',675]],CBAVG=473;
var HOLD=[['United States',8133,'flat','No net buying in decades'],['Germany',3350,'flat',''],['Italy',2452,'flat',''],['France',2437,'flat',''],['China',2435,'up','24 straight months of buying (Oct 2026)'],['Russia',2277,'dn','Net seller in 2026 (Jul 2026)'],['Switzerland',1040,'flat',''],['India',880,'up','Steady buyer since 2017'],['Japan',846,'flat',''],['Poland',700,'up','Hit 700t target, Nov 2026']];
function drawCB(){var host=document.getElementById('p15cb');if(!host)return;var c=setup(host,330);var Lm=44,R=10,T=18,B=26;var hi=1200;var y=function(v){return T+(c.H-T-B)*(1-v/hi)};
 [0,300,600,900,1200].forEach(function(t){el('line',{x1:Lm,x2:c.W-R,y1:y(t),y2:y(t),class:t?'gridline':'zero'},c.svg);var tx=el('text',{x:Lm-6,y:y(t)+4,'text-anchor':'end',class:'axis'},c.svg);tx.textContent=fmtN(t)+'t';});
 var bw=(c.W-Lm-R)/CB.length;CB.forEach(function(d,i){var x0=Lm+i*bw+bw*.18,w=bw*.64;var r=el('rect',{x:x0,y:y(d[1]),width:w,height:y(0)-y(d[1]),rx:5,fill:i===CB.length-1?css('--accent'):GOLD(),opacity:i===CB.length-1?.85:1},c.svg);
  var t=el('text',{x:x0+w/2,y:y(d[1])-6,'text-anchor':'middle',class:'axis','font-weight':700,fill:css('--ink')},c.svg);t.textContent=fmtN(d[1])+'t';var l=el('text',{x:x0+w/2,y:c.H-6,'text-anchor':'middle',class:'axis'},c.svg);l.textContent=d[0];});
 el('line',{x1:Lm,x2:c.W-R,y1:y(CBAVG),y2:y(CBAVG),stroke:css('--bad'),'stroke-dasharray':'5 4','stroke-width':1.5},c.svg);var t=el('text',{x:c.W-R-4,y:y(CBAVG)-6,'text-anchor':'end',class:'axis',fill:css('--bad'),'font-weight':700,stroke:css('--surface'),'stroke-width':4,'paint-order':'stroke'},c.svg);t.textContent='2010–2021 average: 473t a year';
 var hl=document.getElementById('p15hold');if(hl){hl.innerHTML='';var mx=HOLD[0][1];HOLD.forEach(function(d){var row=h('div','hrow',null,hl);row.innerHTML='<div class="hname">'+d[0]+(d[3]?'<small>'+d[3]+'</small>':'')+'</div><div class="hbar"><i style="width:'+(100*d[1]/mx).toFixed(1)+'%" class="'+d[2]+'"></i></div><div class="hval">'+fmtN(d[1])+'t <span class="'+(d[2]==='up'?'up':d[2]==='dn'?'dn':'muted')+'">'+(d[2]==='up'?'▲':d[2]==='dn'?'▼':'–')+'</span></div>';});}}

/* ---------- 5. Crashes ---------- */
function drawCrashes(){var tb=document.getElementById('p15crash');if(!tb)return;var rows=D.crashes.slice().sort(function(a,b){return a.peak<b.peak?-1:1});
 tb.innerHTML=rows.map(function(c){var dur=mi(c.trough)-mi(c.peak);return '<tr><td>'+c.index+'</td><td>'+md(c.peak)+' → '+md(c.trough)+'</td><td>'+dur+' mo</td><td><span class="pill bad">'+fmtN(c.fall,1)+'%</span></td><td>'+(c.gold==null?'n/a':'<span class="pill '+(c.gold>=0?'good':'bad')+'">'+(c.gold>=0?'+':'')+fmtN(c.gold,1)+'%</span>')+'</td></tr>';}).join('');
 var up=rows.filter(function(c){return c.gold>0}).length;var s=document.getElementById('p15crashsum');if(s)s.innerHTML='Gold rose in <b>'+up+' of '+rows.length+'</b> stock-market falls deeper than 20% since 1971. It fell in the 1981–84 tech slumps and in 2022, when rising interest rates drove both down.';}

/* ---------- 6. Model forecast: fan, probability table, distribution ---------- */
var FX=D.forecast;
function drawFan(){var host=document.getElementById('p15fan');if(!host||!FX)return;var narrow=host.clientWidth<600;var c=setup(host,narrow?320:410);var Lm=narrow?42:52,R=narrow?58:104,T=14,B=26;
 var F=FX.fan.map(function(r){return{k:mi(r[0]),m:r[0],p5:r[1],p10:r[2],p25:r[3],p50:r[4],p75:r[5],p90:r[6],p95:r[7]}});
 var kNow=mi(FX.spot_date.slice(0,7));F.unshift({k:kNow,m:FX.spot_date.slice(0,7),p5:FX.spot,p10:FX.spot,p25:FX.spot,p50:FX.spot,p75:FX.spot,p90:FX.spot,p95:FX.spot});
 var H=pts(S.gold,mi('2019-01'));var k0=H[0].k,k1=F[F.length-1].k;var x=function(k){return Lm+(c.W-Lm-R)*(k-k0)/(k1-k0)};var lo=1000,hi=12000;var y=function(v){return T+(c.H-T-B)*(1-(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)))};
 [1000,2000,3000,4000,5000,7000,10000].forEach(function(t){el('line',{x1:Lm,x2:c.W-R,y1:y(t),y2:y(t),class:'gridline'},c.svg);var tx=el('text',{x:Lm-6,y:y(t)+4,'text-anchor':'end',class:'axis'},c.svg);tx.textContent='$'+(t/1000)+'k';});
 for(var yr=2019;yr<=2029;yr++){if(narrow&&yr%2)continue;var t=el('text',{x:x(yr*12),y:c.H-6,'text-anchor':'middle',class:'axis'},c.svg);t.textContent=yr;}
 el('rect',{x:x(kNow),y:T,width:x(k1)-x(kNow),height:c.H-T-B,fill:css('--accent'),opacity:.05},c.svg);
 var tl=el('text',{x:x(kNow)+6,y:T+12,class:'axis','font-weight':700},c.svg);tl.textContent='MODEL PROJECTION';
 function band(a,b,op){var d='';F.forEach(function(f,i){d+=(i?'L':'M')+x(f.k).toFixed(1)+','+y(f[a]).toFixed(1)});for(var i=F.length-1;i>=0;i--)d+='L'+x(F[i].k).toFixed(1)+','+y(F[i][b]).toFixed(1);el('path',{d:d+'Z',fill:GOLD(),opacity:op},c.svg);}
 band('p95','p5',.10);band('p90','p10',.16);band('p75','p25',.30);
 el('line',{x1:Lm,x2:c.W-R,y1:y(5589),y2:y(5589),stroke:css('--bad'),'stroke-dasharray':'5 4','stroke-width':1.3},c.svg);var rt=el('text',{x:Lm+6,y:y(5589)-6,class:'axis',fill:css('--bad')},c.svg);rt.textContent='Record $5,589 (Jan 2026)';
 var d='';H.forEach(function(p,i){d+=(i?'L':'M')+x(p.k).toFixed(1)+','+y(p.v).toFixed(1)});d+='L'+x(kNow).toFixed(1)+','+y(FX.spot).toFixed(1);el('path',{d:d,fill:'none',stroke:css('--ink'),'stroke-width':2},c.svg);
 var md_='';F.forEach(function(f,i){md_+=(i?'L':'M')+x(f.k).toFixed(1)+','+y(f.p50).toFixed(1)});el('path',{d:md_,fill:'none',stroke:GOLD(),'stroke-width':2.6,'stroke-dasharray':'7 5'},c.svg);
 el('circle',{cx:x(kNow),cy:y(FX.spot),r:5,fill:css('--ink'),stroke:css('--surface'),'stroke-width':2},c.svg);
 var last=F[F.length-1],lx=x(k1)+6;[['p95','95th'],['p75','75th'],['p50','Median'],['p25','25th'],['p5','5th']].forEach(function(l){var t=el('text',{x:lx,y:y(last[l[0]])+4,class:'axis','font-weight':l[0]==='p50'?700:400,fill:l[0]==='p50'?GOLD():css('--muted')},c.svg);t.textContent=(narrow?'':l[1]+' ')+'$'+fmtN(last[l[0]]/1000,1)+'k';});
 var hit=el('rect',{x:Lm,y:T,width:c.W-Lm-R,height:c.H-T-B,fill:'transparent'},c.svg);var cross=el('line',{y1:T,y2:c.H-B,stroke:css('--muted'),opacity:0},c.svg);
 function mv(ev){var r=c.svg.getBoundingClientRect(),px=((ev.touches?ev.touches[0].clientX:ev.clientX)-r.left)*c.W/r.width;var k=Math.round(k0+(px-Lm)/(c.W-Lm-R)*(k1-k0));
  if(k<=kNow){var best=H[H.length-1];H.forEach(function(p){if(Math.abs(p.k-k)<Math.abs(best.k-k))best=p});cross.setAttribute('x1',x(best.k));cross.setAttribute('x2',x(best.k));cross.setAttribute('opacity',.5);tipOn(c,x(best.k),y(best.v),'<b>'+md(best.m)+'</b><br>Gold '+usd(best.v)+' (monthly avg)');return;}
  var f=F.filter(function(q){return q.k===k})[0]||last;cross.setAttribute('x1',x(f.k));cross.setAttribute('x2',x(f.k));cross.setAttribute('opacity',.5);
  tipOn(c,x(f.k),y(f.p75),'<b>'+md(f.m)+' projection</b><br>Median '+usd(f.p50)+'<br>50% range '+usd(f.p25)+'–'+usd(f.p75)+'<br>90% range '+usd(f.p5)+'–'+usd(f.p95));}
 hit.addEventListener('mousemove',mv);hit.addEventListener('touchstart',mv,{passive:true});hit.addEventListener('mouseleave',function(){c.tip.classList.remove('on');cross.setAttribute('opacity',0)});}
function heat(p){var a=Math.max(.06,Math.min(.9,p/100));return 'background:color-mix(in srgb,var(--gold) '+Math.round(a*100)+'%,transparent);'+(p>55?'color:#1c1d1f;font-weight:700':'');}
function drawProb(){var tb=document.getElementById('p15prob');if(!tb||!FX)return;var hz=['2027-12','2028-12','2029-12'];
 tb.innerHTML=FX.levels.slice().reverse().map(function(r){var lab=usd(r.level)+(r.level===5589?' <small>record</small>':'');var tch=r.level>FX.spot?r.touch:r.below_touch;
  return '<tr><th scope="row">'+lab+'</th>'+hz.map(function(m){return '<td style="'+heat(r[m])+'">'+fmtN(r[m],r[m]<10?1:0)+'%</td>'}).join('')+'<td class="tch">'+(r.level>FX.spot?'Reach: ':'Fall to: ')+'<b>'+fmtN(tch,0)+'%</b></td></tr>';}).join('');}
var distH='2027-12';
function drawDist(){var host=document.getElementById('p15dist');if(!host||!FX)return;var dd=FX.dist[distH];var c=setup(host,230);var Lm=40,R=10,T=14,B=26;
 var E=dd.edges,P=dd.pct;var mx=Math.max.apply(null,P);var lo=1500,hi=10000;var xs=function(v){return Lm+(c.W-Lm-R)*(v-lo)/(hi-lo)},y=function(v){return T+(c.H-T-B)*(1-v/(mx*1.1))};
 [2000,4000,6000,8000,10000].forEach(function(t){var tx=el('text',{x:xs(t),y:c.H-6,'text-anchor':'middle',class:'axis'},c.svg);tx.textContent='$'+(t/1000)+'k';});
 el('line',{x1:Lm,x2:c.W-R,y1:y(0),y2:y(0),class:'zero'},c.svg);
 for(var i=0;i<P.length;i++){var a=E[i],b=E[i+1];if(b<=lo||a>=hi)continue;var col=a>=FX.spot?GOLD():css('--muted');var r=el('rect',{x:xs(a)+.5,y:y(P[i]),width:Math.max(1,xs(b)-xs(a)-1),height:y(0)-y(P[i]),fill:col,opacity:a>=FX.spot?.9:.45},c.svg);
  (function(a,b,p){r.addEventListener('mousemove',function(){tipOn(c,xs((a+b)/2),y(p),usd(a)+'–'+usd(b)+': '+fmtN(p,1)+'% of paths')});r.addEventListener('mouseleave',function(){c.tip.classList.remove('on')});})(a,b,P[i]);}
 [[FX.spot,'Today $'+fmtN(FX.spot),css('--ink')],[5589,'Record',css('--bad')]].forEach(function(m){el('line',{x1:xs(m[0]),x2:xs(m[0]),y1:T,y2:c.H-B,stroke:m[2],'stroke-dasharray':'4 3','stroke-width':1.4},c.svg);var t=el('text',{x:xs(m[0])+4,y:T+10,class:'axis',fill:m[2]},c.svg);t.textContent=m[1];});}
function drawModelInfo(){if(!FX)return;var b=FX.backtest,ml=FX.ml,iv=FX.intervals;var e=document.getElementById('p15ml');if(!e)return;
 var set=function(id,v){var n=document.getElementById(id);if(n)n.innerHTML=v;};
 set('p15ml',(ml.pred_12m_pct>=0?'+':'')+fmtN(ml.pred_12m_pct,1)+'%');set('p15mlr',(ml.ridge_pct>=0?'+':'')+fmtN(ml.ridge_pct,1)+'%');set('p15mlk',(ml.knn_pct>=0?'+':'')+fmtN(ml.knn_pct,1)+'%');
 set('p15hit',fmtN(b.direction_hit*100,0)+'%');set('p15hitn',fmtN(b.direction_hit_naive*100,0)+'%');set('p15r2',(b.r2_oos>=0?'+':'')+b.r2_oos.toFixed(2));
 set('p15c50',fmtN(iv.cover50*100,0)+'%');set('p15c80',fmtN(iv.cover80*100,0)+'%');set('p15bt',md(b.from)+' – '+md(b.to)+' ('+b.months+' monthly forecasts)');
 set('p15vol',fmtN(FX.vol.sd_used*Math.sqrt(12)*100,0)+'%');set('p15paths',fmtN(FX.paths));}

/* ---------- controls ---------- */
function wire(id,cb){var g=document.getElementById(id);if(!g)return;g.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;g.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-selected',x===b)});cb(b.getAttribute('data-v'));});}
wire('p15goldr',function(v){goldRange=v;drawGold();});
wire('p15ftabs',function(v){curF=v;drawFactor();});
wire('p15fr',function(v){facRange=v;drawFactor();});
wire('p15dh',function(v){distH=v;drawDist();});
var up=document.getElementById('p15upd');if(up)up.textContent=D.updated;
function all(){drawTiles();drawGold();drawFactor();drawCB();drawCrashes();drawFan();drawProb();drawDist();drawModelInfo();}
all();var tm;window.addEventListener('resize',function(){clearTimeout(tm);tm=setTimeout(all,150)});
})();
