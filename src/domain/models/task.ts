import type {ActionEvent} from "./action-event";

export type Task = {
  id:string;
  userId:string;
  groupId:string;
  title:string;
  starred:boolean;
  createdAt:string;
  completion?:ActionEvent;
  completedAt?:string;
};

export interface TaskRepository {
  list():Task[];
  get(id:string):Task|undefined;
  save(task:Task):void;
}
