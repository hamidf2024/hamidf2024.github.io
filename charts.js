/* Small dependency-free SVG charts with hover tooltips. 2026-10-28 */
(function(){
var NS='http://www.w3.org/2000/svg';
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}
function nice(min,max,n){var span=max-min||1,step=Math.pow(10,Math.floor(Math.log10(span/n))),err=span/n/step;step*=err>=7.5?10:err>=3.5?5:err>=1.5?2:1;var lo=Math.floor(min/step)*step,hi=Math.ceil(max/step)*step,t=[];for(var v=lo;v<=hi+step/2;v+=step)t.push(+v.toFixed(10));return t;}
function setup(host,h){host.innerHTML='';host.classList.add('chart');var W=host.clientWidth||600,H=h||240;var svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img'},host);var tip=document.createElement('div');tip.className='tip';host.appendChild(tip);return{W:W,H:H,svg:svg,tip:tip};}
function show(c,x,y,html){c.tip.innerHTML=html;c.tip.style.left=x+'px';c.tip.style.top=y+'px';c.tip.classList.add('on');}
function hide(c){c.tip.classList.remove('on');}
function yAxis(c,ticks,y,L,R,fmt){ticks.forEach(function(t){el('line',{x1:L,x2:c.W-R,y1:y(t),y2:y(t),class:t===0?'zero':'gridline'},c.svg);var tx=el('text',{x:L-6,y:y(t)+4,'text-anchor':'end',class:'axis'},c.svg);tx.textContent=fmt(t);});}
/* line: data=[{label,value,tip}] */
window.lineChart=function(host,data,o){o=o||{};var c=setup(host,o.height),L=46,R=12,T=10,B=26;var vals=data.map(function(d){return d.value}).concat(o.includeZero===false?[]:[0]);var ticks=nice(Math.min.apply(null,vals),Math.max.apply(null,vals),4);var lo=ticks[0],hi=ticks[ticks.length-1];
var x=function(i){return L+(c.W-L-R)*(data.length<2?0.5:i/(data.length-1))},y=function(v){return T+(c.H-T-B)*(1-(v-lo)/(hi-lo||1))};var fmt=o.fmt||function(v){return v};yAxis(c,ticks,y,L,R,fmt);
var col=o.color||css('--gain');if(o.area){var a='M'+x(0)+','+y(Math.max(lo,0));data.forEach(function(d,i){a+=' L'+x(i)+','+y(d.value)});a+=' L'+x(data.length-1)+','+y(Math.max(lo,0))+'Z';el('path',{d:a,fill:col,opacity:.12},c.svg);}
var p='';data.forEach(function(d,i){p+=(i?' L':'M')+x(i)+','+y(d.value)});el('path',{d:p,fill:'none',stroke:col,'stroke-width':2,'stroke-linejoin':'round'},c.svg);
(o.xLabels||[]).forEach(function(xl){var t=el('text',{x:x(xl.i),y:c.H-6,'text-anchor':'middle',class:'axis'},c.svg);t.textContent=xl.text;});
(o.markers||[]).forEach(function(m){el('line',{x1:L,x2:c.W-R,y1:y(m.value),y2:y(m.value),stroke:m.color||css('--muted'),'stroke-dasharray':'4 4','stroke-width':1.5},c.svg);var t=el('text',{x:L+8,y:y(m.value)-6,'text-anchor':'start',class:'axis'},c.svg);t.textContent=m.text;});
var cross=el('line',{y1:T,y2:c.H-B,stroke:css('--muted'),'stroke-width':1,opacity:0},c.svg),dot=el('circle',{r:4.5,fill:col,stroke:css('--surface'),'stroke-width':2,opacity:0},c.svg);
var hit=el('rect',{x:L,y:0,width:c.W-L-R,height:c.H,fill:'transparent'},c.svg);
function mv(ev){var r=c.svg.getBoundingClientRect(),px=(ev.touches?ev.touches[0].clientX:ev.clientX)-r.left,sx=px*c.W/r.width;var i=Math.round((sx-L)/(c.W-L-R)*(data.length-1));i=Math.max(0,Math.min(data.length-1,i));var cx=x(i),cy=y(data[i].value);cross.setAttribute('x1',cx);cross.setAttribute('x2',cx);cross.setAttribute('opacity',.5);dot.setAttribute('cx',cx);dot.setAttribute('cy',cy);dot.setAttribute('opacity',1);show(c,cx*r.width/c.W,cy*r.height/c.H,data[i].tip||fmt(data[i].value));}
hit.addEventListener('mousemove',mv);hit.addEventListener('touchstart',mv,{passive:true});hit.addEventListener('mouseleave',function(){hide(c);cross.setAttribute('opacity',0);dot.setAttribute('opacity',0)});};
/* bars: data=[{label,value,tip}] diverging around 0 */
window.barChart=function(host,data,o){o=o||{};var c=setup(host,o.height),L=46,R=8,T=10,B=o.rotate?44:26;var vals=data.map(function(d){return d.value}).concat([0]);var ticks=nice(Math.min.apply(null,vals),Math.max.apply(null,vals),4),lo=ticks[0],hi=ticks[ticks.length-1];var fmt=o.fmt||function(v){return v};var y=function(v){return T+(c.H-T-B)*(1-(v-lo)/(hi-lo||1))};yAxis(c,ticks,y,L,R,fmt);
var bw=(c.W-L-R)/data.length,gap=Math.max(2,Math.min(10,bw*.25));data.forEach(function(d,i){var x0=L+i*bw+gap/2,w=bw-gap,y0=y(Math.max(0,d.value)),h=Math.max(1,Math.abs(y(d.value)-y(0)));var col=d.value>=0?css('--gain'):css('--loss');var rr=Math.min(4,w/2,h/2);
var path=d.value>=0?'M'+x0+','+(y0+h)+' V'+(y0+rr)+' Q'+x0+','+y0+' '+(x0+rr)+','+y0+' H'+(x0+w-rr)+' Q'+(x0+w)+','+y0+' '+(x0+w)+','+(y0+rr)+' V'+(y0+h)+'Z':'M'+x0+','+y0+' V'+(y0+h-rr)+' Q'+x0+','+(y0+h)+' '+(x0+rr)+','+(y0+h)+' H'+(x0+w-rr)+' Q'+(x0+w)+','+(y0+h)+' '+(x0+w)+','+(y0+h-rr)+' V'+y0+'Z';
var b=el('path',{d:path,fill:col},c.svg);var hit=el('rect',{x:L+i*bw,y:T,width:bw,height:c.H-T-B,fill:'transparent'},c.svg);
hit.addEventListener('mousemove',function(){var r=c.svg.getBoundingClientRect();b.setAttribute('opacity',.8);show(c,(x0+w/2)*r.width/c.W,Math.min(y0,y(0))*r.height/c.H,d.tip||(d.label+': '+fmt(d.value)));});hit.addEventListener('mouseleave',function(){b.setAttribute('opacity',1);hide(c)});
if(o.showLabels!==false&&(o.labelEvery?i%o.labelEvery===0:true)){var t=el('text',{x:x0+w/2,y:c.H-(o.rotate?30:6),'text-anchor':o.rotate?'end':'middle',class:'axis',transform:o.rotate?'rotate(-35 '+(x0+w/2)+' '+(c.H-30)+')':''},c.svg);t.textContent=d.label;}});};
})();
