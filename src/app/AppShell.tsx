import {NavLink,Outlet} from "react-router-dom";
import {CheckboxIcon,HomeIcon,PersonIcon} from "@radix-ui/react-icons";

const navigation=[
  {to:"/today",label:"Today",Icon:CheckboxIcon},
  {to:"/",label:"Home",Icon:HomeIcon},
  {to:"/me",label:"Me",Icon:PersonIcon},
];

export function AppShell(){return <div className="app-shell our-place-shell"><main><Outlet/></main><nav className="bottom-nav" aria-label="Primary">{navigation.map(({to,label,Icon})=><NavLink key={to} to={to} end={to==="/"}><Icon aria-hidden="true"/><span>{label}</span></NavLink>)}</nav></div>}
