import {Link} from "react-router-dom";
import {Card,Button,PageHeader} from "../../components/ui";
import {VisualAsset} from "../../components/VisualAsset";
import {uiContent} from "../../config/ui-content";
import {rules,users} from "../../dev/seed";
import {ScoringService} from "../../domain/services/scoring-service";
import {useAppData} from "../../app/AppDataProvider";

export function HomePage(){
  const copy=uiContent.home;
  const {events}=useAppData();
  const totals=new ScoringService().totals(events,rules);
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/>
    <Card className="score"><div><b>William</b><strong>{totals[users.william]??42}</strong><small>{copy.pointsLabel}</small></div><VisualAsset asset="trophy"/><div><b>Sister</b><strong>{totals[users.sister]??38}</strong><small>{copy.pointsLabel}</small></div></Card>
    <div className="actions">{copy.actions.map(action=><Link key={action.to} to={action.to}>{action.label}</Link>)}</div>
    <Card><h2>{copy.todayTitle}</h2><div className="today">{copy.today.map(item=><span key={item}>{item}</span>)}</div></Card></>;
}

export function ResultsPage(){
  const copy=uiContent.results;
  const values=[18,26,22,30,28,24,14];
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/>
    <Card className="leader"><VisualAsset asset="williamAvatar"/><div><h2>William</h2><b>{copy.leaderLabel}</b><p>{copy.leadSummary}</p></div><strong>162<small>points</small></strong></Card>
    <Card><h2>{copy.chartTitle}</h2><div className="chart">{values.map((value,index)=><div key={`${copy.dayLabels[index]}-${index}`}><i style={{height:value*2}}/><i className="sister" style={{height:(value-4)*2}}/><small>{copy.dayLabels[index]}</small></div>)}</div></Card>
    <Button>{copy.finalizeLabel}</Button><p className="hint">{copy.finalizeHint}</p></>;
}
