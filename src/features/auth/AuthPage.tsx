import {useState,type FormEvent} from "react";
import {Button,Card} from "../../components/ui";
import {useAuth} from "./AuthProvider";
import {validatePassword,type AuthMode} from "./auth-form";

export function AuthPage(){
  const {signIn,signUp,sendMagicLink}=useAuth();
  const [mode,setMode]=useState<AuthMode>("sign-in");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [submitting,setSubmitting]=useState(false);

  async function submit(event:FormEvent){
    event.preventDefault();
    const passwordError=validatePassword(mode,password);
    if(passwordError){setError(passwordError);return}
    setSubmitting(true);
    setError("");
    setMessage("");
    try{
      if(mode==="sign-in")await signIn(email,password);
      else{
        const result=await signUp(email,password);
        if(result.needsEmailConfirmation)setMessage("Check your email to confirm your account, then come back to sign in.");
      }
    }
    catch(reason){setError(reason instanceof Error?reason.message:"Account request failed")}
    finally{setSubmitting(false)}
  }

  async function requestMagicLink(){
    if(!email.trim()){setError("Enter your email first.");return}
    setSubmitting(true);setError("");setMessage("");
    try{
      await sendMagicLink(email);
      setMessage("Check your email for a sign-in link.");
    }catch(reason){setError(reason instanceof Error?reason.message:"Could not send the sign-in link")}
    finally{setSubmitting(false)}
  }

  function chooseMode(nextMode:AuthMode){
    setMode(nextMode);setError("");setMessage("");
  }

  const creating=mode==="create-account";
  return <main className="auth-page">
    <header className="auth-hero">
      <div className="auth-house" aria-hidden="true">⌂</div>
      <p className="auth-eyebrow">OUR PLACE</p>
      <h1>{creating?"Make your room key":"Come back home"}</h1>
      <p>Your account keeps your identity, goals, and shared household activity connected across devices.</p>
    </header>
    <Card className="auth-card">
      <div className="auth-tabs" aria-label="Account action">
        <button type="button" aria-pressed={!creating} className={!creating?"active":""} onClick={()=>chooseMode("sign-in")}>Sign in</button>
        <button type="button" aria-pressed={creating} className={creating?"active":""} onClick={()=>chooseMode("create-account")}>Create account</button>
      </div>
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)}/>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete={creating?"new-password":"current-password"} minLength={creating?8:undefined} required value={password} onChange={event=>setPassword(event.target.value)}/>
        {creating?<small>Use at least 8 characters. Supabase Auth handles the password; the app never stores it.</small>:null}
        {error?<p role="alert" className="error">{error}</p>:null}
        {message?<p role="status" className="success">{message}</p>:null}
        <Button type="submit" disabled={submitting}>{submitting?"Working…":creating?"Create my account":"Sign in"}</Button>
      </form>
      <button type="button" className="auth-link" disabled={submitting} onClick={()=>void requestMagicLink()}>Email me a sign-in link</button>
    </Card>
    <p className="auth-footnote">One personal account can join a shared household. Your private details stay attached to your account.</p>
  </main>;
}
