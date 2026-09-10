import {createContext,useCallback,useContext,useEffect,useMemo,useState,type PropsWithChildren} from "react";
import type {DailyResult} from "../domain/models/core";
import type {Room,RoomAction,RoomActionEntitlement,RoomItem,RoomSlot} from "../domain/models/rooms";
import type {ApplyRoomActionInput,DailyResultRepository,RoomActionRepository,RoomEntitlementRepository,RoomItemRepository,RoomRepository} from "../domain/repositories";
import {entitlements as seedEntitlements,roomActions as seedRoomActions,roomItems as seedItems,rooms as seedRooms,slots as seedSlots,users} from "../dev/seed";
import {ApplyRoomAction} from "../features/rooms/apply-room-action";
import {FinalizeDay} from "../features/scoreboard/finalize-day";
import {useAuth} from "../features/auth/AuthProvider";
import {InMemoryDailyResultRepository,InMemoryRoomActionRepository,InMemoryRoomEntitlementRepository,InMemoryRoomItemRepository,InMemoryRoomRepository} from "../infrastructure/memory/repositories";
import {SupabaseHouseholdActionRepository,SupabaseHouseholdRoomRepository} from "../infrastructure/supabase/repositories";
import {useAppData} from "./AppDataProvider";

type Dependencies={rooms:RoomRepository;actions:RoomActionRepository;entitlements:RoomEntitlementRepository;items:RoomItemRepository;results:DailyResultRepository};
const demoEntitlements=new InMemoryRoomEntitlementRepository([...seedEntitlements]);
const demoDependencies:Dependencies={
  rooms:new InMemoryRoomRepository(seedRooms,seedSlots),
  actions:new InMemoryRoomActionRepository(users.william,seedRooms[0].challengeGroupId,[...seedRoomActions]),
  entitlements:demoEntitlements,
  items:new InMemoryRoomItemRepository(seedItems),
  results:new InMemoryDailyResultRepository(),
};
const remoteDependencies:Dependencies={
  rooms:new SupabaseHouseholdRoomRepository(),
  actions:new SupabaseHouseholdActionRepository(),
  entitlements:{list:async()=>[]},
  items:{list:async()=>[]},
  results:{finalize:async()=>{throw new Error("Daily results are not connected to this household yet")}},
};

type GameData={
  rooms:Room[];roomActions:RoomAction[];entitlements:RoomActionEntitlement[];items:RoomItem[];
  loading:boolean;error:string;lastRoomAction?:RoomAction;dailyResult?:DailyResult;
  loadSlots(roomId:string):Promise<RoomSlot[]>;
  finalizeDay():Promise<DailyResult>;
  applyRoomAction(input:ApplyRoomActionInput):Promise<RoomAction>;
};
const GameDataContext=createContext<GameData|null>(null);

export function GameDataProvider({children}:PropsWithChildren){
  const {configured}=useAuth();
  const {currentUserId,groupId}=useAppData();
  const dependencies=configured?remoteDependencies:demoDependencies;
  const [rooms,setRooms]=useState<Room[]>(configured?[]:seedRooms);
  const [roomActions,setRoomActions]=useState<RoomAction[]>([]);
  const [entitlements,setEntitlements]=useState<RoomActionEntitlement[]>(configured?[]:seedEntitlements);
  const [items,setItems]=useState<RoomItem[]>(configured?[]:seedItems);
  const [loading,setLoading]=useState(configured);
  const [error,setError]=useState("");
  const [lastRoomAction,setLastRoomAction]=useState<RoomAction>();
  const [dailyResult,setDailyResult]=useState<DailyResult>();

  const refresh=useCallback(async()=>{
    if(!groupId)return;
    setLoading(true);setError("");
    try{
      const [nextRooms,nextActions,nextEntitlements,nextItems]=await Promise.all([
        dependencies.rooms.list(groupId),
        dependencies.actions.list(groupId),
        dependencies.entitlements.list(currentUserId),
        dependencies.items.list(),
      ]);
      setRooms(nextRooms);setRoomActions(nextActions);setEntitlements(nextEntitlements);setItems(nextItems);
    }catch(reason){setError(reason instanceof Error?reason.message:"Unable to load room data")}
    finally{setLoading(false)}
  },[currentUserId,dependencies,groupId]);

  useEffect(()=>{void refresh()},[refresh]);
  const loadSlots=useCallback((roomId:string)=>dependencies.rooms.slots(roomId),[dependencies]);

  const value=useMemo<GameData>(()=>({rooms,roomActions,entitlements,items,loading,error,lastRoomAction,dailyResult,loadSlots,
    async finalizeDay(){
      const result=await new FinalizeDay(dependencies.results).execute(groupId);
      setDailyResult(result);
      await refresh();
      return result;
    },
    async applyRoomAction(input){
      const action=await new ApplyRoomAction(dependencies.actions).execute(input);
      if(!configured)demoEntitlements.consume(input.entitlementId);
      setLastRoomAction(action);
      await refresh();
      return action;
    },
  }),[rooms,roomActions,entitlements,items,loading,error,lastRoomAction,dailyResult,loadSlots,dependencies,groupId,refresh,configured]);
  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData(){const value=useContext(GameDataContext);if(!value)throw new Error("useGameData must be used inside GameDataProvider");return value}
