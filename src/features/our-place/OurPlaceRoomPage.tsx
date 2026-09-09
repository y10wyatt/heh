import {ArrowLeftIcon,GearIcon,HeartIcon,MagicWandIcon} from "@radix-ui/react-icons";
import {useEffect,useState} from "react";
import {Link,useParams} from "react-router-dom";
import {useAppData} from "../../app/AppDataProvider";
import {useGameData} from "../../app/GameDataProvider";
import {useDoorVisits} from "./door-visits";
import {ourPlaceArt,roomOwnerName} from "./OurPlaceComponents";

export function OurPlaceRoomPage(){
  const {roomId=""}=useParams();
  const {currentUserId,groupId}=useAppData();
  const {rooms,roomActions}=useGameData();
  const {markSeen}=useDoorVisits(groupId,currentUserId,roomActions);
  const [tidied,setTidied]=useState(false);
  const room=rooms.find(item=>item.id===roomId);
  const ownRoom=rooms.find(item=>item.ownerId===currentUserId);
  const siblingRoom=rooms.find(item=>item.ownerId!==currentUserId);
  const latest=roomActions.filter(action=>action.targetRoomId===roomId&&action.result==="applied").sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt))[0];
  const surprise=!!latest&&!tidied;
  useEffect(()=>{if(roomId)markSeen(roomId)},[roomId]);

  if(!room)return <div className="our-place-page room-unavailable"><Link to="/"><ArrowLeftIcon/>Home</Link><h1>Room unavailable</h1><p>This room is not part of your household.</p></div>;
  const own=room.ownerId===currentUserId;
  const ownerName=roomOwnerName(room.name,own?"You":"Sibling");
  const other=own?siblingRoom:ownRoom;
  const visitorName=latest?.actorId===currentUserId?"You":"Your sibling";

  return <div className="our-place-page our-place-room"><header className="room-toolbar"><Link to="/" aria-label="Back home"><ArrowLeftIcon/>Home</Link><h1>{own?"Your room":`${ownerName}’s room`}</h1><Link to="/me" aria-label="Room customization"><GearIcon/></Link></header>
    <div className="room-switcher" aria-label="Choose room">{ownRoom?<Link className={own?"active":""} to={`/house/rooms/${ownRoom.id}`}>Yours</Link>:null}{siblingRoom?<Link className={!own?"active":""} to={`/house/rooms/${siblingRoom.id}`}>{roomOwnerName(siblingRoom.name,"Sibling")}’s</Link>:null}</div>
    <img className="bedroom-art" src={ourPlaceArt(surprise?"room-ducks":"room-clean")} alt={surprise?"A hamster discovering a playful room surprise":"A hamster relaxing in a tidy bedroom"}/>
    <section className="room-discovery"><span className="room-discovery-icon" aria-hidden="true">{surprise?<MagicWandIcon/>:<HeartIcon/>}</span><h2>{own?(surprise?"You had a visitor.":"Home, sweet home."):(surprise?"Your work here is done.":"A little mischief?")}</h2><p>{own?(surprise?`${visitorName} left something ridiculous behind.`:"A quiet little corner of your own."):(surprise?"The surprise will be waiting when they come back.":"Leave something for them to find when they get home.")}</p>
      {own?<>{other?<Link className="our-place-primary" to={`/house/rooms/${other.id}`}>Visit {roomOwnerName(other.name,"sibling").toLowerCase()}</Link>:null}{surprise?<button type="button" className="room-secondary-action" onClick={()=>setTidied(true)}>Tidy up</button>:null}</>:<><Link className="our-place-primary" to={`/house/rooms/${room.id}/raid`}>Leave some mischief</Link><Link className="room-secondary-action" to="/">Leave a note on our board</Link></>}
    </section>
  </div>;
}
