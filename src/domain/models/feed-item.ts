import type {ActionEvent} from "./action-event";
import type {RoomAction} from "./rooms";
export type FeedItem={id:string;kind:"action_event"|"room_action";title:string;occurredAt:string;source:ActionEvent|RoomAction};
export const toFeedItem=(source:ActionEvent|RoomAction):FeedItem=>"actionType" in source && "targetRoomId" in source
 ? {id:source.id,kind:"room_action",title:String(source.metadata.summary??`Room action ${source.result}`),occurredAt:source.createdAt,source}
 : {id:source.id,kind:"action_event",title:(source as ActionEvent).title,occurredAt:(source as ActionEvent).occurredAt,source};
