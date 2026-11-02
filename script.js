const initial = {
  sem1: [
    {code:"COMM1111", title:"Communication 1", credits:9, note:10},
    {code:"VSR1114", title:"Valeurs, principes et symboles de la République", credits:7, note:10},
    {code:"SEG1112", title:"Statistique descriptive", credits:10, note:10},
    {code:"MEG1113", title:"Mathématiques appliquées à l'économie et à la gestion 1", credits:4, note:9}
  ],
  sem2: [
    {code:"HEC1121", title:"Histoire des faits économiques", credits:3, note:12},
    {code:"MNG1122", title:"Management 1", credits:8, note:12},
    {code:"MFI1123", title:"Mathématiques de la finance", credits:7, note:12},
    {code:"AEC1124", title:"Analyse économique 1", credits:12, note:12}
  ]
};
let data = JSON.parse(JSON.stringify(initial));

function renderSemester(key, targetId, summaryId){
  const tbody = document.getElementById(targetId);
  tbody.innerHTML = "";
  data[key].forEach((ue, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ue.code}</td>
      <td>${ue.title}</td>
      <td><input aria-label="Crédits ${ue.code}" type="number" min="0" step="0.5" value="${ue.credits}" data-key="${key}" data-index="${index}" data-field="credits"></td>
      <td><input aria-label="Note ${ue.code}" type="number" min="0" max="20" step="0.5" value="${ue.note}" data-key="${key}" data-index="${index}" data-field="note"></td>
      <td class="decision ${ue.note >= 10 ? "valid":"invalid"}">${ue.note >= 10 ? "VAL":"NVAL"}</td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("input").forEach(input => input.addEventListener("input", event => {
    const el = event.target;
    const value = Number(el.value);
    if (!Number.isFinite(value) || value < 0) return;
    const row = data[el.dataset.key][Number(el.dataset.index)];
    row[el.dataset.field] = el.dataset.field === "note" ? Math.min(20,value) : value;
    update();
  }));
  const totalCredits = data[key].reduce((s,x)=>s+x.credits,0);
  const earned = data[key].filter(x=>x.note>=10).reduce((s,x)=>s+x.credits,0);
  const average = totalCredits ? data[key].reduce((s,x)=>s+x.note*x.credits,0)/totalCredits : 0;
  document.getElementById(summaryId).innerHTML = `
    <div class="metric"><span>Crédits obtenus</span><strong>${fmt(earned)} / ${fmt(totalCredits)}</strong></div>
    <div class="metric"><span>Moyenne pondérée</span><strong>${average.toFixed(2)} / 20</strong></div>
    <div class="metric"><span>UE à reprendre</span><strong>${data[key].filter(x=>x.note<10).length}</strong></div>
    <div class="metric"><span>Décision simulée</span><strong>${earned===totalCredits && totalCredits>0 ? "VAL":"NVAL"}</strong></div>`;
  return {totalCredits,earned,average};
}
function fmt(n){return Number.isInteger(n)?n:n.toFixed(1)}
function update(){
  const a = renderSemester("sem1","sem1","summary1");
  const b = renderSemester("sem2","sem2","summary2");
  const total = a.totalCredits+b.totalCredits;
  const earned = a.earned+b.earned;
  const avg = total ? (a.average*a.totalCredits+b.average*b.totalCredits)/total : 0;
  document.getElementById("annualSummary").innerHTML = `
    <div><span>Crédits obtenus</span><strong>${fmt(earned)} / ${fmt(total)}</strong></div>
    <div><span>Moyenne annuelle pondérée</span><strong>${avg.toFixed(2)} / 20</strong></div>
    <div><span>UE à reprendre</span><strong>${data.sem1.concat(data.sem2).filter(x=>x.note<10).length}</strong></div>
    <div><span>Décision simulée</span><strong>${earned===total && total>0 ? "VAL":"AJ / À vérifier"}</strong></div>`;
}
document.getElementById("resetBtn").addEventListener("click",()=>{data=JSON.parse(JSON.stringify(initial));update()});
document.getElementById("printBtn").addEventListener("click",()=>window.print());
update();
