/* SARAL demo data engine — generates sample data and answers the pages' /api/... calls
   entirely in the browser (no server). All figures are fabricated. */
(function(){
  "use strict";

  var TODAY=new Date(); TODAY.setHours(0,0,0,0);
  function ymd(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  function dmy(d){ var M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return d.getDate()+" "+M[d.getMonth()]+" "+d.getFullYear(); }
  function rng(seed){ return function(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }; }
  var rand=rng(20261028);
  function pick(a){ return a[Math.floor(rand()*a.length)]; }
  function between(lo,hi){ return lo+Math.floor(rand()*(hi-lo+1)); }
  function weekStart(d){ var x=new Date(d); x.setDate(x.getDate()-((x.getDay()+6)%7)); x.setHours(0,0,0,0); return x; }
  function daysBetween(a,b){ return Math.round((a-b)/864e5); }

  // ---- parties ----
  var MANUF=[
    {code:"M1",name:"Jaya Creation (J 4 U)",city:"Ahmedabad",state:"Gujarat",gstin:"24ADGPC2290M1ZM",mobile:"9558188990",rate:3},
    {code:"M2",name:"K. Puneet Textile",city:"Ahmedabad",state:"Gujarat",gstin:"24AAKPT5521J1Z8",mobile:"9712345601",rate:2},
    {code:"M3",name:"S.Dilipkumar (Shree)",city:"Ahmedabad",state:"Gujarat",gstin:"24AABPW7728G1ZH",mobile:"9825012345",rate:2},
    {code:"M4",name:"Pawanputra Textile",city:"Ahmedabad",state:"Gujarat",gstin:"24AAFPP1102K1Z3",mobile:"9909011223",rate:3},
    {code:"M5",name:"Mahi Fashion",city:"Ahmedabad",state:"Gujarat",gstin:"24AAHFM3390L1Z9",mobile:"9879098790",rate:2}
  ];
  var CUST=[
    {code:"C1",name:"Sri Vaishnavi Retail (India) LLP",city:"Hyderabad",state:"T.S",pin:"501401",gstin:"36ADOFS9410R1Z4",pan:"ADOFS9410R",mobile:"9848708983",add1:"Survey No-3 & 6",add2:"Beside Zila Parishad High School",add3:"Muneerabad, Medchal"},
    {code:"C2",name:"Excellent",city:"Hyderabad",state:"T.S",pin:"500012",gstin:"36AAECE1234F1Z1",pan:"AAECE1234F",mobile:"9502610525",add1:"Shop 14, General Bazaar",add2:"Secunderabad Road",add3:""},
    {code:"C3",name:"Arbaz Textiles Pvt Ltd",city:"Secunderabad",state:"T.S",pin:"500003",gstin:"36ABAPR4768D1ZK",pan:"ABAPR4768D",mobile:"8686317373",add1:"12-2-417, Mehdipatnam",add2:"",add3:""},
    {code:"C4",name:"K.P. Creation",city:"Secunderabad",state:"T.S",pin:"500025",gstin:"36AAKPK9087H1ZP",pan:"AAKPK9087H",mobile:"9989248848",add1:"Shop 6, Cloth Market",add2:"",add3:""},
    {code:"C5",name:"Sri Laxmi Fashion",city:"Hyderabad",state:"T.S",pin:"500048",gstin:"36AALFS2231M1ZQ",pan:"AALFS2231M",mobile:"8977716821",add1:"22-8, Charminar Road",add2:"",add3:""}
  ];
  var SMEN=[{code:"S1",name:"Mahesh",owner:true},{code:"S2",name:"Naresh – Amravati",owner:false},{code:"S3",name:"Usha Agency",owner:false}];
  var MAP={}; MANUF.concat(CUST).forEach(function(p){MAP[p.code]=p;});
  var MANNAME={}; MANUF.forEach(function(m){MANNAME[m.code]=m.name;});
  var CUSTNAME={}; CUST.forEach(function(c){CUSTNAME[c.code]=c.name;});

  var COMPANY={name:"Ronak Agency",addr:"D-285, 3rd Floor, Sumel Business Park-2, B/h. Vanijya Bhavan, Raipur, Ahmedabad-380022",ph1:"9376111333",ph2:"6359111333"};
  var MODES=["NEFT","RTGS","CASH","G.PAY","HDFC","SBI","UBI"];

  // ---- bills ----
  var BILLS=[], vno=5000, refn=9000;
  function makeBill(daysAgo){
    var cust=pick(CUST), man=pick(MANUF);
    // owner (Mahesh) handles most volume
    var sm = rand()<0.78 ? SMEN[0] : (rand()<0.6?SMEN[1]:SMEN[2]);
    var d=new Date(TODAY); d.setDate(d.getDate()-daysAgo);
    var itm=between(28,165)*1000;
    var gst=Math.round(itm*0.05);
    var amount=itm+gst;
    var rate=man.rate, commission=Math.round(amount*rate/100);
    // older bills more likely paid
    var paidProb = daysAgo>90 ? 0.82 : daysAgo>45 ? 0.6 : 0.4;
    var paid=rand()<paidProb;
    return {
      vno:++vno, ref:String(++refn), date:ymd(d), dObj:d,
      man:man.code, cust:cust.code, sm:sm.code, smName:sm.name,
      itm:itm, gstPerc:5, gst:gst, amount:amount, rate:rate, commission:commission,
      mode:pick(MODES),
      paid:paid, paidAmt:paid?amount:0, pending:paid?0:amount,
      lrNo:String(between(4000000,4999999)), transporter:pick(["Batco Roadlines","V.R.L. Logistics","Gati","Shree Maruti Courier"])
    };
  }
  var i;
  for(i=0;i<60;i++){ BILLS.push(makeBill(between(6,300))); }
  for(i=0;i<3;i++){ BILLS.push(makeBill(between(0,(TODAY.getDay()+6)%7))); } // current week activity
  BILLS.sort(function(a,b){ return a.date<b.date?1:a.date>b.date?-1:b.amount-a.amount; });
  var BYVNO={}; BILLS.forEach(function(b){BYVNO[b.vno]=b;});

  // ---- helpers ----
  function sum(a,f){ var t=0; a.forEach(function(x){t+=f(x);}); return t; }
  function statusOf(b){ return b.pending<=1?"paid":(b.paidAmt<=1?"unpaid":"partial"); }
  var ASOF=ymd(TODAY);

  // ===================== API shapes =====================
  var API={};

  API["data"]=function(){
    var goodsBilled=sum(BILLS,function(b){return b.amount;});
    var commission=sum(BILLS,function(b){return b.commission;});
    var gst=sum(BILLS,function(b){return b.gst;});
    var pending=sum(BILLS,function(b){return b.pending;});
    var paid=sum(BILLS,function(b){return b.paidAmt;});
    var commPaid=sum(BILLS.filter(function(b){return b.paid;}),function(b){return b.commission;});

    // calendar week windows
    var cw=weekStart(TODAY), nw=new Date(cw.getTime()+7*864e5), lw=new Date(cw); lw.setDate(lw.getDate()-7);
    function inR(b,a,z){ return b.dObj>=a && b.dObj<z; }
    var tW=BILLS.filter(function(b){return inR(b,cw,nw);}), lW=BILLS.filter(function(b){return inR(b,lw,cw);});

    // ageing + worklist from open bills
    var buckets={"0-30":0,"31-60":0,"61-90":0,"91-180":0,"180+":0};
    var owe={}, oldest={};
    BILLS.forEach(function(b){
      if(b.pending<=1) return;
      var days=daysBetween(TODAY,b.dObj);
      if(days<=30)buckets["0-30"]+=b.pending; else if(days<=60)buckets["31-60"]+=b.pending; else if(days<=90)buckets["61-90"]+=b.pending; else if(days<=180)buckets["91-180"]+=b.pending; else buckets["180+"]+=b.pending;
      owe[b.cust]=(owe[b.cust]||0)+b.pending;
      if(!oldest[b.cust]||b.dObj<oldest[b.cust]) oldest[b.cust]=b.dObj;
    });
    var ageArr=["0-30","31-60","61-90","91-180","180+"].map(function(k){return [k,Math.round(buckets[k])];});
    var over90=Math.round(buckets["91-180"]+buckets["180+"]);

    // crossed thresholds in last 7 days
    var cross90=0,cross90n=0,cross180=0,cross180n=0,crossList=[];
    BILLS.forEach(function(b){ if(b.pending<=1)return; var days=daysBetween(TODAY,b.dObj);
      if(days>90&&days<=97){cross90+=b.pending;cross90n++;crossList.push([CUSTNAME[b.cust],Math.round(b.pending),days,90]);}
      if(days>180&&days<=187){cross180+=b.pending;cross180n++;crossList.push([CUSTNAME[b.cust],Math.round(b.pending),days,180]);}
    });
    crossList.sort(function(a,b){return b[1]-a[1];});

    var worklist=Object.keys(owe).sort(function(a,b){return owe[b]-owe[a];}).slice(0,15).map(function(cd){
      var p=MAP[cd];
      // attribute a salesman = the one on this customer's most recent bill
      var last=null,sm="";
      BILLS.forEach(function(b){ if(b.cust===cd&&(!last||b.dObj>last)){last=b.dObj;sm=b.smName;} });
      return [p.name,p.city,Math.round(owe[cd]),daysBetween(TODAY,oldest[cd]),p.mobile,sm,cd];
    });
    var debtors=Object.keys(owe).sort(function(a,b){return owe[b]-owe[a];}).slice(0,12).map(function(cd){ var p=MAP[cd]; return [p.name,p.city,Math.round(owe[cd]),cd]; });

    // salesman concentration
    var sm={}; BILLS.forEach(function(b){ sm[b.sm]=(sm[b.sm]||0)+b.amount; });
    var smanArr=Object.keys(sm).sort(function(a,b){return sm[b]-sm[a];}).map(function(c){ var s=SMEN.filter(function(x){return x.code===c;})[0]||{name:c,owner:false}; return [c,s.name,Math.round(sm[c]),!!s.owner]; });

    // top manufacturers
    var mm={}; BILLS.forEach(function(b){ if(!mm[b.man])mm[b.man]={s:0,n:0}; mm[b.man].s+=b.amount; mm[b.man].n++; });
    var suppArr=Object.keys(mm).sort(function(a,b){return mm[b].s-mm[a].s;}).map(function(c){ return [MANNAME[c],Math.round(mm[c].s),mm[c].n]; });

    // monthly
    var mo={}; BILLS.forEach(function(b){ var k=b.date.slice(0,7); if(!mo[k])mo[k]={s:0,n:0,c:0}; mo[k].s+=b.amount; mo[k].n++; mo[k].c+=b.commission; });
    var MON=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var monthly=Object.keys(mo).sort().map(function(k){ var p=k.split("-"); return [k,Math.round(mo[k].s),mo[k].n,Math.round(mo[k].c),MON[+p[1]]+" "+p[0].slice(2)]; });

    function wsum(a,f){return Math.round(sum(a,f));}
    return {
      ok:true,
      generatedAt:ASOF,
      kpis:{goodsBilled:Math.round(goodsBilled),bills:BILLS.length,commission:Math.round(commission),gst:Math.round(gst),returns:0,customers:CUST.length,suppliers:MANUF.length},
      monthly:monthly, sman:smanArr, supp:suppArr,
      outstanding:{total:Math.round(pending),bills:BILLS.filter(function(b){return b.pending>1;}).length,billed:Math.round(goodsBilled),settled:Math.round(paid),returns:0},
      ageing:ageArr, debtors:debtors,
      week:{
        asof:ASOF, thisStart:ymd(cw), thisEnd:ASOF, lastStart:ymd(lw), lastEnd:ymd(new Date(cw.getTime()-864e5)),
        billedThis:wsum(tW,function(b){return b.amount;}), billedLast:wsum(lW,function(b){return b.amount;}), billsThis:tW.length,
        commThis:wsum(tW,function(b){return b.commission;}), commLast:wsum(lW,function(b){return b.commission;}),
        commTotal:Math.round(commission), commCollected:Math.round(commPaid), commPending:Math.round(commission-commPaid),
        over90Now:over90, cross90:Math.round(cross90), cross90n:cross90n, cross180:Math.round(cross180), cross180n:cross180n,
        commRecvThis:wsum(tW.filter(function(b){return b.paid;}),function(b){return b.commission;}), commRecvLast:wsum(lW.filter(function(b){return b.paid;}),function(b){return b.commission;}),
        salesRecvThis:wsum(tW.filter(function(b){return b.paid;}),function(b){return b.paidAmt;}), salesRecvLast:wsum(lW.filter(function(b){return b.paid;}),function(b){return b.paidAmt;}),
        worklist:worklist, newlyAged:crossList.slice(0,10)
      },
      marker:{lastEntry:ASOF+" 00:00",latestBill:BILLS[0]?BILLS[0].date:ASOF,salesRows:BILLS.length,ledgerRows:BILLS.length*2,billwiseRows:BILLS.filter(function(b){return b.paid;}).length}
    };
  };

  API["buyers"]=function(){
    var list=CUST.map(function(p){return [p.code,p.name,p.city,"buyer"];}).concat(MANUF.map(function(p){return [p.code,p.name,p.city,"mill"];}));
    return {ok:true,count:list.length,buyers:list};
  };

  API["buyer"]=function(q){
    var p=MAP[q.cd]; if(!p||q.cd.charAt(0)!=="C") return {ok:false,error:"Buyer not found"};
    var rows=BILLS.filter(function(b){return b.cust===q.cd;}).map(function(b){
      return {vno:b.vno,ref:b.ref,date:b.date,mill:MANNAME[b.man],amount:b.amount,paid:b.paidAmt,pending:b.pending,status:statusOf(b)};
    });
    return {ok:true,asof:ASOF,buyer:{code:p.code,name:p.name,addr:[p.add1,p.add2,p.add3].filter(Boolean).join(", "),city:p.city,state:p.state,pin:p.pin,gstin:p.gstin,mobile:p.mobile,phone:""},
      summary:{bills:rows.length,total:sum(rows,function(b){return b.amount;}),paid:sum(rows,function(b){return b.paid;}),pending:sum(rows,function(b){return b.pending;})},
      bills:rows};
  };

  API["mill"]=function(q){
    var p=MAP[q.cd]; if(!p||q.cd.charAt(0)!=="M") return {ok:false,error:"Manufacturer not found"};
    var rows=BILLS.filter(function(b){return b.man===q.cd;}).map(function(b){
      return {vno:b.vno,date:b.date,buyer:CUSTNAME[b.cust],nbills:1,mode:b.mode,amount:b.commission,paid:b.paid?b.commission:0,pending:b.paid?0:b.commission,status:b.paid?"paid":"unpaid"};
    });
    return {ok:true,asof:ASOF,mill:{code:p.code,name:p.name,city:p.city,state:p.state,gstin:p.gstin,mobile:p.mobile,phone:""},
      summary:{bills:rows.length,total:sum(rows,function(b){return b.amount;}),paid:sum(rows,function(b){return b.paid;}),pending:sum(rows,function(b){return b.pending;})},
      bills:rows};
  };

  function weekLabel(s,e){ var M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return s.getDate()+" "+M[s.getMonth()]+" – "+e.getDate()+" "+M[e.getMonth()]+" "+e.getFullYear(); }
  function weeksOf(valueFn){
    var wk={}; BILLS.forEach(function(b){ var ws=ymd(weekStart(b.dObj)); (wk[ws]=wk[ws]||[]).push(b); });
    var curKey=ymd(weekStart(TODAY)); if(!wk[curKey]) wk[curKey]=[];
    return Object.keys(wk).sort().reverse().map(function(k){
      var s=new Date(k+"T00:00:00"), isCur=(k===curKey), e=isCur?TODAY:new Date(s.getTime()+6*864e5);
      return {key:k,s:s,e:e,isCur:isCur,bills:wk[k]};
    });
  }

  API["sales-weeks"]=function(){
    var arr=weeksOf().map(function(w){
      var custs={}; w.bills.forEach(function(b){custs[b.cust]=1;});
      return {start:w.key,end:ymd(w.e),label:weekLabel(w.s,w.e),current:w.isCur,
        total:Math.round(sum(w.bills,function(b){return b.amount;})),bills:w.bills.length,buyers:Object.keys(custs).length,
        exp:Math.round(sum(w.bills,function(b){return b.commission;}))};
    });
    return {ok:true,weekCount:arr.length,weeks:arr};
  };
  API["sales-week"]=function(q){
    var s=new Date(q.start+"T00:00:00"), e=new Date(s.getTime()+7*864e5);
    var rows=BILLS.filter(function(b){return b.dObj>=s&&b.dObj<e;});
    var by={}; rows.forEach(function(b){ if(!by[b.cust])by[b.cust]={total:0,exp:0,items:[]}; by[b.cust].total+=b.amount; by[b.cust].exp+=b.commission;
      by[b.cust].items.push({vno:b.vno,date:b.date,ref:b.ref,sup:b.man,supName:MANNAME[b.man],amount:b.amount,rate:b.rate,exp:b.commission}); });
    var buyers=Object.keys(by).sort(function(a,b){return by[b].total-by[a].total;}).map(function(cd){ var p=MAP[cd];
      return {code:cd,name:p.name,city:p.city,total:Math.round(by[cd].total),exp:Math.round(by[cd].exp),bills:by[cd].items.length,items:by[cd].items}; });
    return {ok:true,start:q.start,end:ymd(new Date(s.getTime()+6*864e5)),label:weekLabel(s,new Date(s.getTime()+6*864e5)),total:Math.round(sum(rows,function(b){return b.amount;})),buyerCount:buyers.length,buyers:buyers};
  };

  API["comm-weeks"]=function(){
    var arr=weeksOf().map(function(w){
      var mans={}; w.bills.forEach(function(b){mans[b.man]=1;});
      return {start:w.key,end:ymd(w.e),label:weekLabel(w.s,w.e),total:Math.round(sum(w.bills,function(b){return b.commission;})),bills:w.bills.length,mills:Object.keys(mans).length};
    });
    return {ok:true,weekCount:arr.length,weeks:arr};
  };
  API["comm-week"]=function(q){
    var s=new Date(q.start+"T00:00:00"), e=new Date(s.getTime()+7*864e5);
    var rows=BILLS.filter(function(b){return b.dObj>=s&&b.dObj<e;});
    var by={}; rows.forEach(function(b){ if(!by[b.man])by[b.man]={total:0,items:[]}; by[b.man].total+=b.commission;
      by[b.man].items.push({vno:b.vno,date:b.date,buyer:CUSTNAME[b.cust],mode:b.mode,amount:b.commission,nbills:1}); });
    var mills=Object.keys(by).sort(function(a,b){return by[b].total-by[a].total;}).map(function(cd){ var p=MAP[cd];
      return {code:cd,name:p.name,city:p.city,total:Math.round(by[cd].total),bills:by[cd].items.length,items:by[cd].items}; });
    return {ok:true,start:q.start,end:ymd(new Date(s.getTime()+6*864e5)),label:weekLabel(s,new Date(s.getTime()+6*864e5)),total:Math.round(sum(rows,function(b){return b.commission;})),millCount:mills.length,mills:mills};
  };

  API["bill"]=function(q){
    var b=BYVNO[q.vno]; if(!b) return {ok:false,error:"Bill not found"};
    var m=MAP[b.man], c=MAP[b.cust], d=new Date(b.date+"T00:00:00");
    return {ok:true,company:COMPANY,
      bill:{vno:b.vno,no:b.ref,date:dmy(d),lrNo:b.lrNo,lrDate:dmy(d),transporter:b.transporter,remarks:"MATERIAL",salesman:b.smName,entType:"SALE",crDays:0},
      mill:{name:m.name,city:m.city,state:m.state,gstin:m.gstin},
      buyer:{name:c.name,add1:c.add1,add2:c.add2,add3:c.add3,city:c.city,state:c.state,pin:c.pin,gstin:c.gstin,pan:c.pan,mobile:c.mobile,phone:""},
      amounts:{goods:b.itm,disc1:0,disc2:0,charges:0,gstPerc:b.gstPerc,gst:b.gst,tcs:0,total:b.amount},
      commission:{rate:b.rate,expected:b.commission}};
  };

  API["commbill"]=function(q){
    var b=BYVNO[q.vno]; if(!b) return {ok:false,error:"Commission bill not found"};
    var m=MAP[b.man], c=MAP[b.cust], d=new Date(b.date+"T00:00:00");
    return {ok:true,company:COMPANY,vno:b.vno,date:dmy(d),mode:b.mode,cheque:b.mode,
      mill:{name:m.name,city:m.city,state:m.state,gstin:m.gstin},
      buyer:{name:c.name,city:c.city,state:c.state,gstin:c.gstin},
      base:b.amount,rate:b.rate,commission:b.commission,billCount:1,
      items:[{ref:b.ref,date:dmy(d),amount:b.amount}]};
  };

  // ===================== fetch shim =====================
  function parse(url){
    var u=url.replace(/^.*\/api\//,""), path=u.split("?")[0], q={};
    var qs=u.split("?")[1]; if(qs){ qs.split("&").forEach(function(kv){ var p=kv.split("="); q[p[0]]=decodeURIComponent(p[1]||""); }); }
    return {path:path,q:q};
  }
  var origFetch=window.fetch;
  window.fetch=function(url,opts){
    if(typeof url==="string" && url.indexOf("/api/")>=0){
      var p=parse(url), fn=API[p.path];
      var body = fn ? fn(p.q) : {ok:false,error:"unknown endpoint"};
      return Promise.resolve({ ok:true, json:function(){ return Promise.resolve(body); }, text:function(){ return Promise.resolve(JSON.stringify(body)); } });
    }
    return origFetch.apply(window,arguments);
  };
})();
