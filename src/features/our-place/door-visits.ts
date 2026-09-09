import {useEffect,useMemo,useState} from "react";
import type {RoomAction} from "../../domain/models/rooms";

type SeenRooms=Record<string,string>;

export function useDoorVisits(groupId:string,currentUserId:string,actions:RoomAction[]){
  const key=useMemo(()=>`sibling-showdown:door-seen:v1:${currentUserId}:${groupId}`,[currentUserId,groupId]);
  const [seen,setSeen]=useState<SeenRooms>({});

  useEffect(()=>{
    try{
      const parsed=JSON.parse(localStorage.getItem(key)??"{}");
      setSeen(parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed as SeenRooms:{});
    }catch{setSeen({})}
  },[key]);

  function hasUnseenVisit(roomId:string){
    const latest=actions.filter(action=>action.targetRoomId===roomId&&action.actorId!==currentUserId)
      .sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt))[0];
    return !!latest&&Date.parse(latest.createdAt)>Date.parse(seen[roomId]??"1970-01-01T00:00:00.000Z");
  }

  function markSeen(roomId:string){
    const next={...seen,[roomId]:new Date().toISOString()};
    setSeen(next);
    try{localStorage.setItem(key,JSON.stringify(next))}catch{/* The room still opens when browser storage is unavailable. */}
  }

  return {hasUnseenVisit,markSeen};
}
