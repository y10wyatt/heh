import {createContext,useContext,useMemo,useState,type PropsWithChildren} from "react";
import type {ActionEvent,ActionEventType} from "../domain/models/action-event";
import {events as seedEvents,groupId,users} from "../dev/seed";
import {InMemoryActionEventRepository} from "../infrastructure/memory/repositories";

type LogActionInput={actionType:Extract<ActionEventType,"action_completed"|"action_missed">;category:string;title:string;note?:string};
type AppData={events:ActionEvent[];logAction(input:LogActionInput):Promise<ActionEvent>};
const AppDataContext=createContext<AppData|null>(null);

export function AppDataProvider({children}:PropsWithChildren){
  const repository=useMemo(()=>new InMemoryActionEventRepository([...seedEvents]),[]);
  const [events,setEvents]=useState<ActionEvent[]>(seedEvents);
  const value=useMemo<AppData>(()=>({
    events,
    async logAction(input){
      const now=new Date().toISOString();
      const event:ActionEvent={id:crypto.randomUUID(),userId:users.william,challengeGroupId:groupId,sourceApp:"sibling_showdown",category:input.category.toLowerCase(),actionType:input.actionType,title:input.title,occurredAt:now,createdAt:now,visibility:"challenge_group",schemaVersion:1,metadata:input.note?{note:input.note}:{}};
      await repository.append(event);
      setEvents(current=>current.some(item=>item.id===event.id)?current:[event,...current]);
      return event;
    },
  }),[events,repository]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
export function useAppData(){const value=useContext(AppDataContext);if(!value)throw new Error("useAppData must be used inside AppDataProvider");return value}
