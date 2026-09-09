import type {ActionEvent} from "./action-event";

export const taskCategories=["body","mind","joy","everyday"] as const;
export type TaskCategory=typeof taskCategories[number];

export function isTaskCategory(value:unknown):value is TaskCategory{
  return taskCategories.includes(value as TaskCategory);
}

export function inferTaskCategory(title:string):TaskCategory{
  if(/box|walk|run|gym|workout|stretch|swim|cycle|sleep/i.test(title))return "body";
  if(/read|learn|study|write|practice|course|language/i.test(title))return "mind";
  if(/paint|music|movie|friend|family|game|hobby|pottery|photo/i.test(title))return "joy";
  return "everyday";
}

export type Task = {
  id:string;
  userId:string;
  groupId:string;
  title:string;
  category:TaskCategory;
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
