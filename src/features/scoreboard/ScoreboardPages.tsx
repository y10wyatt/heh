import {Card,Button,PageHeader} from "../../components/ui";
import {VisualAsset} from "../../components/VisualAsset";
import {uiContent} from "../../config/ui-content";
import {useGameData} from "../../app/GameDataProvider";
import {useState} from "react";


export function ResultsPage(){
  const copy=uiContent.results;
  const values=[18,26,22,30,28,24,14];
  const {finalizeDay,dailyResult}=useGameData();
  const [finalizing,setFinalizing]=useState(false);
  const [error,setError]=useState("");
  async function finalize(){setFinalizing(true);setError("");try{await finalizeDay()}catch(reason){setError(reason instanceof Error?reason.message:"Unable to finalize day")}finally{setFinalizing(false)}}
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/>
    <Card className="leader"><VisualAsset asset="williamAvatar"/><div><h2>William</h2><b>{copy.leaderLabel}</b><p>{copy.leadSummary}</p></div><strong>162<small>points</small></strong></Card>
    <Card><h2>{copy.chartTitle}</h2><div className="chart">{values.map((value,index)=><div key={`${copy.dayLabels[index]}-${index}`}><i style={{height:value*2}}/><i className="sister" style={{height:(value-4)*2}}/><small>{copy.dayLabels[index]}</small></div>)}</div></Card>
    {error?<p role="alert" className="error">{error}</p>:null}
    {dailyResult?<Card><h2>{dailyResult.tie?"Today is a tie":"Day finalized"}</h2><p>{dailyResult.localDate} · {Object.values(dailyResult.scores).join(" vs ")} points</p></Card>:null}
    <Button onClick={finalize} disabled={finalizing}>{finalizing?"Finalizing…":dailyResult?"Finalized ✓":copy.finalizeLabel}</Button><p className="hint">{copy.finalizeHint}</p></>;
}

export function RewardsPage(){
  const copy=uiContent.rewards;
  const {entitlements}=useGameData();
  const mischief=entitlements.filter(item=>item.entitlementType==="mischief").length;
  const defense=entitlements.filter(item=>item.entitlementType==="defense").length;
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/>
    <Card className="reward-summary"><div><strong>24</strong><small>coins</small></div><div><strong>{mischief}</strong><small>mischief</small></div><div><strong>{defense}</strong><small>defense</small></div><VisualAsset asset="williamFullBody"/></Card>
    <Card className="current-look"><VisualAsset asset="williamFullBody"/><div><h2>{copy.currentLookTitle}</h2><p>{copy.currentLookBody}</p></div></Card>
    <h2 className="screen-section">Cosmetics</h2>
    <div className="reward-grid">{copy.items.map(item=><Card className="reward-item" key={item.name}><span>{item.icon}</span><b>{item.name}</b><small>{item.state}</small></Card>)}</div>
    <Card className="coming-soon"><h2>✦ {copy.comingSoonTitle} ✦</h2><p>{copy.comingSoonBody}</p></Card>
  </>;
}
