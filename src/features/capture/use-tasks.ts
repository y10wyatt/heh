import {useEffect,useMemo,useRef,useState} from "react";
import {useAppData} from "../../app/AppDataProvider";
import type {Task} from "../../domain/models/task";
import {LocalTaskRepository} from "../../infrastructure/local/task-repository";
import {useAuth} from "../auth/AuthProvider";
import {TaskService} from "./task-service";

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
      return {service:new TaskService(
        new LocalTaskRepository(localStorage,{...actor,mode:configured?"connected":"demo"}),
        {prepare:prepareAction,commit:saveAction},actor,
      )};
    }catch{return {error:"Device storage is unavailable. Enable browser storage to save tasks."}}
  },[currentUserId,groupId,configured,prepareAction,saveAction]);

  useEffect(()=>{
    const reload=()=>{
      try{setTasks(setup.service?.list()??[]);setError("")}
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
      await action(setup.service);
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
    add:(title:string)=>run(service=>service.add(title)),
    star:(id:string)=>run(service=>service.star(id)),
    complete:(id:string)=>run(service=>service.complete(id)),
  };
}
