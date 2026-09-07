import {createContext,useContext,useEffect,useMemo,useState,type PropsWithChildren} from "react";
import type {User} from "@supabase/supabase-js";
import {isSupabaseConfigured,supabase} from "../../infrastructure/supabase/client";

type AuthState={
  configured:boolean;
  loading:boolean;
  user:User|null;
  signIn(email:string,password:string):Promise<void>;
  signOut():Promise<void>;
};

const AuthContext=createContext<AuthState|null>(null);

export function AuthProvider({children}:PropsWithChildren){
  const [user,setUser]=useState<User|null>(null);
  const [loading,setLoading]=useState(isSupabaseConfigured);

  useEffect(()=>{
    if(!supabase)return;
    let active=true;
    void supabase.auth.getSession().then(({data})=>{
      if(active){setUser(data.session?.user??null);setLoading(false)}
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      setUser(session?.user??null);
      setLoading(false);
    });
    return()=>{active=false;subscription.unsubscribe()};
  },[]);

  const value=useMemo<AuthState>(()=>({
    configured:isSupabaseConfigured,
    loading,
    user,
    async signIn(email,password){
      if(!supabase)throw new Error("Supabase is not configured");
      const {error}=await supabase.auth.signInWithPassword({email,password});
      if(error)throw error;
    },
    async signOut(){if(supabase)await supabase.auth.signOut()},
  }),[loading,user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){
  const value=useContext(AuthContext);
  if(!value)throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
