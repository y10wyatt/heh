import {createContext,useContext,useEffect,useMemo,useState,type PropsWithChildren} from "react";
import type {ActionEvent} from "../domain/models/action-event";
import type {PointRule} from "../domain/models/core";
import type {ActionEventRepository,MembershipRepository,PointRuleRepository} from "../domain/repositories";
import {events as seedEvents,groupId as demoGroupId,rules as seedRules,users} from "../dev/seed";
import {useAuth} from "../features/auth/AuthProvider";
import {LogAction,type LogActionInput} from "../features/capture/log-action";
import {PersistentDemoActionEventRepository} from "../dev/persistent-events";
import {SupabaseActionEventRepository,SupabaseMembershipRepository,SupabasePointRuleRepository} from "../infrastructure/supabase/repositories";

type AppData={events:ActionEvent[];rules:PointRule[];currentUserId:string;groupId:string;loading:boolean;error:string;refresh():Promise<void>;logAction(input:LogActionInput):Promise<ActionEvent>;prepareAction:LogAction["prepare"];saveAction:LogAction["commit"]};
const AppDataContext=createContext<AppData|null>(null);
type Dependencies={events:ActionEventRepository;rules:PointRuleRepository;memberships:MembershipRepository;fallbackGroupId?:string};

const demoDependencies:Dependencies={
  events:new PersistentDemoActionEventRepository(seedEvents),
  rules:{list:async()=>seedRules},
  memberships:{findGroupId:async()=>demoGroupId},
  fallbackGroupId:demoGroupId,
};
const remoteDependencies:Dependencies={events:new SupabaseActionEventRepository(),rules:new SupabasePointRuleRepository(),memberships:new SupabaseMembershipRepository()};

export function AppDataProvider({children}:PropsWithChildren){
  const {configured,user}=useAuth();
  const dependencies=configured?remoteDependencies:demoDependencies;
  const currentUserId=user?.id??users.william;
  const [events,setEvents]=useState<ActionEvent[]>(configured?[]:seedEvents);
  const [rules,setRules]=useState<PointRule[]>(configured?[]:seedRules);
  const [groupId,setGroupId]=useState(dependencies.fallbackGroupId??"");
  const [loading,setLoading]=useState(configured);
  const [error,setError]=useState("");
  const actionLog=useMemo(()=>new LogAction(dependencies.events,{userId:currentUserId,challengeGroupId:groupId}),[dependencies,currentUserId,groupId]);

  const capture=useMemo(()=>({
    prepareAction:(input:LogActionInput)=>actionLog.prepare(input),
    async saveAction(event:ActionEvent){
      if(!groupId)throw new Error("No challenge group is available");
      const saved=await actionLog.commit(event);
      setEvents(current=>current.some(item=>item.id===saved.id)?current:[saved,...current]);
      return saved;
    },
  }),[actionLog,groupId]);

  async function load(){
    setLoading(true);setError("");
    try{
      const foundGroupId=await dependencies.memberships.findGroupId(currentUserId);
      if(!foundGroupId)throw new Error("This account is not assigned to a sibling challenge group.");
      const [nextEvents,nextRules]=await Promise.all([dependencies.events.list(foundGroupId),dependencies.rules.list(foundGroupId)]);
      setGroupId(foundGroupId);setEvents(nextEvents);setRules(nextRules);
    }catch(reason){setError(reason instanceof Error?reason.message:"Unable to load challenge data")}
    finally{setLoading(false)}
  }
  useEffect(()=>{void load()},[currentUserId,configured]);

  const value=useMemo<AppData>(()=>({events,rules,currentUserId,groupId,loading,error,refresh:load,...capture,
    async logAction(input){
      return capture.saveAction(capture.prepareAction(input));
    },
  }),[events,rules,currentUserId,groupId,loading,error,capture]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
export function useAppData(){const value=useContext(AppDataContext);if(!value)throw new Error("useAppData must be used inside AppDataProvider");return value}
