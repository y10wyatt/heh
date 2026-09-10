import {useEffect,useMemo,useState} from "react";

export type SharedBoardNote={
  id:string;
  title:string;
  body:string;
  color:"yellow"|"cream"|"sage"|"peach";
  authorId:string;
  createdAt:string;
};
export type SharedBoardRemote={notes:SharedBoardNote[];add(title:string,body:string):Promise<boolean>};

const sampleNotes=(authorId:string):SharedBoardNote[]=>[
  {id:"weekend-away",title:"Weekend away",body:"Pick a place",color:"yellow",authorId,createdAt:"2026-09-01T12:00:00.000Z"},
  {id:"this-week",title:"This week",body:"Book boxing\nBuy groceries",color:"cream",authorId,createdAt:"2026-09-02T12:00:00.000Z"},
  {id:"pottery",title:"Try pottery together",body:"Something new for both of us.",color:"sage",authorId,createdAt:"2026-09-03T12:00:00.000Z"},
  {id:"movie-night",title:"Movie night?",body:"You pick the movie. I pick the snacks.",color:"peach",authorId,createdAt:"2026-09-04T12:00:00.000Z"},
];

function isNote(value:unknown):value is SharedBoardNote{
  const note=value as Partial<SharedBoardNote>;
  return !!note&&typeof note.id==="string"&&typeof note.title==="string"&&typeof note.body==="string"&&
    typeof note.authorId==="string"&&typeof note.createdAt==="string"&&["yellow","cream","sage","peach"].includes(note.color??"");
}

export function useSharedBoard(groupId:string,currentUserId:string,demo:boolean,remote?:SharedBoardRemote){
  const key=useMemo(()=>`sibling-showdown:board:v1:${demo?"demo":"connected"}:${groupId}`,[demo,groupId]);
  const [notes,setNotes]=useState<SharedBoardNote[]>([]);
  const [error,setError]=useState("");

  useEffect(()=>{
    if(!groupId)return;
    const load=async()=>{
      if(remote){setNotes(remote.notes);setError("");return}
      try{
        const parsed=JSON.parse(localStorage.getItem(key)??"null");
        const next=Array.isArray(parsed)&&parsed.every(isNote)?parsed:demo?sampleNotes(currentUserId):[];
        setNotes(next);setError("");
      }catch{setNotes(demo?sampleNotes(currentUserId):[]);setError("This board is unavailable in browser storage.")}
    };
    load();window.addEventListener("storage",load);
    return()=>window.removeEventListener("storage",load);
  },[currentUserId,demo,groupId,key,remote]);

  async function add(title:string,body:string){
    const trimmed=title.trim();
    if(!trimmed)return false;
    if(remote)return remote.add(trimmed,body);
    const next=[...notes,{id:crypto.randomUUID(),title:trimmed,body:body.trim(),color:"yellow" as const,authorId:currentUserId,createdAt:new Date().toISOString()}];
    try{localStorage.setItem(key,JSON.stringify(next));setNotes(next);setError("");return true}
    catch{setError("The note could not be saved on this device.");return false}
  }

  return {notes,error,add};
}
