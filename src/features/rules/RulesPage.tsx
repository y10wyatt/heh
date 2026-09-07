import {useAppData} from "../../app/AppDataProvider";
import {Card,PageHeader} from "../../components/ui";
import {uiContent} from "../../config/ui-content";

export function RulesPage(){
  const copy=uiContent.rules;
  const {rules,loading,error}=useAppData();
  return <><PageHeader title={copy.title} subtitle={copy.subtitle}/>
    {error?<p role="alert" className="error">{error}</p>:null}
    {loading?<p role="status">Loading rules…</p>:rules.map(rule=><Card className="rule" key={rule.id}><div><h2>{rule.actionType.replaceAll("_"," ")}</h2><small>Version {rule.version} · applies to new previews</small></div><strong>{rule.points>0?"+":""}{rule.points}</strong></Card>)}
    <Card><h2>{copy.historyTitle}</h2><p>{copy.historyBody}</p></Card>
  </>;
}
