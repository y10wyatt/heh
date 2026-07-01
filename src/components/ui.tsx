import type {ButtonHTMLAttributes,PropsWithChildren} from "react";
import {VisualAsset} from "./VisualAsset";
export const Card=({children,className=""}:PropsWithChildren<{className?:string}>)=><section className={`card ${className}`}>{children}</section>;
export const Button=({children,className="",type="button",...props}:ButtonHTMLAttributes<HTMLButtonElement>)=><button type={type} className={`button ${className}`} {...props}>{children}</button>;
export const StatusChip=({children,tone="green"}:PropsWithChildren<{tone?:"green"|"orange"|"blue"}>)=><span className={`chip ${tone}`} role="status">{children}</span>;
export const PageHeader=({title,subtitle}: {title:string;subtitle:string})=><header className="page-header"><VisualAsset asset="mascot" className="mascot"/><h1>{title}</h1><p>{subtitle}</p></header>;
