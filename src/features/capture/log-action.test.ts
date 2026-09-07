import {describe,expect,it} from "vitest";
import {InMemoryActionEventRepository} from "../../infrastructure/memory/repositories";
import {LogAction} from "./log-action";

describe("LogAction",()=>{
  it("creates one idempotent shared evidence event for the authenticated actor",async()=>{
    const repository=new InMemoryActionEventRepository();
    const useCase=new LogAction(
      repository,
      {userId:"user-1",challengeGroupId:"group-1"},
      ()=>new Date("2026-07-01T12:00:00.000Z"),
      ()=>"event-1",
    );
    const event=await useCase.execute({actionType:"action_completed",category:"Workout",title:"Completed workout",note:"Morning"});
    expect(event).toMatchObject({id:"event-1",userId:"user-1",challengeGroupId:"group-1",category:"workout",visibility:"challenge_group",metadata:{note:"Morning"}});
    expect(await repository.list("group-1")).toEqual([event]);
  });
});
