export type HouseholdState={
  groupId:string;
  groupName:string;
  memberRole:string;
  memberCount:number;
  onboardingCompleted:boolean;
};

export type HouseholdOnboardingInput={
  displayName:string;
  avatarId:string;
  annoyanceLevel:"gentle"|"playful"|"chaos";
  doorColor?:string;
  doorSign?:string;
};

export type CreateHouseholdInput=HouseholdOnboardingInput&{householdName:string};

export interface HouseholdRepository{
  state():Promise<HouseholdState|null>;
  create(input:CreateHouseholdInput):Promise<string>;
  join(inviteCode:string,input:HouseholdOnboardingInput):Promise<string>;
  complete(groupId:string,input:HouseholdOnboardingInput):Promise<void>;
}
