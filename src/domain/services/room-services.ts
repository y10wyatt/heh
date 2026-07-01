import type {Room,RoomAction,RoomActionEntitlement,RoomSlot,RoomTrap,TrapType} from "../models/rooms";
export class RoomPermissionService {
 canEdit(userId:string,room:Room){return userId===room.ownerId}
 entitlementValid(e:RoomActionEntitlement,now=new Date()){return !e.usedAt&&(!e.expiresAt||new Date(e.expiresAt)>now)}
 canRaid(userId:string,room:Room,e?:RoomActionEntitlement){return !!e&&userId!==room.ownerId&&e.userId===userId&&e.targetUserId===room.ownerId&&e.entitlementType==="mischief"&&this.entitlementValid(e)}
 protected(slot:RoomSlot){return slot.isProtected}
 trapOutcome(trap?:RoomTrap):"none"|"blocked"|"redirected"|"reflected"|"revealed"{if(!trap||trap.status!=="active")return"none";const outcomes:Record<TrapType,"blocked"|"redirected"|"reflected"|"revealed">={alarm_bell:"revealed",glue_trap:"blocked",decoy_object:"redirected",mirror_trap:"reflected",lock_trap:"blocked"};return outcomes[trap.trapType]}
}
export class RoomActionService {
 resolve(slot:RoomSlot,trap?:RoomTrap):RoomAction["result"]{if(slot.isProtected)return"blocked";const o=new RoomPermissionService().trapOutcome(trap);if(o==="blocked")return"trap_triggered";if(o==="reflected")return"reflected";return o==="redirected"||o==="revealed"?"trap_triggered":"applied"}
 isTemporary(action:RoomAction){return !!action.expiresAt||action.metadata.temporary===true}
 valid(action:RoomAction){return !!action.id&&!!action.actorId&&!!action.targetRoomId}
}
export type DailyReward={userId:string;targetUserId:string;type:"mischief"|"defense";sourceDate:string;key:string};
export class RoomRewardService {
 winner(totals:Record<string,number>,minimum=1){const entries=Object.entries(totals);if(entries.length<2||entries.some(([,v])=>Math.abs(v)<minimum))return{kind:"insufficient" as const};const max=Math.max(...entries.map(([,v])=>v));const winners=entries.filter(([,v])=>v===max);return winners.length===1?{kind:"winner" as const,userId:winners[0][0]}:{kind:"tie" as const}}
 rewards(totals:Record<string,number>,date:string,existingKeys=new Set<string>()):DailyReward[]{const users=Object.keys(totals);const result=this.winner(totals);let raw:DailyReward[]=[];if(result.kind==="winner"){const loser=users.find(u=>u!==result.userId)!;raw=[this.reward(result.userId,loser,"mischief",date),this.reward(loser,result.userId,"defense",date)]}else if(result.kind==="tie"){raw=users.map((u,i)=>this.reward(u,users[(i+1)%users.length],"defense",date))}return raw.filter(r=>!existingKeys.has(r.key))}
 private reward(userId:string,targetUserId:string,type:"mischief"|"defense",sourceDate:string){return{userId,targetUserId,type,sourceDate,key:`${userId}:${sourceDate}:${type}`}}
}
