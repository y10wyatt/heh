import {NavLink,Outlet} from "react-router-dom";
import {uiContent} from "../config/ui-content";
export function AppShell(){return <div className="app-shell"><main><Outlet/></main><nav className="bottom-nav" aria-label="Primary">{uiContent.navigation.map(({to,icon,label})=><NavLink key={to} to={to} end={to==="/"}><span>{icon}</span>{label}</NavLink>)}</nav></div>}
