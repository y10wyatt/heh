import type {ActionEvent} from "../domain/models/action-event";
import type {PointRule} from "../domain/models/core";
import type {Room,RoomSlot} from "../domain/models/rooms";
export const users={william:"00000000-0000-4000-8000-000000000001",sister:"00000000-0000-4000-8000-000000000002"};
export const groupId="00000000-0000-4000-8000-000000000010";
const now=new Date().toISOString();
export const rules:PointRule[]=[
 {id:"r1",groupId,version:1,actionType:"action_completed",points:2,active:true},
 {id:"r2",groupId,version:1,actionType:"action_missed",points:-1,active:true},
 {id:"r3",groupId,version:1,actionType:"challenge_completed",points:3,active:true}
];
export const events:ActionEvent[]=[
 {id:crypto.randomUUID(),userId:users.william,challengeGroupId:groupId,sourceApp:"sibling_showdown",category:"workout",actionType:"action_completed",title:"William completed Morning workout",occurredAt:now,createdAt:now,visibility:"challenge_group",schemaVersion:1,metadata:{}},
 {id:crypto.randomUUID(),userId:users.sister,challengeGroupId:groupId,sourceApp:"sibling_showdown",actionType:"challenge_created",title:"Sister issued No snacks after 8pm",occurredAt:now,createdAt:now,visibility:"challenge_group",schemaVersion:1,metadata:{}}
];
export const rooms:Room[]=[
 {id:"room-w",ownerId:users.william,challengeGroupId:groupId,name:"William’s Workshop",theme:"workshop",createdAt:now,updatedAt:now},
 {id:"room-s",ownerId:users.sister,challengeGroupId:groupId,name:"Sister’s Sky Room",theme:"sky_room",createdAt:now,updatedAt:now}
];
export const slots:RoomSlot[]=["wall","floor","desk","bed","shelf","window","poster","lighting","trap-1","trap-2","note"].map((slotKey,i)=>({id:`slot-${i}`,roomId:"room-s",slotKey,slotType:slotKey.startsWith("trap")?"trap":slotKey==="lighting"?"lighting":slotKey==="note"?"note":"decor",isProtected:i===0||i===3}));
