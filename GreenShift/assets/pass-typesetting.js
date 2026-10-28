/* Deterministic word/grapheme wrapping shared by the A4 Pass and its checks. */
(() => {
'use strict';
function lines(text,width,measure){
 const out=[];for(const paragraph of String(text||'—').replace(/\r/g,'').split('\n')){let line='';for(const token of paragraph.match(/\S+\s*/gu)||['']){
  if(measure(line+token.trimEnd())<=width){line+=token;continue;}
  if(line.trim()){out.push(line.trimEnd());line='';}
  if(measure(token.trimEnd())<=width){line=token;continue;}
  for(const char of Array.from(token)){if(line&&measure(line+char)>width){out.push(line.trimEnd());line='';}line+=char;}
 }out.push(line.trimEnd());}return out;
}
function fit(text,{width,height,fontSize,lineHeight,maxLines=Infinity},measure){
 const all=lines(text,width,measure),limit=Math.max(1,Math.min(maxLines,Math.floor(height/lineHeight))),visible=all.slice(0,limit),truncated=all.length>limit;
 if(truncated){let tail=visible.at(-1)||'';while(tail&&measure(tail+'…')>width)tail=Array.from(tail).slice(0,-1).join('');visible[visible.length-1]=tail.trimEnd()+'…';}
 return {lines:visible,truncated,fontSize,lineHeight,width,height};
}
globalThis.GreenShiftPassType=Object.freeze({lines,fit});
})();
