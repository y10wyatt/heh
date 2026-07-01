import {useState} from "react";
import {Button,Card,PageHeader} from "../../components/ui";
import {uiContent} from "../../config/ui-content";
import {useAppData} from "../../app/AppDataProvider";

export function QuickLogPage(){
  const copy=uiContent.quickLog;
  const [kind,setKind]=useState<"action_completed"|"action_missed">("action_completed");
  const [selected,setSelected]=useState<string>(copy.options[0].label);
  const [saved,setSaved]=useState(false);
  const [note,setNote]=useState("");
  const {logAction}=useAppData();
  const save=async()=>{await logAction({actionType:kind,category:selected,title:`William ${kind==="action_completed"?"completed":"missed"} ${selected}`,note});setSaved(true)};
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/>
    <div className="segment" role="group" aria-label="Log result"><button type="button" aria-pressed={kind==="action_completed"} onClick={()=>setKind("action_completed")} className={kind==="action_completed"?"active":""}>{copy.positiveLabel}</button><button type="button" aria-pressed={kind==="action_missed"} onClick={()=>setKind("action_missed")} className={kind==="action_missed"?"active penalty":""}>{copy.penaltyLabel}</button></div>
    <Card><div role="radiogroup" aria-label="Action category">{copy.options.map(option=><button type="button" role="radio" aria-checked={selected===option.label} className={`log-row ${selected===option.label?"selected":""}`} onClick={()=>{setSelected(option.label);setSaved(false)}} key={option.label}><span aria-hidden="true">{option.icon}</span><b>{option.label}<small>{kind==="action_completed"?copy.completedDescription:copy.missedDescription}</small></b><i aria-hidden="true">›</i></button>)}</div><label className="sr-only" htmlFor="quick-log-note">{copy.notePlaceholder}</label><input id="quick-log-note" value={note} onChange={event=>setNote(event.target.value)} placeholder={copy.notePlaceholder} maxLength={120}/></Card>
    <Button aria-live="polite" onClick={save}>{saved?`${selected} saved ✓`:copy.saveLabel}</Button></>;
}
