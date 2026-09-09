import {ArrowRightIcon,HeartIcon,HomeIcon,PlusIcon} from "@radix-ui/react-icons";
import {useState,type FormEvent} from "react";
import {useNavigate} from "react-router-dom";
import {useAppData} from "../../app/AppDataProvider";
import {useGameData} from "../../app/GameDataProvider";
import {useAuth} from "../auth/AuthProvider";
import {useDoorVisits} from "./door-visits";
import {OurPlaceHeader,Sheet,ourPlaceArt,roomOwnerName} from "./OurPlaceComponents";
import {useSharedBoard,type SharedBoardNote} from "./shared-board";

export function OurPlaceHomePage(){
  const navigate=useNavigate();
  const {currentUserId,groupId}=useAppData();
  const {configured}=useAuth();
  const {rooms,roomActions,loading,error}=useGameData();
  const {notes,error:boardError,add}=useSharedBoard(groupId,currentUserId,!configured);
  const {hasUnseenVisit,markSeen}=useDoorVisits(groupId,currentUserId,roomActions);
  const [adding,setAdding]=useState(false);
  const [selected,setSelected]=useState<SharedBoardNote>();
  const [title,setTitle]=useState("");
  const [body,setBody]=useState("");
  const ordered=[...rooms].sort((a,b)=>Number(b.ownerId===currentUserId)-Number(a.ownerId===currentUserId)).slice(0,2);
  const ownRoom=ordered.find(room=>room.ownerId===currentUserId);
  const ownDoorAjar=ownRoom?hasUnseenVisit(ownRoom.id):false;

  function enter(roomId:string){markSeen(roomId);navigate(`/house/rooms/${roomId}`)}
  function saveNote(event:FormEvent){event.preventDefault();if(add(title,body)){setTitle("");setBody("");setAdding(false)}}

  return <div className="our-place-page our-place-home">
    <OurPlaceHeader title="Our place" subtitle="Welcome home."/>
    {error?<p role="alert" className="our-place-error">{error}</p>:null}
    <section className="our-place-hallway" aria-label="Our hallway">
      <img src={ourPlaceArt(ownDoorAjar?"hallway-ajar":"hallway-closed")} alt="Warm hallway with two bedroom doors"/>
      {ordered.map((room,index)=><button type="button" className={`door-label door-label-${index}`} key={room.id} onClick={()=>enter(room.id)} aria-label={`Enter ${room.name}${hasUnseenVisit(room.id)?", door ajar":", door closed"}`}>
        {roomOwnerName(room.name,index?"Sibling":"You")}
      </button>)}
    </section>
    <div className="door-actions">
      {loading?<p role="status">Opening the hallway…</p>:ordered.map((room,index)=>{
        const own=room.ownerId===currentUserId;
        return <button type="button" className={index===0?"own-door-action":"sibling-door-action"} key={room.id} onClick={()=>enter(room.id)}>
          {own?<HomeIcon/>:<HeartIcon/>}<span>{own?"Your room":`Visit ${roomOwnerName(room.name,"sibling").toLowerCase()}`}</span><ArrowRightIcon/>
        </button>;
      })}
    </div>
    <section className="our-place-board" aria-labelledby="our-board-title">
      <img className="board-art" src={ourPlaceArt("board")} alt=""/>
      <div className="board-content"><div className="board-heading"><h2 id="our-board-title">Our board <HeartIcon/></h2><button type="button" onClick={()=>setAdding(true)}><PlusIcon/>Add note</button></div>
        {boardError?<p role="alert" className="our-place-error">{boardError}</p>:null}
        <div className="board-grid">{notes.slice(-4).map(note=><button type="button" className={`board-note board-note-${note.color}`} key={note.id} onClick={()=>setSelected(note)}>
          <img src={ourPlaceArt("note")} alt=""/><span><strong>{note.title}</strong><small>{note.body||"A little thought for us."}</small></span>
        </button>)}</div>
        {!notes.length?<button type="button" className="empty-board" onClick={()=>setAdding(true)}>Pin the first thing you want to do together.</button>:null}
      </div>
    </section>
    {adding?<Sheet title="Pin a little thought" onClose={()=>setAdding(false)}><form className="our-place-form" onSubmit={saveNote}><label>Title<input autoFocus value={title} onChange={event=>setTitle(event.target.value)} maxLength={70} placeholder="Something for us…"/></label><label>A little more<textarea value={body} onChange={event=>setBody(event.target.value)} maxLength={400} rows={4} placeholder="An idea, reminder, or nice thing to say."/></label><button className="our-place-primary" disabled={!title.trim()}>Pin to our board</button></form></Sheet>:null}
    {selected?<Sheet title={selected.title} onClose={()=>setSelected(undefined)}><p className="board-note-detail">{selected.body||"A little thought for us."}</p><button className="our-place-primary" onClick={()=>setSelected(undefined)}>Back home</button></Sheet>:null}
  </div>;
}
