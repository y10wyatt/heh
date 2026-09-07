import {Button,Card,PageHeader,StatusChip} from "../../components/ui";
import {VisualAsset} from "../../components/VisualAsset";
import {uiContent} from "../../config/ui-content";
import {useAppData} from "../../app/AppDataProvider";
import {useGameData} from "../../app/GameDataProvider";
import {toFeedItem} from "../../domain/models/feed-item";

export function FeedPage(){
  const copy=uiContent.feed;
  const {events,currentUserId,loading,error}=useAppData();
  const {roomActions}=useGameData();
  const feedItems=[...events,...roomActions].map(toFeedItem).sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt));
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/><div className="split"><Button>{copy.sendLabel}</Button><Button className="secondary">{copy.filterLabel}</Button></div>
    {error?<p role="alert" className="error">{error}</p>:null}
    {loading?<p role="status">Loading feed…</p>:feedItems.map(item=>{if(item.kind==="room_action")return <Card key={`room-${item.id}`} className="feed"><div className="avatar"><VisualAsset asset="roomActivity"/></div><div><small>{copy.roomLabel}</small><h2>{item.title}</h2></div><StatusChip tone="blue">Room</StatusChip></Card>;const event=item.source;const own="userId" in event&&event.userId===currentUserId;return <Card key={item.id} className="feed"><div className="avatar"><VisualAsset asset={own?"williamAvatar":"sisterAvatar"}/></div><div><small>From {own?"You":"Sibling"}</small><h2>{item.title}</h2></div><StatusChip tone={"actionType" in event&&event.actionType==="challenge_created"?"orange":"green"}>{"actionType" in event&&event.actionType==="challenge_created"?"Active":"Completed"}</StatusChip></Card>})}</>;
}
