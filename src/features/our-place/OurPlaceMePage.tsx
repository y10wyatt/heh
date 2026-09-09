import {ActivityLogIcon,BackpackIcon,BarChartIcon,PersonIcon,RocketIcon} from "@radix-ui/react-icons";
import {Link} from "react-router-dom";
import {useAppData} from "../../app/AppDataProvider";
import {useGameData} from "../../app/GameDataProvider";
import {ScoringService} from "../../domain/services/scoring-service";
import {useAuth} from "../auth/AuthProvider";
import {useTasks} from "../capture/use-tasks";
import {LinkCard,OurPlaceHeader} from "./OurPlaceComponents";

export function OurPlaceMePage(){
  const {events,rules,currentUserId}=useAppData();
  const {rooms,entitlements}=useGameData();
  const {configured,user,signOut}=useAuth();
  const taskList=useTasks();
  const points=new ScoringService().totals(events,rules)[currentUserId]??0;
  const ownRoom=rooms.find(room=>room.ownerId===currentUserId);
  const available=entitlements.filter(item=>item.userId===currentUserId&&!item.usedAt).length;
  const name=user?.user_metadata?.display_name||user?.email?.split("@")[0]||"William";

  return <div className="our-place-page me-page"><OurPlaceHeader title={`Hi, ${name}`} subtitle="Your little corner of our place."/>
    <section className="me-summary"><div><strong>{points}</strong><span>shared points</span></div><div><strong>{taskList.tasks.filter(task=>task.completedAt).length}</strong><span>side quests done</span></div><div><strong>{available}</strong><span>room actions</span></div></section>
    <h2 className="me-section-title">Think, plan, personalize</h2>
    <div className="me-links">
      <LinkCard icon={<RocketIcon/>} title="My plans" body="Shape personal goals here, then act on the next small step in Today." action={<Link to="/today">Open side quests</Link>}/>
      <LinkCard icon={<PersonIcon/>} title="My look" body="Avatar, door, and room customization will all share one identity." action={<Link to={ownRoom?`/house/rooms/${ownRoom.id}`:"/house"}>Visit my room</Link>}/>
      <LinkCard icon={<BackpackIcon/>} title="My collection" body="Earned clothes, furniture, prank items, and future pet items live together." action={<Link to="/rewards">See rewards</Link>}/>
      <LinkCard icon={<BarChartIcon/>} title="My rhythm" body="Weekly progress and optional personal tracking belong in this planning space." action={<Link to="/results">See weekly results</Link>}/>
      <LinkCard icon={<ActivityLogIcon/>} title="House activity" body="See the shared record of goals, challenges, and room changes." action={<Link to="/feed">Open shared feed</Link>}/>
    </div>
    <section className="quest-preview"><span>Next planned quest</span><h2>Go boxing 20 times</h2><p>Complete boxing actions to unlock gloves that can evolve as you keep showing up.</p></section>
    {configured?<button type="button" className="me-sign-out" onClick={()=>void signOut()}>Sign out</button>:<p className="demo-note">Demo mode · connect the staging Supabase account for two-device testing.</p>}
  </div>;
}
