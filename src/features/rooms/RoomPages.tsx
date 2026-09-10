import {useEffect,useState} from "react";
import {Link,useLocation,useNavigate,useParams} from "react-router-dom";
import {useAppData} from "../../app/AppDataProvider";
import {useGameData} from "../../app/GameDataProvider";
import {useAuth} from "../auth/AuthProvider";
import {Button,Card,PageHeader,StatusChip} from "../../components/ui";
import {VisualAsset} from "../../components/VisualAsset";
import {uiContent} from "../../config/ui-content";
import type {RoomAction,RoomSlot} from "../../domain/models/rooms";

function HouseholdActionPicker({groupId,targetUserId}:{groupId:string;targetUserId:string}){
  const {leaveHouseholdAction}=useAppData();
  const [kind,setKind]=useState<"poke"|"note"|"pillow"|"gift"|"silly_object">("poke");
  const [message,setMessage]=useState("");
  const [saved,setSaved]=useState(false);const [error,setError]=useState("");
  async function send(){setError("");try{await leaveHouseholdAction({id:crypto.randomUUID(),groupId,targetUserId,actionType:kind,message:message.trim()||undefined,payload:{}});setMessage("");setSaved(true)}catch(reason){setError(reason instanceof Error?reason.message:"Could not leave that surprise")}}
  return <Card><h2>Leave something behind</h2><p>It will be waiting here the next time they open the app.</p><div className="choice-grid">{(["poke","note","pillow","gift","silly_object"] as const).map(value=><button type="button" className={`choice ${kind===value?"selected":""}`} aria-pressed={kind===value} onClick={()=>setKind(value)} key={value}>{value.replace("_"," ")}</button>)}</div>{kind==="note"?<textarea value={message} onChange={event=>setMessage(event.target.value)} maxLength={500} rows={3} placeholder="Leave a little message…"/>:null}{error?<p role="alert" className="our-place-error">{error}</p>:null}{saved?<p role="status" className="today-notice">Left behind. They’ll find it next visit.</p>:null}<Button onClick={()=>void send()}>{saved?"Leave another":"Leave it here"}</Button></Card>;
}

export function RoomsHomePage(){
  const copy=uiContent.rooms;
  const {currentUserId}=useAppData();
  const {rooms,entitlements,loading,error}=useGameData();
  const mischief=entitlements.filter(item=>item.entitlementType==="mischief").length;
  const defense=entitlements.filter(item=>item.entitlementType==="defense").length;
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/>
    <Card className="house-overview"><div><VisualAsset asset="houseAirship"/><span>William</span><span>Sister</span></div><h2>{copy.overviewTitle}</h2><p>{copy.overviewBody}</p></Card>
    <div className="token-row"><StatusChip tone="orange">⚡ {mischief} Mischief</StatusChip><StatusChip tone="blue">🛡 {defense} Defense</StatusChip></div>
    {error?<p role="alert" className="error">{error}</p>:null}
    {loading?<p role="status">Loading house…</p>:rooms.map(room=>{const own=room.ownerId===currentUserId;const labels=own?copy.ownActions:copy.otherActions;return <Card className="room-card" key={room.id}><div className={`room-preview theme-${room.theme}`}><VisualAsset asset={own?"williamFullBody":"sisterFullBody"}/><span>🔒 🔒</span></div><h2>{room.name}</h2><p>{own?"Your cozy room":"Your sibling’s room"}</p><div className="split"><Link className="button-link" to={`/house/rooms/${room.id}`}>{labels[0]}</Link><Link to={own?`/house/rooms/${room.id}/traps`:`/house/rooms/${room.id}/raid`}>{labels[1]}</Link></div></Card>})}
  </>;
}

export function RoomViewPage(){
  const {roomId=""}=useParams();
  const copy=uiContent.rooms;
  const {currentUserId,groupId}=useAppData();
  const {configured}=useAuth();
  const {rooms,loadSlots}=useGameData();
  const room=rooms.find(item=>item.id===roomId);
  const [slots,setSlots]=useState<RoomSlot[]>([]);
  useEffect(()=>{if(roomId)void loadSlots(roomId).then(setSlots)},[roomId,loadSlots]);
  if(!room)return <><PageHeader title="Room unavailable" subtitle="This room is not in your challenge group"/></>;
  const own=room.ownerId===currentUserId;
  return <><PageHeader title={room.name} subtitle={copy.viewSubtitle}/><div className={`room-scene theme-${room.theme}`}><VisualAsset asset={own?"williamFullBody":"sisterFullBody"} className="full-avatar"/><div className="room-canvas">{slots.map(slot=><div className={slot.isProtected?"protected":""} key={slot.id}>{slot.slotKey}{slot.isProtected?<span aria-label="Protected">🔒</span>:null}</div>)}</div></div><Card><h2>{copy.recentTitle}</h2><p>{copy.recentBody}</p></Card>{configured&&!own?<HouseholdActionPicker groupId={groupId} targetUserId={room.ownerId}/>:null}<div className="split"><Button>{copy.decorateLabel}</Button>{own?<Link to={`/house/rooms/${room.id}/traps`}>{copy.trapsLabel}</Link>:<Link className="button-link" to={`/house/rooms/${room.id}/raid`}>{copy.raidLabel}</Link>}</div></>;
}

export function RaidPage(){
  const {roomId=""}=useParams();
  const copy=uiContent.raid;
  const navigate=useNavigate();
  const {rooms,entitlements,items,loadSlots,applyRoomAction}=useGameData();
  const room=rooms.find(entry=>entry.id===roomId);
  const entitlement=entitlements.find(entry=>entry.entitlementType==="mischief"&&entry.targetUserId===room?.ownerId);
  const [actionIndex,setActionIndex]=useState(0);
  const [slots,setSlots]=useState<RoomSlot[]>([]);
  const [slotId,setSlotId]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{if(roomId)void loadSlots(roomId).then(next=>{setSlots(next);setSlotId(next.find(slot=>!slot.isProtected)?.id??"")})},[roomId,loadSlots]);
  const selectedItem=items[actionIndex]??items[0];
  async function confirm(){
    if(!entitlement||!room||!slotId)return;
    setSubmitting(true);setError("");
    try{
      const roomAction=await applyRoomAction({entitlementId:entitlement.id,targetRoomId:room.id,slotId,itemId:selectedItem?.id,actionType:"prank"});
      navigate("/room-action-result",{state:{roomAction}});
    }catch(reason){setError(reason instanceof Error?reason.message:"Room action failed")}
    finally{setSubmitting(false)}
  }
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/>
    <Card><StatusChip tone="orange">{entitlement?"1 Mischief Token":"No Mischief Token"}</StatusChip><h2>{copy.chooseTitle}</h2><div role="radiogroup" aria-label={copy.chooseTitle}>{copy.actions.map((item,index)=><button type="button" role="radio" aria-checked={actionIndex===index} className={`choice ${actionIndex===index?"selected":""}`} onClick={()=>setActionIndex(index)} key={item}>{item}</button>)}</div></Card>
    <Card><h2>Choose room slot</h2><div role="radiogroup" aria-label="Choose room slot">{slots.map(slot=><button type="button" role="radio" disabled={slot.isProtected} aria-checked={slotId===slot.id} onClick={()=>setSlotId(slot.id)} className={`choice ${slotId===slot.id?"selected":""}`} key={slot.id}>{slot.slotKey}{slot.isProtected?" · Protected":""}</button>)}</div><p>{copy.protectedBody}</p></Card>
    {error?<p role="alert" className="error">{error}</p>:null}
    <Button onClick={confirm} disabled={!entitlement||!slotId||submitting}>{submitting?"Resolving trap…":`${copy.confirmPrefix} ${copy.actions[actionIndex]}`}</Button>
  </>;
}

export function TrapSetupPage(){
  const copy=uiContent.traps;
  const {entitlements}=useGameData();
  const [selected,setSelected]=useState<string>(copy.types[0]);
  const defense=entitlements.filter(item=>item.entitlementType==="defense").length;
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/><StatusChip tone="blue">{defense} Defense Token</StatusChip><Card><div role="radiogroup" aria-label="Trap type">{copy.types.map(type=><button type="button" role="radio" aria-checked={selected===type} onClick={()=>setSelected(type)} className={`choice ${selected===type?"selected":""}`} key={type}>{type}</button>)}</div></Card><Card><h2>{copy.protectedTitle}</h2><p>{copy.protectedBody}</p></Card><Button disabled={!defense}>{copy.saveLabel}</Button></>;
}

export function RoomActionResultPage(){
  const copy=uiContent.result;
  const location=useLocation();
  const {lastRoomAction}=useGameData();
  const action=(location.state as {roomAction?:RoomAction}|null)?.roomAction??lastRoomAction;
  const heading=action?({applied:"Prank applied",blocked:"Protected slot blocked it",reflected:"Prank reflected",trap_triggered:"Trap triggered",reverted:"Change reverted"} as const)[action.result]:copy.heading;
  return <><PageHeader title={heading} subtitle={copy.subtitle}/><Card className="result"><VisualAsset asset="resultCelebration"/><h2>{heading}</h2><p>{action?`Feed summary: room action ${action.result}.`:copy.summary}</p><code>{action?`RoomAction ${action.id} · ${action.result}`:copy.technicalResult}</code></Card><div className="split"><Link className="button-link" to={action?`/house/rooms/${action.targetRoomId}`:"/house"}>{copy.roomLabel}</Link><Link to="/feed">{copy.feedLabel}</Link></div></>;
}
