import {useEffect,useMemo,useRef,useState} from "react";
import {Button,Card,PageHeader} from "../../components/ui";
import {uiContent} from "../../config/ui-content";
import {useAppData} from "../../app/AppDataProvider";
import {useAuth} from "../auth/AuthProvider";
import {PendingLog} from "./pending-log";

export function QuickLogPage(){
  const copy=uiContent.quickLog;
  const [kind,setKind]=useState<"action_completed"|"action_missed">("action_completed");
  const [selected,setSelected]=useState<string>(copy.options[0].label);
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);
  const [retrying,setRetrying]=useState(false);
  const [note,setNote]=useState("");
  const [saveError,setSaveError]=useState("");
  const busy=useRef(false);
  const {prepareAction,saveAction,currentUserId,groupId,loading,error}=useAppData();
  const {configured}=useAuth();
  const setup=useMemo(()=>{
    if(!groupId)return {};
    try{return {draft:new PendingLog(localStorage,{userId:currentUserId,groupId,mode:configured?"connected":"demo"},{prepare:prepareAction,commit:saveAction})}}
    catch{return {error:"Device storage is unavailable. Enable browser storage to save logs."}}
  },[currentUserId,groupId,configured,prepareAction,saveAction]);

  useEffect(()=>{
    try{
      const pending=setup.draft?.read();
      setRetrying(!!pending);setSaved(false);
      if(pending){
        setKind(pending.actionType==="action_missed"?"action_missed":"action_completed");
        setSelected(copy.options.find(option=>option.label.toLowerCase()===pending.category)?.label??copy.options[0].label);
        setNote(typeof pending.metadata.note==="string"?pending.metadata.note:"");
      }
    }catch(reason){setSaveError(reason instanceof Error?reason.message:copy.saveError)}
  },[setup,copy]);

  const save=async()=>{
    if(busy.current||saved||!setup.draft)return;
    busy.current=true;setSaving(true);setSaveError("");
    try{
      await setup.draft.save({actionType:kind,category:selected,title:`${kind==="action_completed"?"Completed":"Missed"} ${selected}`,note});
      setSaved(true);setRetrying(false);
    }catch(reason){
      setSaveError(reason instanceof Error?reason.message:copy.saveError);
      try{setRetrying(!!setup.draft.read())}catch{setRetrying(true)}
    }finally{busy.current=false;setSaving(false)}
  };
  const locked=saving||saved||retrying||loading||!setup.draft;
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/>
    <div className="segment" role="group" aria-label="Log result"><button type="button" disabled={locked} aria-pressed={kind==="action_completed"} onClick={()=>setKind("action_completed")} className={kind==="action_completed"?"active":""}>{copy.positiveLabel}</button><button type="button" disabled={locked} aria-pressed={kind==="action_missed"} onClick={()=>setKind("action_missed")} className={kind==="action_missed"?"active penalty":""}>{copy.penaltyLabel}</button></div>
    <Card><div role="radiogroup" aria-label="Action category">{copy.options.map(option=><button type="button" disabled={locked} role="radio" aria-checked={selected===option.label} className={`log-row ${selected===option.label?"selected":""}`} onClick={()=>setSelected(option.label)} key={option.label}><span aria-hidden="true">{option.icon}</span><b>{option.label}<small>{kind==="action_completed"?copy.completedDescription:copy.missedDescription}</small></b><i aria-hidden="true">›</i></button>)}</div><label className="sr-only" htmlFor="quick-log-note">{copy.notePlaceholder}</label><input id="quick-log-note" disabled={locked} value={note} onChange={event=>setNote(event.target.value)} placeholder={copy.notePlaceholder} maxLength={120}/></Card>
    {error||setup.error||saveError?<p role="alert" className="error">{error||setup.error||saveError}</p>:null}
    {retrying?<p role="status" className="hint">{copy.pendingHint}</p>:null}
    <Button aria-live="polite" onClick={()=>void save()} disabled={loading||saving||saved||!setup.draft||!!error}>{saved?copy.savedLabel:saving?copy.savingLabel:loading?copy.loadingLabel:retrying?copy.retryLabel:copy.saveLabel}</Button>
    {saved?<Button className="secondary" onClick={()=>{setSaved(false);setNote("")}}>{copy.anotherLabel}</Button>:null}
  </>;
}
