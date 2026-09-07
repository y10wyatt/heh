import type {ActionEvent} from "../domain/models/action-event";
import {isActionEvent} from "../domain/models/action-event";
import type {ActionEventRepository} from "../domain/repositories";

/** Browser-only demo persistence; authenticated evidence still uses Supabase. */
export class PersistentDemoActionEventRepository implements ActionEventRepository {
  constructor(private readonly seed:ActionEvent[]){}
  private readonly prefix="sibling-showdown:demo-events:v1:";

  async list(groupId:string){
    const events=new Map(this.seed.map(event=>[event.id,event]));
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key?.startsWith(this.prefix))continue;
      const event:unknown=JSON.parse(localStorage.getItem(key)!);
      if(!isActionEvent(event))throw new Error("Saved demo log could not be read");
      events.set(event.id,event);
    }
    return [...events.values()].filter(event=>event.challengeGroupId===groupId);
  }

  async append(event:ActionEvent){
    const key=this.prefix+event.id;
    if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(event));
  }
}
