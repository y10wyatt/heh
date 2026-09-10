import {createContext,useContext,useEffect,useMemo,useState,type PropsWithChildren} from "react";
import type {ActionEvent} from "../domain/models/action-event";
import type {PointRule} from "../domain/models/core";
import type {CreateHouseholdInput,HouseholdOnboardingInput,HouseholdRepository,HouseholdState} from "../domain/models/household";
import type {ActionEventRepository,HouseholdActionRecord,HouseholdActionRepository,LeaveHouseholdActionInput,MembershipRepository,PointRuleRepository} from "../domain/repositories";
import {events as seedEvents,groupId as demoGroupId,rules as seedRules,users} from "../dev/seed";
import {useAuth} from "../features/auth/AuthProvider";
import {LogAction,type LogActionInput} from "../features/capture/log-action";
import {PersistentDemoActionEventRepository} from "../dev/persistent-events";
import {SupabaseActionEventRepository,SupabaseHouseholdActionRepository,SupabaseHouseholdRepository,SupabaseMembershipRepository,SupabasePointRuleRepository} from "../infrastructure/supabase/repositories";
import {supabase} from "../infrastructure/supabase/client";

type AppData={events:ActionEvent[];rules:PointRule[];householdActions:HouseholdActionRecord[];currentUserId:string;groupId:string;household:HouseholdState|null;loading:boolean;error:string;refresh():Promise<void>;createHousehold(input:CreateHouseholdInput):Promise<void>;joinHousehold(code:string,input:HouseholdOnboardingInput):Promise<void>;completeOnboarding(input:HouseholdOnboardingInput):Promise<void>;leaveHouseholdAction(input:LeaveHouseholdActionInput):Promise<HouseholdActionRecord>;setHouseholdActionState(id:string,state:Exclude<HouseholdActionRecord["state"],"placed">):Promise<void>;logAction(input:LogActionInput):Promise<ActionEvent>;prepareAction:LogAction["prepare"];saveAction:LogAction["commit"]};
const AppDataContext=createContext<AppData|null>(null);
type Dependencies={events:ActionEventRepository;rules:PointRuleRepository;memberships:MembershipRepository;household:HouseholdRepository;householdActions?:HouseholdActionRepository;fallbackGroupId?:string};

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
const remoteHouseholdActions=new SupabaseHouseholdActionRepository();
const remoteDependencies:Dependencies={events:new SupabaseActionEventRepository(),rules:new SupabasePointRuleRepository(),memberships:new SupabaseMembershipRepository(),household:new SupabaseHouseholdRepository(),householdActions:remoteHouseholdActions};

export function AppDataProvider({children}:PropsWithChildren){
  const {configured,user}=useAuth();
  const dependencies=configured?remoteDependencies:demoDependencies;
  const currentUserId=user?.id??users.william;
  const [events,setEvents]=useState<ActionEvent[]>(configured?[]:seedEvents);
  const [rules,setRules]=useState<PointRule[]>(configured?[]:seedRules);
  const [householdActions,setHouseholdActions]=useState<HouseholdActionRecord[]>([]);
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
      if(!foundGroupId){setEvents([]);setRules([]);setHouseholdActions([]);return}
      if(configured){
        const [nextEvents,nextHouseholdActions]=await Promise.all([dependencies.events.list(foundGroupId),dependencies.householdActions?.listRecords(foundGroupId)??Promise.resolve([])]);
        setEvents(nextEvents);setHouseholdActions(nextHouseholdActions);setRules([]);return;
      }
      const [nextEvents,nextRules]=await Promise.all([dependencies.events.list(foundGroupId),dependencies.rules.list(foundGroupId)]);
      setEvents(nextEvents);setRules(nextRules);setHouseholdActions([]);
    }catch(reason){setError(reason instanceof Error?reason.message:"Unable to load challenge data")}
    finally{setLoading(false)}
  }
  useEffect(()=>{void load()},[currentUserId,configured]);
  useEffect(()=>{
    if(!configured||!groupId||!supabase)return;
    const client=supabase;let timer=0;const schedule=()=>{window.clearTimeout(timer);timer=window.setTimeout(()=>void load(),300)};
    const channel=client.channel(`our-place-sync:${groupId}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"household_actions",filter:`group_id=eq.${groupId}`},schedule)
      .on("postgres_changes",{event:"*",schema:"public",table:"personal_action_events",filter:`group_id=eq.${groupId}`},schedule)
      .subscribe();
    return()=>{window.clearTimeout(timer);void client.removeChannel(channel)};
  },[configured,groupId]);

  const value=useMemo<AppData>(()=>({events,rules,householdActions,currentUserId,groupId,household,loading,error,refresh:load,
    async createHousehold(input){await dependencies.household.create(input);await load()},
    async joinHousehold(code,input){await dependencies.household.join(code,input);await load()},
    async completeOnboarding(input){if(!groupId)throw new Error("No household is available");await dependencies.household.complete(groupId,input);await load()},
    async leaveHouseholdAction(input){if(!dependencies.householdActions)throw new Error("Household actions are unavailable in demo mode");const action=await dependencies.householdActions.leave(input);setHouseholdActions(current=>[action,...current.filter(item=>item.id!==action.id)]);return action},
    async setHouseholdActionState(id,state){if(!dependencies.householdActions)throw new Error("Household actions are unavailable in demo mode");const action=await dependencies.householdActions.setState(id,state);setHouseholdActions(current=>current.map(item=>item.id===action.id?action:item))},
    ...capture,
    async logAction(input){
      return capture.saveAction(capture.prepareAction(input));
    },
  }),[events,rules,householdActions,currentUserId,groupId,household,loading,error,capture,dependencies]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
export function useAppData(){const value=useContext(AppDataContext);if(!value)throw new Error("useAppData must be used inside AppDataProvider");return value}
