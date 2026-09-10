import type {ActionEventRepository,ApplyRoomActionInput,DailyResultRepository,HouseholdActionRepository,LeaveHouseholdActionInput,MembershipRepository,PointRuleRepository,RoomActionRepository,RoomEntitlementRepository,RoomItemRepository,RoomRepository,HouseholdActionRecord} from "../../domain/repositories";
import type {ActionEvent} from "../../domain/models/action-event";
import {mapActionEvent} from "../../domain/models/action-event";
import type {DailyResult,PointRule} from "../../domain/models/core";
import type {Room,RoomAction,RoomActionEntitlement,RoomItem,RoomSlot} from "../../domain/models/rooms";
import type {CreateHouseholdInput,HouseholdOnboardingInput,HouseholdRepository,HouseholdState} from "../../domain/models/household";
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
 async list(groupId:string){const {data,error}=await db().from("personal_action_events").select("id,user_id,group_id,source_app,category,action_type,title,value,unit,occurred_at,created_at,visibility,external_reference,schema_version,metadata").eq("group_id",groupId).order("occurred_at",{ascending:false}).limit(200);if(error)throw error;return data.map(mapActionEvent)}
 async append(e:ActionEvent){const {error}=await db().rpc("our_place_log_personal_action",{p_id:e.id,p_group_id:e.challengeGroupId,p_source_app:e.sourceApp,p_category:e.category??null,p_action_type:e.actionType,p_title:e.title,p_value:e.value??null,p_unit:e.unit??null,p_occurred_at:e.occurredAt,p_visibility:e.visibility,p_external_reference:e.externalReference??null,p_schema_version:e.schemaVersion,p_metadata:e.metadata} as never);if(error&&error.code!=="23505")throw error}
}
type PointRuleRow={id:string;challenge_group_id:string;version:number;action_type:string;category?:string;points:number;active:boolean};
export class SupabasePointRuleRepository implements PointRuleRepository{
 async list(groupId:string){const {data,error}=await db().from("point_rules").select("id,challenge_group_id,version,action_type,category,points,active").eq("challenge_group_id",groupId).eq("active",true);if(error)throw error;return (data as PointRuleRow[]).map((row):PointRule=>({id:row.id,groupId:row.challenge_group_id,version:row.version,actionType:row.action_type,category:row.category,points:Number(row.points),active:row.active}))}
}
export class SupabaseMembershipRepository implements MembershipRepository{
 async findGroupId(userId:string){
  const {data,error}=await db().from("group_members").select("group_id").eq("user_id",userId).order("joined_at").limit(1).maybeSingle();
  if(error)throw error;
  return data?.group_id??null;
 }
}

type HouseholdStateRow={group_id:string;group_name:string;member_role:string;member_count:number;onboarding_completed:boolean};
export class SupabaseHouseholdRepository implements HouseholdRepository{
 async state():Promise<HouseholdState|null>{
  const {data,error}=await db().rpc("our_place_account_state");
  if(error)throw error;
  const row=(Array.isArray(data)?data[0]:data) as HouseholdStateRow|undefined;
  return row?{groupId:row.group_id,groupName:row.group_name,memberRole:row.member_role,memberCount:Number(row.member_count),onboardingCompleted:Boolean(row.onboarding_completed)}:null;
 }
 async create(input:CreateHouseholdInput){
  const {data,error}=await db().rpc("our_place_create_household",{
   p_name:input.householdName.trim(),p_display_name:input.displayName.trim(),p_avatar_id:input.avatarId,p_annoyance_level:input.annoyanceLevel,
  } as never);
  if(error)throw error;
  return String(data);
 }
 async join(inviteCode:string,input:HouseholdOnboardingInput){
  const {data,error}=await db().rpc("our_place_join_household",{
   p_code:inviteCode.trim().toUpperCase(),p_display_name:input.displayName.trim(),p_avatar_id:input.avatarId,p_annoyance_level:input.annoyanceLevel,
  } as never);
  if(error)throw error;
  return String(data);
 }
 async complete(groupId:string,input:HouseholdOnboardingInput){
  const {error}=await db().rpc("our_place_complete_onboarding",{
   p_group_id:groupId,p_display_name:input.displayName.trim(),p_avatar_id:input.avatarId,p_annoyance_level:input.annoyanceLevel,
   p_door_color:input.doorColor??"honey",p_door_sign:input.doorSign?.trim()||null,
  } as never);
  if(error)throw error;
 }
}

type HouseholdRoomRow={id:string;owner_id:string;group_id:string;name:string;room_style:string;created_at:string;updated_at:string};
const householdTheme=(style:string):Room["theme"]=>style==="workshop"?"workshop":style==="sky_room"?"sky_room":style==="chaos"?"chaos":"cozy_cabin";
export class SupabaseHouseholdRoomRepository implements RoomRepository{
 async list(groupId:string){
  const {data,error}=await db().from("household_rooms").select("id,owner_id,group_id,name,room_style,created_at,updated_at").eq("group_id",groupId);
  if(error)throw error;
  return (data as HouseholdRoomRow[]).map(row=>({id:row.id,ownerId:row.owner_id,challengeGroupId:row.group_id,name:row.name,theme:householdTheme(row.room_style),createdAt:row.created_at,updatedAt:row.updated_at}));
 }
 async slots(){return []}
 async save(){throw new Error("Room mutations must use the household room RPC")}
}

type HouseholdActionRow={id:string;group_id:string;actor_id:string;target_user_id:string;action_type:HouseholdActionRecord["actionType"];message?:string;payload:Record<string,unknown>;state:HouseholdActionRecord["state"];created_at:string};
const mapHouseholdAction=(row:HouseholdActionRow):HouseholdActionRecord=>({id:row.id,groupId:row.group_id,actorId:row.actor_id,targetUserId:row.target_user_id,actionType:row.action_type,message:row.message,payload:row.payload??{},state:row.state,createdAt:row.created_at});
export class SupabaseHouseholdActionRepository implements RoomActionRepository,HouseholdActionRepository{
 async listRecords(groupId:string){const {data,error}=await db().from("household_actions").select("id,group_id,actor_id,target_user_id,action_type,message,payload,state,created_at").eq("group_id",groupId).order("created_at",{ascending:false}).limit(100);if(error)throw error;return (data as HouseholdActionRow[]).map(mapHouseholdAction)}
 async leave(input:LeaveHouseholdActionInput){const {data,error}=await db().rpc("our_place_leave_action",{p_id:input.id,p_group_id:input.groupId,p_target_user_id:input.targetUserId,p_action_type:input.actionType,p_message:input.message??null,p_payload:input.payload??{}} as never);if(error)throw error;return mapHouseholdAction(data as unknown as HouseholdActionRow)}
 async setState(id:string,state:Exclude<HouseholdActionRecord["state"],"placed">){const {data,error}=await db().rpc("our_place_set_action_state",{p_id:id,p_state:state} as never);if(error)throw error;return mapHouseholdAction(data as unknown as HouseholdActionRow)}
 async list(groupId:string){
  const [{data:actions,error:actionError},{data:rooms,error:roomError}]=await Promise.all([
    db().from("household_actions").select("id,group_id,actor_id,target_user_id,action_type,message,payload,state,created_at").eq("group_id",groupId).order("created_at",{ascending:false}).limit(100),
   db().from("household_rooms").select("id,owner_id").eq("group_id",groupId),
  ]);
  if(actionError)throw actionError;if(roomError)throw roomError;
  const roomByOwner=new Map((rooms as Array<{id:string;owner_id:string}>).map(room=>[room.owner_id,room.id]));
  return (actions as HouseholdActionRow[]).flatMap(row=>{const targetRoomId=roomByOwner.get(row.target_user_id);if(!targetRoomId)return [];return [{id:row.id,actorId:row.actor_id,targetRoomId,challengeGroupId:row.group_id,actionType:"prank" as const,result:row.state==="tidied"?"reverted" as const:"applied" as const,createdAt:row.created_at,metadata:{...row.payload,message:row.message,state:row.state}}]});
 }
 async apply(_input:ApplyRoomActionInput):Promise<RoomAction>{throw new Error("Room action UI is moving to household actions")}
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
