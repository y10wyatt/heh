import type {VisualAssetKey} from "../config/visual-assets";
import {visualAssets} from "../config/visual-assets";

export function VisualAsset({asset,className=""}:{asset:VisualAssetKey;className?:string}) {
  const value=visualAssets[asset];
  return value.src
    ? <img className={className} src={value.src} alt={value.alt} style={{width:"1em",height:"1em",objectFit:"contain"}}/>
    : <span className={className} role="img" aria-label={value.alt}>{value.fallback}</span>;
}
