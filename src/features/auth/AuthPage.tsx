import {useState,type FormEvent} from "react";
import {Button,Card,PageHeader} from "../../components/ui";
import {useAuth} from "./AuthProvider";

export function AuthPage(){
  const {signIn}=useAuth();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [submitting,setSubmitting]=useState(false);

  async function submit(event:FormEvent){
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try{await signIn(email,password)}
    catch(reason){setError(reason instanceof Error?reason.message:"Sign in failed")}
    finally{setSubmitting(false)}
  }

  return <main className="auth-page">
    <PageHeader title="Board the Showdown" subtitle="Sign in with your sibling challenge account"/>
    <Card>
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)}/>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)}/>
        {error?<p role="alert" className="error">{error}</p>:null}
        <Button type="submit" disabled={submitting}>{submitting?"Signing in…":"Sign in"}</Button>
      </form>
    </Card>
  </main>;
}
