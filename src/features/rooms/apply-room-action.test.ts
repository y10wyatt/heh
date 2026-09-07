import {describe,expect,it,vi} from "vitest";
import type {RoomActionRepository} from "../../domain/repositories";
import {ApplyRoomAction} from "./apply-room-action";

describe("ApplyRoomAction",()=>{
  it("delegates one authoritative mutation to the repository",async()=>{
    const action={id:"a",actorId:"u",targetRoomId:"r",challengeGroupId:"g",actionType:"prank" as const,slotId:"s",entitlementId:"e",result:"applied" as const,createdAt:"now",metadata:{}};
    const repository={list:vi.fn(),apply:vi.fn().mockResolvedValue(action)} satisfies RoomActionRepository;
    await expect(new ApplyRoomAction(repository).execute({entitlementId:"e",targetRoomId:"r",slotId:"s",actionType:"prank"})).resolves.toEqual(action);
    expect(repository.apply).toHaveBeenCalledOnce();
  });
});
