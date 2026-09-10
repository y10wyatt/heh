import type {Task,TaskCategory} from "../../domain/models/task";
import {inferTaskCategory,isTaskCategory} from "../../domain/models/task";
import {supabase} from "./client";

function client(){if(!supabase)throw new Error("Supabase environment variables are not configured");return supabase}
type TaskRow={id:string;user_id:string;group_id:string;title:string;category:string;starred:boolean;created_at:string;completion:Task["completion"]|null;completed_at:string|null};
const map=(row:TaskRow):Task=>({id:row.id,userId:row.user_id,groupId:row.group_id,title:row.title,category:isTaskCategory(row.category)?row.category:inferTaskCategory(row.title),starred:row.starred,createdAt:row.created_at,completion:row.completion??undefined,completedAt:row.completed_at??undefined});
export class SupabaseTaskRepository {
  async list(userId:string,groupId:string){const {data,error}=await client().from("personal_tasks").select("id,user_id,group_id,title,category,starred,created_at,completion,completed_at").eq("user_id",userId).eq("group_id",groupId).order("created_at").limit(200);if(error)throw error;return (data as TaskRow[]).map(map)}
  async save(task:Task){const {data,error}=await client().rpc("our_place_save_task",{p_id:task.id,p_group_id:task.groupId,p_title:task.title,p_category:task.category,p_starred:task.starred,p_completion:task.completion??null,p_completed_at:task.completedAt??null} as never);if(error)throw error;return map(data as unknown as TaskRow)}
}
