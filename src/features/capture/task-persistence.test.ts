import {describe,expect,it,vi} from "vitest";
import type {ActionEventRepository} from "../../domain/repositories";
import {ScoringService} from "../../domain/services/scoring-service";
import {LocalTaskRepository} from "../../infrastructure/local/task-repository";
import {InMemoryActionEventRepository} from "../../infrastructure/memory/repositories";
import {LogAction} from "./log-action";
import {PendingLog} from "./pending-log";
import {TaskService} from "./task-service";

class TestStorage implements Storage {
  private values=new Map<string,string>();
  get length(){return this.values.size}
  key(index:number){return [...this.values.keys()][index]??null}
  getItem(key:string){return this.values.get(key)??null}
  setItem(key:string,value:string){this.values.set(key,value)}
  removeItem(key:string){this.values.delete(key)}
  clear(){this.values.clear()}
}

const actor={userId:"user-1",groupId:"group-1",mode:"demo" as const};
const now=()=>new Date("2026-09-03T12:00:00.000Z");
function setup(storage=new TestStorage(),events:ActionEventRepository=new InMemoryActionEventRepository()){
  const tasks=new LocalTaskRepository(storage,actor);
  const log=new LogAction(events,{userId:actor.userId,challengeGroupId:actor.groupId},now);
  return {storage,events,tasks,log,service:new TaskService(tasks,log,actor,now)};
}

describe("persistent task capture",()=>{
  it("restores task drafts and stars, isolated by account, group and mode",()=>{
    const {storage,service}=setup();
    const task=service.add("  Read a chapter  ");
    service.star(task.id);
    expect(setup(storage).service.list()).toMatchObject([{id:task.id,title:"Read a chapter",starred:true}]);
    expect(new LocalTaskRepository(storage,{...actor,userId:"other"}).list()).toEqual([]);
    expect(new LocalTaskRepository(storage,{...actor,groupId:"other"}).list()).toEqual([]);
    expect(new LocalTaskRepository(storage,{...actor,mode:"connected"}).list()).toEqual([]);
  });

  it("coalesces rapid clicks and never logs a completed task twice",async()=>{
    const {service,events}=setup();
    const task=service.add("Walk outside");
    const first=service.complete(task.id);
    expect(service.complete(task.id)).toBe(first);
    await first;
    await service.complete(task.id);
    const evidence=await events.list(actor.groupId);
    expect(evidence).toHaveLength(1);
    expect(evidence[0]).toMatchObject({id:task.id,externalReference:{type:"sibling_showdown_task",id:task.id}});
    expect(new ScoringService().totals(evidence,[{id:"rule",groupId:actor.groupId,version:1,actionType:"action_completed",points:3,active:true}])).toEqual({"user-1":3});
  });

  it("reuses exact evidence after a committed write loses its response and the page reloads",async()=>{
    const stored=new InMemoryActionEventRepository();
    const ambiguous:ActionEventRepository={list:id=>stored.list(id),append:async event=>{await stored.append(event);throw new Error("Response lost")}};
    const {service,storage}=setup(new TestStorage(),ambiguous);
    const task=service.add("Practice guitar");
    await expect(service.complete(task.id)).rejects.toThrow("Response lost");
    const pending=service.list()[0];
    expect(pending.completedAt).toBeUndefined();
    const append=vi.fn((event)=>stored.append(event));
    const reloaded=setup(storage,{list:id=>stored.list(id),append});
    const completed=await reloaded.service.complete(task.id);
    expect(append).toHaveBeenCalledWith(pending.completion);
    expect(completed.completedAt).toBe(pending.completion?.occurredAt);
    expect(await stored.list(actor.groupId)).toHaveLength(1);
  });

  it("does not send evidence if saving its retry identity fails",async()=>{
    const {service,storage,events}=setup();
    const task=service.add("Stretch");
    vi.spyOn(storage,"setItem").mockImplementation(()=>{throw new Error("Storage full")});
    await expect(service.complete(task.id)).rejects.toThrow("Storage full");
    expect(await events.list(actor.groupId)).toEqual([]);
    expect(service.list()[0].completedAt).toBeUndefined();
  });

  it("preserves a star edit made while completion is in flight",async()=>{
    let release!:()=>void;
    const stored=new InMemoryActionEventRepository();
    const {service}=setup(new TestStorage(),{list:id=>stored.list(id),append:async event=>{
      await new Promise<void>(resolve=>{release=resolve});await stored.append(event);
    }});
    const task=service.add("Read");
    const completion=service.complete(task.id);
    service.star(task.id);release();await completion;
    expect(service.list()[0]).toMatchObject({starred:true,completedAt:now().toISOString()});
  });

  it("keeps malformed storage intact and rejects blank tasks",()=>{
    const {tasks,service,storage}=setup();
    expect(()=>service.add("  ")).toThrow();
    const task=service.add("Read");
    const key=storage.key(0)!;
    storage.setItem(key,"null");
    expect(()=>tasks.get(task.id)).toThrow("Saved task could not be read");
    expect(storage.getItem(key)).toBe("null");
  });
});

describe("Quick Log retry draft",()=>{
  const input={actionType:"action_completed" as const,category:"workout",title:"Completed workout"};

  it("retains the original event across failed responses, navigation, and reload",async()=>{
    const stored=new InMemoryActionEventRepository();
    const {storage,log}=setup(new TestStorage(),{list:id=>stored.list(id),append:async event=>{
      await stored.append(event);throw new Error("Response lost");
    }});
    const pending=new PendingLog(storage,actor,log);
    await expect(pending.save(input)).rejects.toThrow("Response lost");
    const original=pending.read();
    const retry=new PendingLog(storage,actor,setup(storage,stored).log);
    expect(await retry.save({...input,title:"Changed input must not replace retry"})).toEqual(original);
    expect(await stored.list(actor.groupId)).toEqual([original]);
    expect(retry.read()).toBeUndefined();
  });

  it("coalesces rapid saves but permits an intentional subsequent log",async()=>{
    const {storage,log,events}=setup();
    const pending=new PendingLog(storage,actor,log);
    const first=pending.save(input);
    expect(pending.save(input)).toBe(first);
    await first;
    await pending.save(input);
    expect(await events.list(actor.groupId)).toHaveLength(2);
  });

  it("rejects committing another user's prepared evidence",async()=>{
    const {log,events}=setup();
    await expect(log.commit({...log.prepare(input),userId:"other"})).rejects.toThrow("different account");
    expect(await events.list(actor.groupId)).toHaveLength(0);
  });
});
