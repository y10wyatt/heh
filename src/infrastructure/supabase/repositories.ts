import type {ActionEventRepository,ApplyRoomActionInput,DailyResultRepository,MembershipRepository,PointRuleRepository,RoomActionRepository,RoomEntitlementRepository,RoomItemRepository,RoomRepository} from "../../domain/repositories";
import type {ActionEvent} from "../../domain/models/action-event";
import {mapActionEvent} from "../../domain/models/action-event";
import type {DailyResult,PointRule} from "../../domain/models/core";
import type {Room,RoomAction,RoomActionEntitlement,RoomItem,RoomSlot} from "../../domain/models/rooms";
import {supabase} from "./client";
const db=()=>{if(!supabase)throw new Error("Supabase environment variables are not configured");return supabase};
type RoomRow={id:string;owner_id:string;challenge_group_id:string;name:string;theme:Room["theme"];created_at:string;updated_at:string};
type RoomSlotRow={id:string;room_id:string;slot_key:string;slot_type:RoomSlot["slotType"];current_item_id?:string;is_protected:boolean;updated_by?:string;updated_at?:string};
type RoomActionRow={id:string;actor_id:string;target_room_id:string;challenge_group_id:string;action_type:RoomAction["actionType"];slot_id?:string;item_id?:string;entitlement_id?:string;source_event_id?:string;result:RoomAction["result"];created_at:string;expires_at?:string;metadata:Record<string,unknown>};
type EntitlementRow={id:string;challenge_group_id:string;user_id:string;target_user_id:string;entitlement_type:RoomActionEntitlement["entitlementType"];source_date:string;source_event_id?:string;used_at?:string;expires_at?:string;created_at:string};
type DailyResultRow={id:string;challenge_group_id:string;local_date:string;scores:Record<string,number|string>;applied_rules:Array<Record<string,unknown>>;tie:boolean;created_at:string};
type RoomItemRow={id:string;name:string;item_type:RoomItem["itemType"];rarity:RoomItem["rarity"];effect_type?:RoomItem["effectType"];metadata:Record<string,unknown>};
export const mapRoom=(row:RoomRow):Room=>({id:row.id,ownerId:row.owner_id,challengeGroupId:row.challenge_group_id,name:row.name,theme:row.theme,createdAt:row.created_at,updatedAt:row.updated_at});
export const mapRoomSlot=(row:RoomSlotRow):RoomSlot=>({id:row.id,roomId:row.room_id,slotKey:row.slot_key,slotType:row.slot_type,currentItemId:row.current_item_id,isProtected:row.is_protected,updatedBy:row.updated_by,updatedAt:row.updated_at});
export const mapRoomAction=(row:RoomActionRow):RoomAction=>({id:row.id,actorId:row.actor_id,targetRoomId:row.target_room_id,challengeGroupId:row.challenge_group_id,actionType:row.action_type,slotId:row.slot_id,itemId:row.item_id,entitlementId:row.entitlement_id,sourceEventId:row.source_event_id,result:row.result,createdAt:row.created_at,expiresAt:row.expires_at,metadata:row.metadata??{}});
export const mapEntitlement=(row:EntitlementRow):RoomActionEntitlement=>({id:row.id,challengeGroupId:row.challenge_group_id,userId:row.user_id,targetUserId:row.target_user_id,entitlementType:row.entitlement_type,sourceDate:row.source_date,sourceEventId:row.source_event_id,usedAt:row.used_at,expiresAt:row.expires_at,createdAt:row.created_at});
export const mapDailyResult=(row:DailyResultRow):DailyResult=>({id:row.id,challengeGroupId:row.challenge_group_id,localDate:row.local_date,scores:Object.fromEntries(Object.entries(row.scores).map(([key,value])=>[key,Number(value)])),appliedRules:row.applied_rules??[],tie:row.tie,createdAt:row.created_at});
export const mapRoomItem=(row:RoomItemRow):RoomItem=>({id:row.id,name:row.name,itemType:row.item_type,rarity:row.rarity,effectType:row.effect_type,metadata:row.metadata??{}});
export class SupabaseActionEventRepository implements ActionEventRepository{
 async list(groupId:string){const {data,error}=await db().from("action_events").select("*").eq("challenge_group_id",groupId).order("occurred_at",{ascending:false});if(error)throw error;return data.map(mapActionEvent)}
 async append(e:ActionEvent){const {error}=await db().from("action_events").insert({id:e.id,user_id:e.userId,challenge_group_id:e.challengeGroupId,source_app:e.sourceApp,category:e.category,action_type:e.actionType,title:e.title,value:e.value,unit:e.unit,occurred_at:e.occurredAt,created_at:e.createdAt,visibility:e.visibility,external_reference:e.externalReference,schema_version:e.schemaVersion,metadata:e.metadata});if(error&&error.code!=="23505")throw error}
}
type PointRuleRow={id:string;challenge_group_id:string;version:number;action_type:string;category?:string;points:number;active:boolean};
export class SupabasePointRuleRepository implements PointRuleRepository{
 async list(groupId:string){const {data,error}=await db().from("point_rules").select("id,challenge_group_id,version,action_type,category,points,active").eq("challenge_group_id",groupId).eq("active",true);if(error)throw error;return (data as PointRuleRow[]).map((row):PointRule=>({id:row.id,groupId:row.challenge_group_id,version:row.version,actionType:row.action_type,category:row.category,points:Number(row.points),active:row.active}))}
}
export class SupabaseMembershipRepository implements MembershipRepository{
 async findGroupId(userId:string){
  const {data,error}=await db().from("challenge_group_members").select("challenge_group_id").eq("user_id",userId).limit(1).maybeSingle();
  if(error)throw error;
  return data?.challenge_group_id??null;
 }
}
export class SupabaseRoomRepository implements RoomRepository{
 async list(groupId:string){const {data,error}=await db().from("rooms").select("id,owner_id,challenge_group_id,name,theme,created_at,updated_at").eq("challenge_group_id",groupId);if(error)throw error;return (data as RoomRow[]).map(mapRoom)}
 async slots(roomId:string){const {data,error}=await db().from("room_slots").select("id,room_id,slot_key,slot_type,current_item_id,is_protected,updated_by,updated_at").eq("room_id",roomId);if(error)throw error;return (data as RoomSlotRow[]).map(mapRoomSlot)}
 async save(){throw new Error("Room mutations must use apply_room_action RPC")}
}
export class SupabaseRoomActionRepository implements RoomActionRepository{
 async list(groupId:string){const {data,error}=await db().from("room_actions").select("id,actor_id,target_room_id,challenge_group_id,action_type,slot_id,item_id,entitlement_id,source_event_id,result,created_at,expires_at,metadata").eq("challenge_group_id",groupId);if(error)throw error;return (data as RoomActionRow[]).map(mapRoomAction)}
 async apply(input:ApplyRoomActionInput){const {data,error}=await db().rpc("apply_room_action",{p_entitlement_id:input.entitlementId,p_target_room_id:input.targetRoomId,p_slot_id:input.slotId,p_item_id:input.itemId??null,p_action_type:input.actionType} as never);if(error)throw error;return mapRoomAction(data as unknown as RoomActionRow)}
}
export class SupabaseRoomEntitlementRepository implements RoomEntitlementRepository{
 async list(userId:string){const {data,error}=await db().from("room_action_entitlements").select("id,challenge_group_id,user_id,target_user_id,entitlement_type,source_date,source_event_id,used_at,expires_at,created_at").eq("user_id",userId).is("used_at",null).order("created_at",{ascending:false});if(error)throw error;return (data as EntitlementRow[]).map(mapEntitlement)}
}
export class SupabaseRoomItemRepository implements RoomItemRepository{
 async list(){const {data,error}=await db().from("room_items").select("id,name,item_type,rarity,effect_type,metadata");if(error)throw error;return (data as RoomItemRow[]).map(mapRoomItem)}
}
export class SupabaseDailyResultRepository implements DailyResultRepository{
 async finalize(groupId:string,now?:string){const {data,error}=await db().rpc("finalize_day",{p_group_id:groupId,p_now:now??new Date().toISOString()} as never);if(error)throw error;return mapDailyResult(data as unknown as DailyResultRow)}
}
