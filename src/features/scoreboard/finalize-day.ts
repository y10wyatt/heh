import type {DailyResult} from "../../domain/models/core";
import type {DailyResultRepository} from "../../domain/repositories";

export class FinalizeDay{
  constructor(private readonly repository:DailyResultRepository){}
  execute(groupId:string,now?:string):Promise<DailyResult>{
    if(!groupId)throw new Error("A challenge group is required");
    return this.repository.finalize(groupId,now);
  }
}
