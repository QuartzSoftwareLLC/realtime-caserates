(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{8105:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n(9999)}])},9999:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return k}});var a=n(141),r=n(878),i=n(7936),s=n(4673),l=n(6363),c=n.n(l),d=n(6258),o=n.n(d),u=n(6053),h=n.n(u);function p(e,t){return t||(t=e.slice(0)),Object.freeze(Object.defineProperties(e,{raw:{value:Object.freeze(t)}}))}function f(){let e=p(["\n  width: 100%;\n  height: 100%;\n  display: flex;\n  justify-content: center;\n"]);return f=function(){return e},e}function x(){let e=p(["\n  border-collapse: collapse;\n  td,\n  th {\n    border: 1px solid black;\n    padding: 0.5rem;\n  }\n"]);return x=function(){return e},e}let j=r.ZP.div(f()),m=o()(Promise.all([n.e(131),n.e(553)]).then(n.bind(n,6553)),{loadableGenerated:{webpack:()=>[6553]},ssr:!1}),w=()=>{let e;let t=_("trend-hospitalizations");return t&&(e=h()(...t).reduce((e,t)=>({...e,[t[0]]:t.slice(2)}),{})),t?(0,a.jsx)(j,{children:(0,a.jsx)(m,{data:[{x:e.week_ending_date,y:e.rate,type:"scatter",mode:"lines+markers",marker:{color:"black"}}],layout:{width:"100%",height:"100%",title:"Hospitalization Trends",xaxis:{title:"Week"},yaxis:{title:"Hospitalization Rate"}}})}):(0,a.jsx)("p",{children:"Loading..."})},b=r.ZP.table(x()),_=e=>{let[t,n]=s.useState("");return s.useEffect(()=>{i.Z.get("http:"===window.location.protocol?"http://quartzdata.s3.amazonaws.com/datasets/".concat(e,".csv"):"https://quartzdata.s3.amazonaws.com/datasets/".concat(e,".csv")).then(e=>n(c().parse(e.data.trim(),{delimiter:","}).data))},[]),t};function k(){let e=_("avg-final");return(0,a.jsxs)("div",{children:[(0,a.jsx)("h1",{children:"COVID 19 Realtime Data"}),e&&(0,a.jsxs)(b,{children:[(0,a.jsx)("thead",{children:(0,a.jsx)("tr",{children:e[0].map(e=>(0,a.jsx)("th",{children:e},e))})}),(0,a.jsx)("tbody",{children:e.slice(1,e.length).map(e=>(0,a.jsx)("tr",{children:e.map(e=>{let t=parseFloat(e);return"NaN"==t.toString()?(0,a.jsx)("td",{children:e}):(0,a.jsx)("td",{children:t.toLocaleString("en-US")})})}))})]}),(0,a.jsx)(w,{})]})}}},function(e){e.O(0,[774,986,888,179],function(){return e(e.s=8105)}),_N_E=e.O()}]);