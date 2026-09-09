import {createContext,useContext,useEffect,useMemo,useState,type PropsWithChildren} from "react";
import type {User} from "@supabase/supabase-js";
import {isSupabaseConfigured,supabase} from "../../infrastructure/supabase/client";

type AuthState={
  configured:boolean;
  loading:boolean;
  user:User|null;
  signIn(email:string,password:string):Promise<void>;
  signUp(email:string,password:string):Promise<{needsEmailConfirmation:boolean}>;
  sendMagicLink(email:string):Promise<void>;
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
      const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
      if(error)throw error;
    },
    async signUp(email,password){
      if(!supabase)throw new Error("Supabase is not configured");
      const {data,error}=await supabase.auth.signUp({
        email:email.trim(),
        password,
        options:{emailRedirectTo:window.location.origin},
      });
      if(error)throw error;
      return {needsEmailConfirmation:!data.session};
    },
    async sendMagicLink(email){
      if(!supabase)throw new Error("Supabase is not configured");
      const {error}=await supabase.auth.signInWithOtp({
        email:email.trim(),
        options:{emailRedirectTo:window.location.origin},
      });
      if(error)throw error;
    },
    async signOut(){
      if(!supabase)return;
      const {error}=await supabase.auth.signOut({scope:"local"});
      if(error)throw error;
    },
  }),[loading,user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){
  const value=useContext(AuthContext);
  if(!value)throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
