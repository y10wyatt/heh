import {Button,Card,PageHeader,StatusChip} from "../../components/ui";
import {VisualAsset} from "../../components/VisualAsset";
import {uiContent} from "../../config/ui-content";
import {users} from "../../dev/seed";
import {useAppData} from "../../app/AppDataProvider";
const names:Record<string,string>={[users.william]:"William",[users.sister]:"Sister"};

export function FeedPage(){
  const copy=uiContent.feed;
  const {events}=useAppData();
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/><div className="split"><Button>{copy.sendLabel}</Button><Button className="secondary">{copy.filterLabel}</Button></div>
    {events.map(event=><Card key={event.id} className="feed"><div className="avatar"><VisualAsset asset={event.userId===users.william?"williamAvatar":"sisterAvatar"}/></div><div><small>From {names[event.userId]}</small><h2>{event.title.replace(`${names[event.userId]} `,"")}</h2></div><StatusChip tone={event.actionType==="challenge_created"?"orange":"green"}>{event.actionType==="challenge_created"?"Active":"Completed"}</StatusChip></Card>)}
    <Card className="feed"><div className="avatar"><VisualAsset asset="roomActivity"/></div><div><small>{copy.roomLabel}</small><h2>{copy.roomTitle}</h2></div><StatusChip tone="blue">Room</StatusChip></Card></>;
}
