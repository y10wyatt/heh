import {CheckIcon,HeartIcon,LightningBoltIcon,PlusIcon,StarFilledIcon,StarIcon,SunIcon} from "@radix-ui/react-icons";
import {useMemo,useState,type FormEvent} from "react";
import {Link} from "react-router-dom";
import {useAppData} from "../../app/AppDataProvider";
import {taskCategories,type TaskCategory} from "../../domain/models/task";
import {ScoringService} from "../../domain/services/scoring-service";
import {useTasks} from "../capture/use-tasks";
import {Sheet} from "./OurPlaceComponents";

const categoryCopy:Record<TaskCategory,{label:string;description:string;target:number}>={
  body:{label:"Body",description:"Move & recharge",target:3},
  mind:{label:"Mind",description:"Learn & explore",target:4},
  joy:{label:"Joy",description:"Make room for fun",target:2},
  everyday:{label:"Everyday",description:"Life’s little things",target:3},
};

function localDate(value:Date|string){const date=typeof value==="string"?new Date(value):value;return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`}
function currentWeekStart(now=new Date()){const day=new Date(now);const offset=(day.getDay()+6)%7;day.setHours(0,0,0,0);day.setDate(day.getDate()-offset);return day}

export function OurPlaceTodayPage(){
  const {events,rules,currentUserId,error:appError,loading}=useAppData();
  const taskList=useTasks();
  const [filter,setFilter]=useState<TaskCategory|"all">("all");
  const [adding,setAdding]=useState(false);
  const [title,setTitle]=useState("");
  const [category,setCategory]=useState<TaskCategory>("body");
  const [notice,setNotice]=useState("");
  const today=localDate(new Date());
  const weekStart=currentWeekStart();
  const totals=useMemo(()=>new ScoringService().totals(events,rules),[events,rules]);
  const tasks=taskList.tasks.map(task=>({...task,done:!!task.completedAt||events.some(event=>event.id===task.id&&event.userId===currentUserId)}));
  const pending=tasks.filter(task=>!task.done);
  const completedToday=tasks.filter(task=>task.completedAt&&localDate(task.completedAt)===today);
  const shownCategories=taskCategories.filter(value=>filter==="all"||filter===value);
  const disabled=loading||!!appError||taskList.saving||!taskList.ready;
  const dateLabel=new Date().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});

  async function save(event:FormEvent){
    event.preventDefault();
    if(await taskList.add(title,category)){setTitle("");setAdding(false);setNotice("Goal saved. One small step at a time.")}
  }
  async function complete(id:string){
    if(await taskList.complete(id))setNotice("A little win. Your shared score is updated.");
  }
  const weeklyCount=(value:TaskCategory)=>tasks.filter(task=>task.category===value&&task.completedAt&&new Date(task.completedAt)>=weekStart).length;

  return <div className="our-place-page today-page">
    <header className="today-heading"><div><p>{dateLabel}</p><h1>A little for you.</h1></div><span className="today-points" aria-label={`${totals[currentUserId]??0} points`}><LightningBoltIcon/>{totals[currentUserId]??0}</span></header>
    <section className="today-welcome"><SunIcon/><div><h2>Your own kind of good day.</h2><p>{completedToday.length?`${completedToday.length} little ${completedToday.length===1?"win":"wins"} already. Go at your pace.`:"Small steps count. Pick one that feels right."}</p></div></section>
    <div className="today-progress"><span><strong>{completedToday.length}</strong> little {completedToday.length===1?"win":"wins"} today</span><span>{pending.length} waiting</span><progress aria-label="Daily goal progress" value={completedToday.length} max={Math.max(tasks.length,1)}/></div>
    {appError||taskList.error?<p role="alert" className="our-place-error">{appError||taskList.error}</p>:null}
    {notice?<p role="status" className="today-notice">{notice}</p>:null}
    <section aria-labelledby="side-quests-title"><div className="today-section-heading"><div><h2 id="side-quests-title">Your side quests</h2><p>Personal goals outside work.</p></div><button type="button" onClick={()=>setAdding(true)}><PlusIcon/>Add goal</button></div>
      <div className="goal-filters" aria-label="Goal category"><button type="button" aria-pressed={filter==="all"} onClick={()=>setFilter("all")}>All</button>{taskCategories.map(value=><button type="button" aria-pressed={filter===value} onClick={()=>setFilter(value)} key={value}>{categoryCopy[value].label}</button>)}</div>
      {shownCategories.map(value=>{const categoryTasks=pending.filter(task=>task.category===value);if(!categoryTasks.length)return null;return <section className={`goal-group category-${value}`} key={value}><h3>{categoryCopy[value].label}<span>{categoryCopy[value].description}</span></h3>{categoryTasks.map(task=><div className="daily-task" key={task.id}><button type="button" className="daily-complete" disabled={disabled} onClick={()=>void complete(task.id)}><span className="daily-check" aria-hidden="true"/><span>{task.title}<small>One little step · shared points</small></span></button><button type="button" className="daily-star" disabled={disabled} aria-pressed={task.starred} aria-label={`${task.starred?"Unstar":"Star"} ${task.title}`} onClick={()=>void taskList.star(task.id)}>{task.starred?<StarFilledIcon/>:<StarIcon/>}</button></div>)}</section>})}
      {!pending.some(task=>filter==="all"||task.category===filter)?<div className="goals-empty"><HeartIcon/><p>{pending.length?`Nothing waiting in ${categoryCopy[filter as TaskCategory]?.label??"this category"}.`:"Room to rest, or room for something new."}</p><button type="button" onClick={()=>setAdding(true)}>Add a little goal</button></div>:null}
    </section>
    <section className="weekly-section" aria-labelledby="weekly-title"><div className="today-section-heading"><div><h2 id="weekly-title">A little each week</h2><p>Small actions add up. Mon–Sun.</p></div><Link to="/results">Details</Link></div><div className="weekly-grid">{taskCategories.map(value=>{const count=weeklyCount(value);const target=categoryCopy[value].target;return <div className={`weekly-card category-${value}`} key={value}><div><strong>{categoryCopy[value].label}</strong><span>{count}/{target}</span></div><progress aria-label={`${categoryCopy[value].label} weekly progress`} value={Math.min(count,target)} max={target}/><small>{count>=target?"Made room for yourself.":`${target-count} more little ${target-count===1?"win":"wins"}`}</small></div>})}</div></section>
    {completedToday.length?<section className="resolved-goals"><h2>Made room for today</h2>{completedToday.map(task=><div className="resolved-row" key={task.id}><CheckIcon/><span><strong>{task.title}</strong><small>Done · recorded in the shared feed</small></span></div>)}</section>:null}
    <Link className="quick-log-link" to="/log">Log something that was not on your list</Link>
    <p className="today-footer-note">A little progress here. A little mischief next door.</p>
    {adding?<Sheet title="One small thing" onClose={()=>setAdding(false)}><form className="our-place-form" onSubmit={save}><label>Your goal<input autoFocus value={title} onChange={event=>setTitle(event.target.value)} maxLength={120} placeholder="Read a page, stretch, call someone…"/></label><fieldset><legend>A little for your…</legend><div className="category-picker">{taskCategories.map(value=><button type="button" aria-pressed={category===value} onClick={()=>setCategory(value)} key={value}>{categoryCopy[value].label}</button>)}</div></fieldset><button className="our-place-primary" disabled={!title.trim()||disabled}>Save goal</button></form></Sheet>:null}
  </div>;
}
