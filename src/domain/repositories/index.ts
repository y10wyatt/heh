import type {ActionEvent} from "../models/action-event";
import type {Challenge,DailyResult,PointRule} from "../models/core";
import type {Room,RoomAction,RoomActionEntitlement,RoomItem,RoomSlot} from "../models/rooms";
export interface ActionEventRepository{list(groupId:string):Promise<ActionEvent[]>;append(event:ActionEvent):Promise<void>}
export interface ChallengeRepository{list(groupId:string):Promise<Challenge[]>}
export interface PointRuleRepository{list(groupId:string):Promise<PointRule[]>}
export interface MembershipRepository{findGroupId(userId:string):Promise<string|null>}
export interface RoomRepository{list(groupId:string):Promise<Room[]>;slots(roomId:string):Promise<RoomSlot[]>;save(room:Room):Promise<void>}
export type ApplyRoomActionInput={entitlementId:string;targetRoomId:string;slotId:string;itemId?:string;actionType:RoomAction["actionType"]};
export interface RoomActionRepository{list(groupId:string):Promise<RoomAction[]>;apply(input:ApplyRoomActionInput):Promise<RoomAction>}
export interface RoomEntitlementRepository{list(userId:string):Promise<RoomActionEntitlement[]>}
export interface RoomItemRepository{list():Promise<RoomItem[]>}
export interface DailyResultRepository{finalize(groupId:string,now?:string):Promise<DailyResult>}
