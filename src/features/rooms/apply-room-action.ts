import type {RoomAction} from "../../domain/models/rooms";
import type {ApplyRoomActionInput,RoomActionRepository} from "../../domain/repositories";

export class ApplyRoomAction{
  constructor(private readonly repository:RoomActionRepository){}
  execute(input:ApplyRoomActionInput):Promise<RoomAction>{
    if(!input.entitlementId||!input.targetRoomId||!input.slotId)throw new Error("Entitlement, room, and slot are required");
    return this.repository.apply(input);
  }
}
