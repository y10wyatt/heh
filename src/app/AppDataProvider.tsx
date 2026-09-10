import {createContext,useContext,useEffect,useMemo,useState,type PropsWithChildren} from "react";
import type {ActionEvent} from "../domain/models/action-event";
import type {PointRule} from "../domain/models/core";
import type {CreateHouseholdInput,HouseholdOnboardingInput,HouseholdRepository,HouseholdState} from "../domain/models/household";
import type {ActionEventRepository,MembershipRepository,PointRuleRepository} from "../domain/repositories";
import {events as seedEvents,groupId as demoGroupId,rules as seedRules,users} from "../dev/seed";
import {useAuth} from "../features/auth/AuthProvider";
import {LogAction,type LogActionInput} from "../features/capture/log-action";
import {PersistentDemoActionEventRepository} from "../dev/persistent-events";
import {SupabaseActionEventRepository,SupabaseHouseholdRepository,SupabaseMembershipRepository,SupabasePointRuleRepository} from "../infrastructure/supabase/repositories";

type AppData={events:ActionEvent[];rules:PointRule[];currentUserId:string;groupId:string;household:HouseholdState|null;loading:boolean;error:string;refresh():Promise<void>;createHousehold(input:CreateHouseholdInput):Promise<void>;joinHousehold(code:string,input:HouseholdOnboardingInput):Promise<void>;completeOnboarding(input:HouseholdOnboardingInput):Promise<void>;logAction(input:LogActionInput):Promise<ActionEvent>;prepareAction:LogAction["prepare"];saveAction:LogAction["commit"]};
const AppDataContext=createContext<AppData|null>(null);
type Dependencies={events:ActionEventRepository;rules:PointRuleRepository;memberships:MembershipRepository;household:HouseholdRepository;fallbackGroupId?:string};

const demoDependencies:Dependencies={
  events:new PersistentDemoActionEventRepository(seedEvents),
  rules:{list:async()=>seedRules},
  memberships:{findGroupId:async()=>demoGroupId},
  household:{
    state:async()=>({groupId:demoGroupId,groupName:"Our place",memberRole:"owner",memberCount:2,onboardingCompleted:true}),
    create:async()=>demoGroupId,
    join:async()=>demoGroupId,
    complete:async()=>{},
  },
  fallbackGroupId:demoGroupId,
};
const remoteDependencies:Dependencies={events:new SupabaseActionEventRepository(),rules:new SupabasePointRuleRepository(),memberships:new SupabaseMembershipRepository(),household:new SupabaseHouseholdRepository()};

export function AppDataProvider({children}:PropsWithChildren){
  const {configured,user}=useAuth();
  const dependencies=configured?remoteDependencies:demoDependencies;
  const currentUserId=user?.id??users.william;
  const [events,setEvents]=useState<ActionEvent[]>(configured?[]:seedEvents);
  const [rules,setRules]=useState<PointRule[]>(configured?[]:seedRules);
  const [groupId,setGroupId]=useState(dependencies.fallbackGroupId??"");
  const [household,setHousehold]=useState<HouseholdState|null>(configured?null:{groupId:demoGroupId,groupName:"Our place",memberRole:"owner",memberCount:2,onboardingCompleted:true});
  const [loading,setLoading]=useState(configured);
  const [error,setError]=useState("");
  const actionLog=useMemo(()=>new LogAction(dependencies.events,{userId:currentUserId,challengeGroupId:groupId}),[dependencies,currentUserId,groupId]);

  const capture=useMemo(()=>({
    prepareAction:(input:LogActionInput,id?:string)=>actionLog.prepare(input,id),
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
      const nextHousehold=await dependencies.household.state();
      setHousehold(nextHousehold);
      const foundGroupId=nextHousehold?.groupId??"";
      setGroupId(foundGroupId);
      if(!foundGroupId){setEvents([]);setRules([]);return}
      if(configured){setEvents([]);setRules([]);return}
      const [nextEvents,nextRules]=await Promise.all([dependencies.events.list(foundGroupId),dependencies.rules.list(foundGroupId)]);
      setEvents(nextEvents);setRules(nextRules);
    }catch(reason){setError(reason instanceof Error?reason.message:"Unable to load challenge data")}
    finally{setLoading(false)}
  }
  useEffect(()=>{void load()},[currentUserId,configured]);

  const value=useMemo<AppData>(()=>({events,rules,currentUserId,groupId,household,loading,error,refresh:load,
    async createHousehold(input){await dependencies.household.create(input);await load()},
    async joinHousehold(code,input){await dependencies.household.join(code,input);await load()},
    async completeOnboarding(input){if(!groupId)throw new Error("No household is available");await dependencies.household.complete(groupId,input);await load()},
    ...capture,
    async logAction(input){
      return capture.saveAction(capture.prepareAction(input));
    },
  }),[events,rules,currentUserId,groupId,household,loading,error,capture,dependencies]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
export function useAppData(){const value=useContext(AppDataContext);if(!value)throw new Error("useAppData must be used inside AppDataProvider");return value}
