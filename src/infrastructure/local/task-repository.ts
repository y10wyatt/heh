import {isActionEvent} from "../../domain/models/action-event";
import {inferTaskCategory,isTaskCategory,type Task,type TaskRepository} from "../../domain/models/task";

export class LocalTaskRepository implements TaskRepository {
  private readonly prefix:string;

  constructor(
    private readonly storage:Storage,
    private readonly scope:{userId:string;groupId:string;mode:"demo"|"connected"},
  ){
    this.prefix=`sibling-showdown:tasks:v1:${scope.mode}:${scope.userId}:${scope.groupId}:`;
  }

  list(){
    const tasks:Task[]=[];
    for(let i=0;i<this.storage.length;i++){
      const key=this.storage.key(i);
      if(key?.startsWith(this.prefix)){
        const task=this.get(key.slice(this.prefix.length));
        if(task)tasks.push(task);
      }
    }
    return tasks.sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
  }

  get(id:string):Task|undefined{
    const raw=this.storage.getItem(this.prefix+id);
    if(raw===null)return;
    const saved:Task=JSON.parse(raw);
    const task={...saved,category:isTaskCategory(saved?.category)?saved.category:inferTaskCategory(saved?.title??"")};
    if(!task||task.id!==id||task.userId!==this.scope.userId||task.groupId!==this.scope.groupId||
      typeof task.title!=="string"||!task.title.trim()||!isTaskCategory(task.category)||typeof task.starred!=="boolean"||
      !Number.isFinite(Date.parse(task.createdAt))||
      (task.completedAt!==undefined&&!Number.isFinite(Date.parse(task.completedAt)))||
      (task.completion!==undefined&&(!isActionEvent(task.completion)||(task.completion.id!==task.id&&task.completion.externalReference?.id!==task.id)||
        task.completion.userId!==task.userId||task.completion.challengeGroupId!==task.groupId||
        task.completion.actionType!=="action_completed"))||
      (task.completedAt!==undefined&&!task.completion)){
      throw new Error("Saved task could not be read. Your saved data has been kept.");
    }
    return task;
  }

  save(task:Task){
    if(task.userId!==this.scope.userId||task.groupId!==this.scope.groupId)throw new Error("Task belongs to another account or group");
    this.storage.setItem(this.prefix+task.id,JSON.stringify(task));
  }
}
