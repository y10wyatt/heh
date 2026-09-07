import type {Task,TaskRepository} from "../../domain/models/task";
import type {LogAction} from "./log-action";

export class TaskService {
  private readonly pending=new Map<string,Promise<Task>>();

  constructor(
    private readonly tasks:TaskRepository,
    private readonly log:Pick<LogAction,"prepare"|"commit">,
    private readonly actor:{userId:string;groupId:string},
    private readonly now:()=>Date=()=>new Date(),
    private readonly createId:()=>string=()=>crypto.randomUUID(),
  ){}

  list(){return this.tasks.list()}

  add(title:string){
    const trimmed=title.trim();
    if(!trimmed||trimmed.length>120)throw new Error("Use a task title between 1 and 120 characters");
    const task:Task={id:this.createId(),...this.actor,title:trimmed,starred:false,createdAt:this.now().toISOString()};
    this.tasks.save(task);
    return task;
  }

  star(id:string){
    const task=this.requireTask(id);
    this.tasks.save({...task,starred:!task.starred});
  }

  complete(id:string):Promise<Task>{
    const pending=this.pending.get(id);
    if(pending)return pending;
    const operation=this.recordCompletion(id).finally(()=>this.pending.delete(id));
    this.pending.set(id,operation);
    return operation;
  }

  private async recordCompletion(id:string){
    let task=this.requireTask(id);
    if(task.completedAt)return task;
    if(!task.completion){
      task={...task,completion:{
        // The task UUID identifies its one completion, including retries from another tab.
        ...this.log.prepare({actionType:"action_completed",category:"task",title:`Completed ${task.title}`},task.id),
        externalReference:{type:"sibling_showdown_task",id:task.id},
      }};
      // Save the evidence before sending; an uncertain response must reuse this payload.
      this.tasks.save(task);
    }
    const event=await this.log.commit(task.completion!);
    const completed={...this.requireTask(id),completedAt:event.occurredAt};
    this.tasks.save(completed);
    return completed;
  }

  private requireTask(id:string){
    const task=this.tasks.get(id);
    if(!task||task.userId!==this.actor.userId||task.groupId!==this.actor.groupId)throw new Error("Task is unavailable for this account");
    return task;
  }
}
