import {describe,expect,it,vi} from "vitest";
import type {DailyResultRepository} from "../../domain/repositories";
import {FinalizeDay} from "./finalize-day";

describe("FinalizeDay",()=>{
  it("delegates the complete operation to one repository transaction",async()=>{
    const result={id:"result-1",challengeGroupId:"group-1",localDate:"2026-07-01",scores:{a:4,b:2},appliedRules:[],tie:false,createdAt:"now"};
    const finalize=vi.fn().mockResolvedValue(result);
    const useCase=new FinalizeDay({finalize} satisfies DailyResultRepository);
    await expect(useCase.execute("group-1","2026-07-01T20:00:00Z")).resolves.toEqual(result);
    expect(finalize).toHaveBeenCalledOnce();
  });
});
