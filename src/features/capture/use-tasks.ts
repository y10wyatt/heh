import {useEffect,useMemo,useRef,useState} from "react";
import {useAppData} from "../../app/AppDataProvider";
import type {Task,TaskCategory} from "../../domain/models/task";
import {LocalTaskRepository} from "../../infrastructure/local/task-repository";
import {useAuth} from "../auth/AuthProvider";
import {TaskService} from "./task-service";
import {SupabaseTaskRepository} from "../../infrastructure/supabase/task-repository";

export function useTasks(){
  const {currentUserId,groupId,prepareAction,saveAction}=useAppData();
  const {configured}=useAuth();
  const [tasks,setTasks]=useState<Task[]>([]);
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);
  const busy=useRef(false);
  const setup=useMemo(()=>{
    if(!groupId)return {};
    try{
      const actor={userId:currentUserId,groupId};
      const local=new LocalTaskRepository(localStorage,{...actor,mode:configured?"connected":"demo"});
      return {local,remote:configured?new SupabaseTaskRepository():undefined,service:new TaskService(
        local,
        {prepare:prepareAction,commit:saveAction},actor,
      )};
    }catch{return {error:"Device storage is unavailable. Enable browser storage to save tasks."}}
  },[currentUserId,groupId,configured,prepareAction,saveAction]);

  useEffect(()=>{
    const reload=()=>{
      try{setTasks(setup.service?.list()??[]);setError("");if(setup.remote)void setup.remote.list(currentUserId,groupId).then(remoteTasks=>{remoteTasks.forEach(task=>setup.local?.save(task));setTasks(setup.service?.list()??[]) }).catch(reason=>setError(reason instanceof Error?reason.message:"Unable to sync saved goals"))}
      catch(reason){setError(reason instanceof Error?reason.message:"Unable to read saved tasks")}
    };
    reload();
    window.addEventListener("storage",reload);
    return()=>window.removeEventListener("storage",reload);
  },[setup]);

  async function run(action:(service:TaskService)=>unknown|Promise<unknown>){
    if(!setup.service||busy.current)return false;
    busy.current=true;setSaving(true);setError("");
    try{
      const result=await action(setup.service);
      if(setup.remote&&result&&typeof result==="object"&&"id" in result)await setup.remote.save(result as Task);
      setTasks(setup.service.list());
      return true;
    }catch(reason){
      setError(reason instanceof Error?reason.message:"Task could not be saved. Please retry.");
      try{setTasks(setup.service.list())}catch{/* Keep visible tasks if device storage is unavailable. */}
      return false;
    }finally{busy.current=false;setSaving(false)}
  }

  return {
    tasks:tasks.filter(task=>task.userId===currentUserId&&task.groupId===groupId),
    error:setup.error??error,saving,ready:!!setup.service,
    add:(title:string,category?:TaskCategory)=>run(service=>service.add(title,category)),
    star:(id:string)=>run(service=>{service.star(id);return service.list().find(task=>task.id===id)}),
    complete:(id:string)=>run(service=>service.complete(id)),
  };
}
