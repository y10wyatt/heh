import {BrowserRouter,Navigate,Route,Routes} from "react-router-dom";
import {AppShell} from "./app/AppShell";
import {AppDataProvider} from "./app/AppDataProvider";
import {QuickLogPage} from "./features/capture/QuickLogPage";
import {FeedPage} from "./features/challenges/FeedPage";
import {RoomActionResultPage,RaidPage,RoomViewPage,RoomsHomePage,TrapSetupPage} from "./features/rooms/RoomPages";
import {RulesPage} from "./features/rules/RulesPage";
import {ResultsPage,RewardsPage} from "./features/scoreboard/ScoreboardPages";
import {HomePage} from "./features/scoreboard/HomePage";
import {AuthProvider,useAuth} from "./features/auth/AuthProvider";
import {AuthPage} from "./features/auth/AuthPage";
import {GameDataProvider} from "./app/GameDataProvider";
function AppRoutes(){const {configured,loading,user}=useAuth();if(loading)return <main className="auth-page"><p role="status">Loading sibling crew…</p></main>;if(configured&&!user)return <AuthPage/>;return <AppDataProvider key={user?.id??"demo"}><GameDataProvider><BrowserRouter><Routes><Route element={<AppShell/>}><Route index element={<HomePage/>}/><Route path="today" element={<Navigate to="/" replace/>}/><Route path="log" element={<QuickLogPage/>}/><Route path="feed" element={<FeedPage/>}/><Route path="results" element={<ResultsPage/>}/><Route path="rules" element={<RulesPage/>}/><Route path="rewards" element={<RewardsPage/>}/><Route path="house" element={<RoomsHomePage/>}/><Route path="house/rooms/:roomId" element={<RoomViewPage/>}/><Route path="house/rooms/:roomId/raid" element={<RaidPage/>}/><Route path="house/rooms/:roomId/traps" element={<TrapSetupPage/>}/><Route path="rooms" element={<Navigate to="/house" replace/>}/><Route path="rooms/:roomId" element={<RoomViewPage/>}/><Route path="rooms/:roomId/raid" element={<RaidPage/>}/><Route path="rooms/:roomId/traps" element={<TrapSetupPage/>}/><Route path="room-action-result" element={<RoomActionResultPage/>}/></Route></Routes></BrowserRouter></GameDataProvider></AppDataProvider>}
export default function App(){return <AuthProvider><AppRoutes/></AuthProvider>}
