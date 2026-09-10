import {useState,type FormEvent} from "react";
import {useAppData} from "../../app/AppDataProvider";
import type {HouseholdOnboardingInput} from "../../domain/models/household";

const avatars=["hamster-orange","hamster-blue","hamster-pink"];
const doorColors=["honey","sage","sky","peach"];

export function OnboardingPage(){
  const {household,createHousehold,joinHousehold,completeOnboarding}=useAppData();
  const [mode,setMode]=useState<"create"|"join">("create");
  const [householdName,setHouseholdName]=useState("Our place");
  const [inviteCode,setInviteCode]=useState("");
  const [displayName,setDisplayName]=useState("");
  const [avatarId,setAvatarId]=useState(avatars[0]);
  const [annoyanceLevel,setAnnoyanceLevel]=useState<HouseholdOnboardingInput["annoyanceLevel"]>("playful");
  const [doorColor,setDoorColor]=useState(doorColors[0]);
  const [doorSign,setDoorSign]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const completingExisting=!!household&&!household.onboardingCompleted;

  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setError("");
    const input={displayName:displayName.trim(),avatarId,annoyanceLevel,doorColor,doorSign};
    try{
      if(completingExisting)await completeOnboarding(input);
      else if(mode==="create")await createHousehold({...input,householdName:householdName.trim()});
      else await joinHousehold(inviteCode,input);
    }catch(reason){setError(reason instanceof Error?reason.message:"Onboarding could not be saved. Please retry.")}
    finally{setBusy(false)}
  }

  return <main className="onboarding-page">
    <div className="onboarding-card">
      <p className="onboarding-kicker">OUR PLACE</p>
      <h1>{completingExisting?"Finish your room":"Make a little home together"}</h1>
      <p>{completingExisting?"Choose how you want your corner to feel.":"Create a household for your sibling crew, or join one with an invite code."}</p>
      {!completingExisting?<div className="onboarding-mode" role="tablist" aria-label="Household setup"><button type="button" role="tab" aria-selected={mode==="create"} onClick={()=>setMode("create")}>Create home</button><button type="button" role="tab" aria-selected={mode==="join"} onClick={()=>setMode("join")}>Join home</button></div>:null}
      <form onSubmit={submit} className="onboarding-form">
        {mode==="create"&&!completingExisting?<label>Home name<input value={householdName} onChange={event=>setHouseholdName(event.target.value)} maxLength={60} required/></label>:null}
        {mode==="join"&&!completingExisting?<label>Invite code<input value={inviteCode} onChange={event=>setInviteCode(event.target.value.toUpperCase())} maxLength={8} minLength={8} pattern="[A-F0-9]{8}" placeholder="8 letters or numbers" required/></label>:null}
        <label>Your name<input value={displayName} onChange={event=>setDisplayName(event.target.value)} maxLength={40} placeholder="What should they call you?" required/></label>
        <fieldset><legend>Pick a little face</legend><div className="onboarding-options">{avatars.map(avatar=><button type="button" key={avatar} aria-pressed={avatarId===avatar} onClick={()=>setAvatarId(avatar)}>{avatar.replace("hamster-","")}</button>)}</div></fieldset>
        <label>Sibling mischief<select value={annoyanceLevel} onChange={event=>setAnnoyanceLevel(event.target.value as HouseholdOnboardingInput["annoyanceLevel"])}><option value="gentle">Gentle · notes and gifts</option><option value="playful">Playful · pillows welcome</option><option value="chaos">Chaos · bring it on</option></select></label>
        <fieldset><legend>Door color</legend><div className="onboarding-options">{doorColors.map(color=><button type="button" key={color} aria-pressed={doorColor===color} onClick={()=>setDoorColor(color)}>{color}</button>)}</div></fieldset>
        <label>Door sign <span className="optional">optional</span><input value={doorSign} onChange={event=>setDoorSign(event.target.value)} maxLength={30} placeholder="Come in, nerd"/></label>
        {error?<p role="alert" className="our-place-error">{error}</p>:null}
        <button className="our-place-primary" disabled={busy}>{busy?"Setting things up…":completingExisting?"Finish my corner":mode==="create"?"Open our home":"Join our home"}</button>
      </form>
    </div>
  </main>;
}
