import {useRef,useState} from "react";
import {Link} from "react-router-dom";
import {useAppData} from "../../app/AppDataProvider";
import {useGameData} from "../../app/GameDataProvider";
import {Button,Card,PageHeader} from "../../components/ui";
import {VisualAsset} from "../../components/VisualAsset";
import {uiContent} from "../../config/ui-content";
import {ScoringService} from "../../domain/services/scoring-service";
import {useTasks} from "../capture/use-tasks";

export function HomePage(){
  const copy=uiContent.home;
  const {events,rules,currentUserId,groupId,loading,error}=useAppData();
  const {entitlements,rooms,finalizeDay,dailyResult}=useGameData();
  const taskList=useTasks();
  const [adding,setAdding]=useState(false);
  const [newTask,setNewTask]=useState("");
  const [finalizing,setFinalizing]=useState(false);
  const finalizingRef=useRef(false);
  const [showConfirm,setShowConfirm]=useState(false);
  const [message,setMessage]=useState("");
  const [finalizeError,setFinalizeError]=useState("");
  const scored=new ScoringService().score(events,rules);
  const totals=new ScoringService().totals(events,rules);
  const siblingId=rooms.find(room=>room.ownerId!==currentUserId)?.ownerId??events.find(event=>event.userId!==currentUserId)?.userId;
  const tasks=taskList.tasks.map(task=>({...task,done:!!task.completedAt||events.some(event=>event.id===task.id&&event.userId===currentUserId)}));
  const doneCount=tasks.filter(task=>task.done).length;
  const pct=tasks.length?Math.round(doneCount/tasks.length*100):0;
  const available=entitlements.filter(item=>item.userId===currentUserId&&item.challengeGroupId===groupId&&!item.usedAt&&(!item.expiresAt||Date.parse(item.expiresAt)>Date.now()));
  const ownRoom=rooms.find(room=>room.ownerId===currentUserId);
  const siblingEvent=events.filter(event=>event.userId!==currentUserId&&event.visibility==="challenge_group")
    .sort((a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt))[0];
  const disabled=loading||!!error||taskList.saving||!taskList.ready;

  async function addTask(){
    if(await taskList.add(newTask)){setNewTask("");setAdding(false)}
  }

  async function confirmFinalize(){
    if(finalizingRef.current)return;
    finalizingRef.current=true;setFinalizing(true);setMessage("");setFinalizeError("");
    try{
      await finalizeDay();setShowConfirm(false);setMessage(copy.finalizedMessage);
    }catch(reason){setFinalizeError(reason instanceof Error?reason.message:copy.finalizeError)}
    finally{finalizingRef.current=false;setFinalizing(false)}
  }

  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/>
    {error||taskList.error?<p role="alert" className="error">{error||taskList.error}</p>:null}
    <Card className="today-score">
      <div className="duel-avatar"><VisualAsset asset="williamFullBody"/><b>{copy.youLabel}</b><small>{totals[currentUserId]??0} {copy.pointsLabel}</small></div>
      <div className="duel-meter"><span>{copy.versusLabel}</span><small>{copy.scoreScope}</small></div>
      <div className="duel-avatar"><VisualAsset asset="sisterFullBody"/><b>{copy.siblingLabel}</b><small>{siblingId?totals[siblingId]??0:0} {copy.pointsLabel}</small></div>
    </Card>
    <Card className="progress-card"><h2>{copy.progressTitle}</h2><p>{copy.progress(doneCount,tasks.length)} <b>{pct}%</b></p><div className="progress-bar" role="progressbar" aria-label={copy.tasksTitle} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${pct}%`}}/></div></Card>
    <Card><div className="section-title"><h2>{copy.tasksTitle}</h2><button type="button" disabled={disabled} onClick={()=>setAdding(true)}>{copy.addLabel}</button></div>
      <p className="hint">{copy.taskStorageHint}</p>
      {!tasks.length?<p>{copy.emptyTasks}</p>:null}
      <div className="task-list">{tasks.map(task=>{
        const points=scored.find(item=>item.event.id===task.id)?.points;
        return <div className={`task-row ${task.done?"done":""}`} key={task.id}>
          <button type="button" aria-label={`${task.done?copy.completedTaskLabel:task.completion?copy.retryTaskLabel:copy.completeTaskLabel} ${task.title}`} disabled={disabled||task.done} onClick={()=>void taskList.complete(task.id)}>{task.done?"☑":"☐"}</button>
          <button type="button" aria-label={`${copy.starTaskLabel} ${task.title}`} aria-pressed={task.starred} disabled={disabled} onClick={()=>void taskList.star(task.id)}>{task.starred?"★":"☆"}</button>
          <span>{task.title}</span>{task.done&&points!==undefined?<small>{points>0?"+":""}{points}</small>:task.completion&&!task.done?<small>{copy.retryLabel}</small>:null}
        </div>;
      })}
      {adding?<form className="task-row add-row" onSubmit={event=>{event.preventDefault();void addTask()}}><span aria-hidden="true">☐</span><input autoFocus aria-label={copy.taskPlaceholder} value={newTask} maxLength={120} disabled={disabled} onChange={event=>setNewTask(event.target.value)} onKeyDown={event=>{if(event.key==="Escape"){setAdding(false);setNewTask("")}}} placeholder={copy.taskPlaceholder}/><button type="submit" aria-label={copy.saveTaskLabel} disabled={disabled||!newTask.trim()}>✓</button><button type="button" aria-label={copy.cancelTaskLabel} disabled={taskList.saving} onClick={()=>{setAdding(false);setNewTask("")}}>×</button></form>:null}</div>
      {doneCount>0?<p className="hint">{copy.completionHint}</p>:null}
      {taskList.saving?<p role="status">{copy.savingLabel}</p>:null}
    </Card>
    <Card className="feed"><div className="avatar"><VisualAsset asset="sisterAvatar"/></div><div><small>{copy.siblingActivity}</small><h2>{siblingEvent?.title??copy.emptyActivity}</h2></div></Card>
    <Card className="compact-house"><div><h2>{copy.houseTitle}</h2><p>{ownRoom?copy.houseReady(ownRoom.name):copy.houseEmpty}</p><Link to="/house">{copy.houseLink}</Link></div><VisualAsset asset="houseAirship"/></Card>
    <div className="token-row"><span className="token mischief">⚡ {available.filter(item=>item.entitlementType==="mischief").length} {copy.mischiefLabel}</span><span className="token defense">🛡 {available.filter(item=>item.entitlementType==="defense").length} {copy.defenseLabel}</span></div>
    {message?<p role="status" className="hint">{message}</p>:null}
    {finalizeError?<p role="alert" className="error">{finalizeError}</p>:null}
    {showConfirm?<Card><h2>{copy.finalizeTitle}</h2><p>{copy.finalizeBody}</p><div className="split"><Button className="secondary" onClick={()=>setShowConfirm(false)} disabled={finalizing}>{copy.cancelLabel}</Button><Button onClick={()=>void confirmFinalize()} disabled={disabled||finalizing}>{finalizing?copy.finalizingLabel:copy.confirmLabel}</Button></div></Card>:null}
    {dailyResult?<Card><h2>{dailyResult.tie?copy.tieLabel:copy.finalizedTitle}</h2><p>{dailyResult.localDate}</p></Card>:null}
    <Button onClick={()=>setShowConfirm(true)} disabled={disabled||finalizing}>{finalizing?copy.finalizingLabel:copy.finalizeLabel}</Button>
    <div className="secondary-links"><Link to="/feed">{copy.feedLink}</Link><Link to="/results">{copy.resultsLink}</Link><Link to="/rules">{copy.rulesLink}</Link><Link to="/log">{uiContent.quickLog.title}</Link></div>
  </>;
}
