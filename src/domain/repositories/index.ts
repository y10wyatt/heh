import type {ActionEvent} from "../models/action-event";
import type {Challenge,DailyResult,PointRule} from "../models/core";
import type {Room,RoomAction,RoomActionEntitlement,RoomItem,RoomSlot} from "../models/rooms";
export type {HouseholdRepository} from "../models/household";
export interface ActionEventRepository{list(groupId:string):Promise<ActionEvent[]>;append(event:ActionEvent):Promise<void>}
export type HouseholdActionRecord={id:string;groupId:string;actorId:string;targetUserId:string;actionType:"poke"|"note"|"pillow"|"gift"|"silly_object";message?:string;payload:Record<string,unknown>;state:"placed"|"discovered"|"reacted"|"tidied"|"kept";createdAt:string};
export type LeaveHouseholdActionInput={id:string;groupId:string;targetUserId:string;actionType:HouseholdActionRecord["actionType"];message?:string;payload?:Record<string,unknown>};
export interface HouseholdActionRepository{listRecords(groupId:string):Promise<HouseholdActionRecord[]>;leave(input:LeaveHouseholdActionInput):Promise<HouseholdActionRecord>;setState(id:string,state:Exclude<HouseholdActionRecord["state"],"placed">):Promise<HouseholdActionRecord>}
export interface ChallengeRepository{list(groupId:string):Promise<Challenge[]>}
export interface PointRuleRepository{list(groupId:string):Promise<PointRule[]>}
export interface MembershipRepository{findGroupId(userId:string):Promise<string|null>}
export interface RoomRepository{list(groupId:string):Promise<Room[]>;slots(roomId:string):Promise<RoomSlot[]>;save(room:Room):Promise<void>}
export type ApplyRoomActionInput={entitlementId:string;targetRoomId:string;slotId:string;itemId?:string;actionType:RoomAction["actionType"]};
export interface RoomActionRepository{list(groupId:string):Promise<RoomAction[]>;apply(input:ApplyRoomActionInput):Promise<RoomAction>}
export interface RoomEntitlementRepository{list(userId:string):Promise<RoomActionEntitlement[]>}
export interface RoomItemRepository{list():Promise<RoomItem[]>}
export interface DailyResultRepository{finalize(groupId:string,now?:string):Promise<DailyResult>}
