import type {ActionEvent} from "../models/action-event";
import type {Challenge,PointRule} from "../models/core";
import type {Room,RoomAction,RoomActionEntitlement,RoomSlot} from "../models/rooms";
export interface ActionEventRepository{list(groupId:string):Promise<ActionEvent[]>;append(event:ActionEvent):Promise<void>}
export interface ChallengeRepository{list(groupId:string):Promise<Challenge[]>}
export interface PointRuleRepository{list(groupId:string):Promise<PointRule[]>}
export interface RoomRepository{list(groupId:string):Promise<Room[]>;slots(roomId:string):Promise<RoomSlot[]>;save(room:Room):Promise<void>}
export interface RoomActionRepository{list(groupId:string):Promise<RoomAction[]>;apply(input:unknown):Promise<RoomAction>}
export interface RoomEntitlementRepository{list(userId:string):Promise<RoomActionEntitlement[]>}
