export type AuthMode="sign-in"|"create-account";

export function validatePassword(mode:AuthMode,password:string){
  if(!password)return "Enter your password.";
  if(mode==="create-account"&&password.length<8)return "Use at least 8 characters.";
  return "";
}
