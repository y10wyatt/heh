import type {ActionEvent} from "../models/action-event";
import type {PointRule} from "../models/core";
export type ScoredEvent={event:ActionEvent;points:number;ruleId?:string;ruleVersion?:number};
export class ScoringService {
  score(events:ActionEvent[],rules:PointRule[]):ScoredEvent[]{return events.map(event=>{const rule=rules.filter(r=>r.active&&r.actionType===event.actionType&&(!r.category||r.category===event.category)).reduce<PointRule|undefined>((latest,candidate)=>!latest||candidate.version>latest.version?candidate:latest,undefined);return{event,points:rule?.points??0,ruleId:rule?.id,ruleVersion:rule?.version}})}
  totals(events:ActionEvent[],rules:PointRule[]){return this.score(events,rules).reduce<Record<string,number>>((a,x)=>({...a,[x.event.userId]:(a[x.event.userId]??0)+x.points}),{})}
}
