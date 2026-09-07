import type {ActionEvent,ActionEventType} from "../../domain/models/action-event";
import type {ActionEventRepository} from "../../domain/repositories";

export type LogActionInput={
  actionType:Extract<ActionEventType,"action_completed"|"action_missed">;
  category:string;
  title:string;
  note?:string;
};

export class LogAction{
  constructor(
    private readonly repository:ActionEventRepository,
    private readonly actor:{userId:string;challengeGroupId:string},
    private readonly now:()=>Date=()=>new Date(),
    private readonly createId:()=>string=()=>crypto.randomUUID(),
  ){}

  prepare(input:LogActionInput,id=this.createId()):ActionEvent{
    if(!input.title.trim()||!input.category.trim())throw new Error("Title and category are required");
    const timestamp=this.now().toISOString();
    return {
      id,
      userId:this.actor.userId,
      challengeGroupId:this.actor.challengeGroupId,
      sourceApp:"sibling_showdown",
      category:input.category.toLowerCase(),
      actionType:input.actionType,
      title:input.title.trim(),
      occurredAt:timestamp,
      createdAt:timestamp,
      visibility:"challenge_group",
      schemaVersion:1,
      metadata:input.note?{note:input.note}:{},
    };
  }

  async commit(event:ActionEvent):Promise<ActionEvent>{
    if(event.userId!==this.actor.userId||event.challengeGroupId!==this.actor.challengeGroupId){
      throw new Error("This log belongs to a different account or group");
    }
    await this.repository.append(event);
    return event;
  }

  async execute(input:LogActionInput):Promise<ActionEvent>{
    return this.commit(this.prepare(input));
  }
}
