export type Profile={id:string;displayName:string;avatarUrl?:string};
export type ChallengeGroup={id:string;name:string;timezone:string};
export type ChallengeGroupMember={groupId:string;userId:string};
export type Challenge={id:string;groupId:string;creatorId:string;targetUserId:string;title:string;status:"issued"|"accepted"|"completed"|"disputed";createdAt:string};
export type PointRule={id:string;groupId:string;version:number;actionType:string;category?:string;points:number;active:boolean};
export type Comment={id:string;groupId:string;authorId:string;body:string;createdAt:string};
export type WeeklyScore={userId:string;points:number};
