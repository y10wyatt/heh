import {describe,expect,it} from "vitest";
import {mapRoom,mapRoomAction,mapRoomSlot} from "./repositories";
describe("Supabase room mappers",()=>{
  it("maps room snake_case rows",()=>expect(mapRoom({id:"r",owner_id:"u",challenge_group_id:"g",name:"Room",theme:"workshop",created_at:"c",updated_at:"u"})).toMatchObject({ownerId:"u",challengeGroupId:"g"}));
  it("maps slots and actions",()=>{
    expect(mapRoomSlot({id:"s",room_id:"r",slot_key:"wall",slot_type:"wall",is_protected:true})).toMatchObject({roomId:"r",slotKey:"wall",isProtected:true});
    expect(mapRoomAction({id:"a",actor_id:"u",target_room_id:"r",challenge_group_id:"g",action_type:"prank",result:"applied",created_at:"c",metadata:{}})).toMatchObject({actorId:"u",targetRoomId:"r"});
  });
});
