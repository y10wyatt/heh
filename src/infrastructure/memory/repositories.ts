import type {ActionEventRepository,RoomRepository} from "../../domain/repositories";
import type {ActionEvent} from "../../domain/models/action-event";
import type {Room,RoomSlot} from "../../domain/models/rooms";
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
