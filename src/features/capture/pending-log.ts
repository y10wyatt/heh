import {isActionEvent,type ActionEvent} from "../../domain/models/action-event";
import type {LogAction,LogActionInput} from "./log-action";

/** One explicit, retryable Quick Log draft; this is not an offline sync queue. */
export class PendingLog {
  private inFlight?:Promise<ActionEvent>;
  private readonly key:string;
  constructor(
    private readonly storage:Storage,
    private readonly actor:{userId:string;groupId:string;mode:"demo"|"connected"},
    private readonly log:Pick<LogAction,"prepare"|"commit">,
  ){
    this.key=`sibling-showdown:pending-log:v1:${actor.mode}:${actor.userId}:${actor.groupId}`;
  }

  read():ActionEvent|undefined{
    const raw=this.storage.getItem(this.key);
    if(raw===null)return;
    const event:unknown=JSON.parse(raw);
    if(!isActionEvent(event)||event.userId!==this.actor.userId||event.challengeGroupId!==this.actor.groupId||
      (event.actionType!=="action_completed"&&event.actionType!=="action_missed")||
      event.sourceApp!=="sibling_showdown"||typeof event.category!=="string"||
      !Number.isFinite(Date.parse(event.occurredAt))||!event.metadata||typeof event.metadata!=="object"){
      throw new Error("Saved log could not be read. Your draft has been kept.");
    }
    return event;
  }

  save(input:LogActionInput){
    if(this.inFlight)return this.inFlight;
    this.inFlight=this.record(input).finally(()=>{this.inFlight=undefined});
    return this.inFlight;
  }

  private async record(input:LogActionInput){
    const event=this.read()??this.log.prepare(input);
    this.storage.setItem(this.key,JSON.stringify(event));
    const saved=await this.log.commit(event);
    this.storage.removeItem(this.key);
    return saved;
  }
}
