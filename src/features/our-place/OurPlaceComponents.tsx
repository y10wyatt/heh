import {Cross2Icon} from "@radix-ui/react-icons";
import type {PropsWithChildren,ReactNode} from "react";

export const ourPlaceArt=(name:string)=>`/assets/our-place/${name}.png`;

export function OurPlaceHeader({title,subtitle}: {title:string;subtitle:string}){
  return <header className="our-place-header"><div><h1>{title}</h1><p>{subtitle}</p></div><img src={ourPlaceArt("hamster-pair")} alt="Two sibling hamsters"/></header>;
}

export function Sheet({title,onClose,children}:PropsWithChildren<{title:string;onClose():void}>){
  return <div className="our-place-modal" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section role="dialog" aria-modal="true" aria-labelledby="our-place-sheet-title" className="our-place-sheet">
      <div className="our-place-sheet-heading"><h2 id="our-place-sheet-title">{title}</h2><button type="button" aria-label="Close" onClick={onClose}><Cross2Icon/></button></div>
      {children}
    </section>
  </div>;
}

export function LinkCard({icon,title,body,action}: {icon:ReactNode;title:string;body:string;action:ReactNode}){
  return <section className="our-place-link-card"><span className="link-card-icon" aria-hidden="true">{icon}</span><div><h2>{title}</h2><p>{body}</p>{action}</div></section>;
}

export function roomOwnerName(roomName:string,fallback:string){
  const owner=roomName.split(/[’']/)[0]?.trim();
  return owner||fallback;
}
