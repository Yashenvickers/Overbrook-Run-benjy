(function(){
"use strict";
function byId(id){return document.getElementById(id);}
function each(selector,fn){Array.prototype.forEach.call(document.querySelectorAll(selector),fn);}
function setPressed(selector,active){
  each(selector,function(el){
    var on=el===active;
    el.classList.toggle("isActive",on);
    if(el.hasAttribute("aria-pressed")){el.setAttribute("aria-pressed",on?"true":"false");}
  });
}
function safeScroll(el,block){
  if(!el){return;}
  try{el.scrollIntoView({behavior:"smooth",block:block||"nearest"});}catch(e){try{el.scrollIntoView();}catch(ignore){}}
}
var toastTimer=null;
function toast(message){
  var el=byId("toast");
  if(!el){return;}
  el.textContent=message;
  el.classList.add("isOpen");
  if(toastTimer){window.clearTimeout(toastTimer);}
  toastTimer=window.setTimeout(function(){el.classList.remove("isOpen");},2400);
}

var roleData={
  home:{k:"Continuity at home",h:"A field nurse who understands the whole system.",t:"Erica combines earlier pediatric and adult in-home nursing with current operational leadership — care planning, family communication, escalation, wound care, documentation, infection prevention, and transitions of care.",p:["Adult + pediatric home-care background","Wound, catheter & respiratory support","Care coordination + documentation discipline"],l:"Home-care advantage",b:"Both",s:"Hands-on field credibility + nursing-operations leadership in one LPN profile."},
  private:{k:"One patient. Full attention.",h:"Private-duty skill with leadership-level situational awareness.",t:"Her earlier home-care work involved medically fragile pediatric and adult clients, medication administration, airway support, feeding assistance, wound and catheter care, vital-sign surveillance, family teaching, and emergency-response guidance.",p:["Medically fragile care","Airway + feeding support","Family teaching + escalation"],l:"Private-duty signal",b:"1:1+",s:"The focus of private duty, reinforced by years of higher-level clinical coordination."},
  leadership:{k:"Field quality + clinical operations",h:"An LPN who can strengthen the nurse and the system around the nurse.",t:"Erica has served as LPN Unit Manager, Assistant Director of Nursing, Wound Care Nurse, Building Educator, and QAPI team member — bringing staff coaching, audits, quality improvement, infection prevention, documentation discipline, and survey readiness.",p:["Unit management + ADON","Staff education + competencies","QAPI, audits + corrective action"],l:"Leadership range",b:"4×",s:"ADON, wound care, education, and QAPI responsibilities held concurrently."}
};
var skillData={
  wound:{title:"Wound care + skin integrity",intro:"Formal wound-care leadership plus direct adult home-care wound experience.",items:["Led wound assessments and individualized care planning.","Reviewed healing progression and skin-integrity risk.","Coordinated findings with interdisciplinary teams and specialist rounds.","Delivered in-home wound and catheter care."]},
  airway:{title:"Airway + respiratory support",intro:"Experience includes tracheostomy care, respiratory treatments, and pediatric home-care airway support.",items:["Provided airway support for medically fragile pediatric clients.","Maintained hands-on tracheostomy-care capability.","Delivered respiratory treatments and monitoring.","Escalated changes in condition and reinforced emergency response."]},
  meds:{title:"Medication + IV therapy",intro:"Medication safety and IV capability across direct care, education, and leadership.",items:["Medication administration with MAR/TAR documentation discipline.","IV initiation, monitoring, compatibility checks, and line maintenance.","Clinical education on order transcription, vital signs, parameters, and titration.","Monitoring and escalation around high-acuity needs."]},
  family:{title:"Family + caregiver support",intro:"Home care succeeds when the clinical plan works for the people living with it every day.",items:["Provided family teaching in pediatric and adult home care.","Supported family conferences and care-plan meetings.","Reinforced chronic-condition management and safety practices.","Coordinated transition-of-care communication and follow-up."]},
  quality:{title:"Quality + compliance",intro:"A facility-level quality lens that can translate into safer, more consistent field care.",items:["Supported QAPI and root-cause analysis.","Performed audit rounds across 6+ risk and compliance domains.","Worked on survey readiness, corrective action, and policy compliance.","Supported infection prevention, isolation precautions, and outbreak preparedness."]},
  ops:{title:"Clinical operations + leadership",intro:"Leadership experience connects staffing, documentation, competency, communication, and patient safety.",items:["Current LPN Unit Manager experience.","Former Assistant Director of Nursing responsibilities.","Staff supervision, coaching, orientation, and competency validation.","Clinical escalation, admissions/discharges, transitions, and interdisciplinary coordination."]}
};
var jobData={
  lawrence:{date:"June 2026 — Present",title:"LPN Unit Manager",company:"Lawrence Rehabilitation & Healthcare Center · Lawrenceville, NJ",items:["Leads unit-level clinical operations in skilled nursing/post-acute care.","Builds strength in staff supervision, care coordination, family communication, documentation quality, escalation, and transitions of care.","Extends an existing leadership track spanning ADON support, wound care, staff education, and quality improvement."],why:"Operational judgment helps a field nurse recognize risk early, communicate clearly, document precisely, and keep complex care moving across patients, families, providers, and agencies."},
  belle:{date:"October 2024 — June 2026",title:"Assistant Director of Nursing / Wound Care Nurse / Building Educator / QAPI",company:"Belle Care Nursing & Rehabilitation Center · Trenton, NJ",items:["Held four concurrent clinical-leadership responsibilities across nursing operations, wound management, workforce education, and quality improvement.","Ran audit rounds across 6+ clinical-risk and compliance domains.","Built orientation, annual competencies, skills fairs, and infection-prevention education.","Supported wound assessment, survey readiness, corrective action, QAPI, root-cause analysis, and IV therapy."],why:"This is the bridge from individual care to agency quality: training, documentation, audits, infection prevention, and follow-through all affect patient safety at scale."},
  palace:{date:"2020 — 2023",title:"Unit Manager / Assistant Director of Nursing",company:"The Palace Rehabilitation & Care Center · Maple Shade, NJ",items:["Advanced from direct-care nursing into unit management and Assistant Director of Nursing responsibilities.","Coordinated workflow, documentation, change-of-condition escalation, admissions/discharges, and interdisciplinary communication.","Supported care-plan meetings and family conferences while retaining hands-on wound, catheter, tracheostomy, respiratory, hydration, medication, and IV capability."],why:"Home-care employers get a nurse who has practiced both close-to-the-patient care and higher-level operational coordination."},
  newborn:{date:"2011 — 2015",title:"LPN — Pediatric Home Care",company:"Newborn Nurses · Cherry Hill, NJ",items:["Provided in-home nursing for pediatric and medically fragile clients.","Performed assessments, medication administration, airway support, and feeding assistance.","Provided family teaching, infection-prevention reinforcement, and emergency-response guidance."],why:"Direct proof that Erica understands the rhythm, responsibility, and family partnership required inside the home."},
  preferred:{date:"2010 — 2014",title:"LPN — Adult Home Care",company:"Preferred Health Mates · Mount Laurel, NJ",items:["Delivered in-home wound and catheter care, skin-integrity monitoring, and medication administration.","Performed vital-sign surveillance, mobility support, chronic-condition reinforcement, and caregiver collaboration.","Worked independently while maintaining documentation and escalation responsibilities."],why:"Immediate relevance for skilled visits, private duty, chronic-condition support, and home-based clinical care."},
  earlier:{date:"2009 onward",title:"Foundational LPN + Community Care Experience",company:"Hamilton Continuing Care Center · Public Partnership · South Jersey",items:["Administered medications and IV fluids, completed assessments, monitored infusion sites, and maintained MAR/TAR and intake/output documentation.","Supported emergency response, restorative care, and infection prevention.","Later delivered community-based ADL, mobility, nutrition/hydration, safety monitoring, and client/family support."],why:"The throughline is hands-on patient care, reliable documentation, early risk recognition, and support for the people surrounding the patient."}
};

function setRole(key){
  var d=roleData[key]||roleData.home;
  byId("roleKicker").textContent=d.k;
  byId("roleHeadline").textContent=d.h;
  byId("roleText").textContent=d.t;
  byId("roleProofs").innerHTML=d.p.map(function(x){return '<div class="proof">'+x+'</div>';}).join("");
  byId("signalLabel").textContent=d.l;
  byId("signalBig").textContent=d.b;
  byId("signalText").textContent=d.s;
}
function setSkill(card){
  var d=skillData[card.getAttribute("data-skill")];
  if(!d){return;}
  var detail=byId("skillDetail");
  each(".skill",function(el){
    el.classList.remove("isActive");
    var b=el.querySelector("button");
    if(b){b.setAttribute("aria-expanded","false");}
  });
  card.classList.add("isActive");
  card.querySelector("button").setAttribute("aria-expanded","true");
  byId("skillTitle").textContent=d.title;
  byId("skillIntro").textContent=d.intro;
  byId("skillList").innerHTML=d.items.map(function(x){return "<li>"+x+"</li>";}).join("");
  card.insertAdjacentElement("afterend",detail);
  detail.classList.add("isOpen");
  if(window.innerWidth<=820){window.setTimeout(function(){safeScroll(detail,"nearest");},30);}
}
function closeSkill(){
  byId("skillDetail").classList.remove("isOpen");
  each(".skill",function(el){
    el.classList.remove("isActive");
    var b=el.querySelector("button"); if(b){b.setAttribute("aria-expanded","false");}
  });
}
function setJob(key){
  var d=jobData[key]||jobData.lawrence;
  byId("jobDate").textContent=d.date;
  byId("jobTitle").textContent=d.title;
  byId("jobCompany").textContent=d.company;
  byId("jobList").innerHTML=d.items.map(function(x){return "<li>"+x+"</li>";}).join("");
  byId("jobWhy").innerHTML="<b>Why it matters in home care</b>"+d.why;
}
function init(){
  each(".tab",function(btn){
    btn.addEventListener("click",function(){
      setPressed(".tab",btn);
      setRole(btn.getAttribute("data-role"));
    });
  });
  each(".skill",function(card){
    var btn=card.querySelector("button");
    if(btn){btn.addEventListener("click",function(){setSkill(card);});}
  });
  byId("closeSkill").addEventListener("click",closeSkill);
  each(".jobBtn",function(btn){
    btn.addEventListener("click",function(){
      setPressed(".jobBtn",btn);
      setJob(btn.getAttribute("data-job"));
      if(window.innerWidth<=820){window.setTimeout(function(){safeScroll(byId("jobCard"),"start");},30);}
    });
  });
  each("[data-pay]",function(btn){
    btn.addEventListener("click",function(){
      setPressed("[data-pay]",btn);
      var hourly=btn.getAttribute("data-pay")==="hourly";
      byId("payBig").textContent=hourly?"$50.48–$53.37/hr":"$105K–$111K";
      byId("paySub").textContent=hourly?"Equivalent target at 40 hours/week":"Target total annual compensation";
      byId("payNote").textContent=hourly
        ?"Hourly conversion assumes 2,080 paid hours per year. Differentials, overtime, bonuses, mileage value, and benefits can materially affect total compensation."
        :"Hourly equivalent assumes 2,080 paid hours per year. Reliable base pay plus guaranteed differentials, overtime, or other dependable earnings can be considered together.";
    });
  });
  byId("printBtn").addEventListener("click",function(){
    try{
      if(typeof window.print==="function"){window.print();}
      else{toast("Browser menu → Print → Save as PDF");}
    }catch(e){toast("Browser menu → Print → Save as PDF");}
  });
  byId("vcardLink").addEventListener("click",function(){toast("Opening Erica’s contact card…");});
  setRole("home");
  setJob("lawrence");
}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}
})();