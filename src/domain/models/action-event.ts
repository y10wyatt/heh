export type ActionEventType =
  | "action_completed" | "action_missed" | "challenge_created"
  | "challenge_accepted" | "challenge_completed" | "challenge_disputed";
export type ActionEvent = {
  id:string; userId:string; challengeGroupId?:string;
  sourceApp:"sibling_showdown"|"life_dashboard"; category?:string;
  actionType:ActionEventType; title:string; value?:number; unit?:string;
  occurredAt:string; createdAt:string; visibility:"private"|"challenge_group";
  externalReference?:{type:string;id:string}; schemaVersion:1;
  metadata:Record<string,unknown>;
};
export function mapActionEvent(row:Record<string,unknown>):ActionEvent {
  return {id:String(row.id),userId:String(row.user_id),challengeGroupId:row.challenge_group_id as string|undefined,
    sourceApp:row.source_app as ActionEvent["sourceApp"],category:row.category as string|undefined,
    actionType:row.action_type as ActionEventType,title:String(row.title),value:row.value as number|undefined,
    unit:row.unit as string|undefined,occurredAt:String(row.occurred_at),createdAt:String(row.created_at),
    visibility:row.visibility as ActionEvent["visibility"],externalReference:row.external_reference as ActionEvent["externalReference"],
    schemaVersion:1,metadata:(row.metadata??{}) as Record<string,unknown>};
}
export function isActionEvent(value:unknown):value is ActionEvent {
  const v=value as Partial<ActionEvent>; return !!v && typeof v.id==="string" && typeof v.userId==="string" &&
    v.schemaVersion===1 && typeof v.title==="string" && typeof v.occurredAt==="string";
}
