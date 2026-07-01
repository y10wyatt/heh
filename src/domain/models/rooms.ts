export type Room={id:string;ownerId:string;challengeGroupId:string;name:string;theme:"cozy_cabin"|"workshop"|"sky_room"|"chaos";createdAt:string;updatedAt:string};
export type RoomSlot={id:string;roomId:string;slotKey:string;slotType:"wall"|"floor"|"furniture"|"decor"|"lighting"|"window"|"trap"|"note";currentItemId?:string;isProtected:boolean;updatedBy?:string;updatedAt?:string};
export type RoomItem={id:string;name:string;itemType:"paint"|"furniture"|"poster"|"sticker"|"lighting"|"trap"|"mess"|"note";rarity:"common"|"rare"|"weekly";effectType?:"visual"|"trap"|"temporary";metadata:Record<string,unknown>};
export type RoomActionResult="applied"|"blocked"|"reflected"|"trap_triggered"|"reverted";
export type RoomAction={id:string;actorId:string;targetRoomId:string;challengeGroupId:string;actionType:"decorate"|"prank"|"paint"|"set_trap"|"trigger_trap"|"defend"|"revert";slotId?:string;itemId?:string;entitlementId?:string;sourceEventId?:string;result:RoomActionResult;createdAt:string;expiresAt?:string;metadata:Record<string,unknown>};
export type TrapType="alarm_bell"|"glue_trap"|"decoy_object"|"mirror_trap"|"lock_trap";
export type RoomTrap={id:string;roomId:string;slotId:string;trapType:TrapType;status:"active"|"triggered"|"expired"|"disabled";createdBy:string;expiresAt?:string};
export type RoomActionEntitlement={id:string;challengeGroupId:string;userId:string;targetUserId:string;entitlementType:"mischief"|"defense";sourceDate:string;sourceEventId?:string;usedAt?:string;expiresAt?:string;createdAt:string};
