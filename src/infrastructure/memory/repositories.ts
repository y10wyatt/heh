import type {ActionEventRepository,ApplyRoomActionInput,DailyResultRepository,RoomActionRepository,RoomEntitlementRepository,RoomItemRepository,RoomRepository} from "../../domain/repositories";
import type {ActionEvent} from "../../domain/models/action-event";
import type {DailyResult} from "../../domain/models/core";
import type {Room,RoomAction,RoomActionEntitlement,RoomItem,RoomSlot} from "../../domain/models/rooms";
export class InMemoryActionEventRepository implements ActionEventRepository {
 constructor(private events:ActionEvent[]=[]){}
 async list(groupId:string){return this.events.filter(e=>e.challengeGroupId===groupId)}
 async append(event:ActionEvent){if(!this.events.some(e=>e.id===event.id))this.events.push(event)}
}
export class InMemoryRoomRepository implements RoomRepository {
 constructor(private rooms:Room[]=[],private roomSlots:RoomSlot[]=[]){}
 async list(groupId:string){return this.rooms.filter(r=>r.challengeGroupId===groupId)}
 async slots(roomId:string){return this.roomSlots.filter(s=>s.roomId===roomId)}
 async save(room:Room){const i=this.rooms.findIndex(r=>r.id===room.id);i<0?this.rooms.push(room):this.rooms.splice(i,1,room)}
}
export class InMemoryRoomActionRepository implements RoomActionRepository{
 constructor(private readonly actorId:string,private readonly groupId:string,private actions:RoomAction[]=[]){}
 async list(groupId:string){return this.actions.filter(action=>action.challengeGroupId===groupId)}
 async apply(input:ApplyRoomActionInput){
  const action:RoomAction={id:crypto.randomUUID(),actorId:this.actorId,targetRoomId:input.targetRoomId,challengeGroupId:this.groupId,actionType:input.actionType,slotId:input.slotId,itemId:input.itemId,entitlementId:input.entitlementId,result:"applied",createdAt:new Date().toISOString(),metadata:{summary:"A harmless room prank landed."}};
  this.actions.push(action);
  return action;
 }
}
export class InMemoryRoomEntitlementRepository implements RoomEntitlementRepository{
 constructor(private entitlements:RoomActionEntitlement[]=[]){}
 async list(userId:string){return this.entitlements.filter(item=>item.userId===userId&&!item.usedAt)}
 consume(id:string){const item=this.entitlements.find(entry=>entry.id===id);if(item)item.usedAt=new Date().toISOString()}
}
export class InMemoryRoomItemRepository implements RoomItemRepository{
 constructor(private readonly items:RoomItem[]=[]){}
 async list(){return this.items}
}
export class InMemoryDailyResultRepository implements DailyResultRepository{
 private result?:DailyResult;
 async finalize(groupId:string,now=new Date().toISOString()){
  this.result??={id:crypto.randomUUID(),challengeGroupId:groupId,localDate:now.slice(0,10),scores:{},appliedRules:[],tie:false,createdAt:new Date().toISOString()};
  return this.result;
 }
}
