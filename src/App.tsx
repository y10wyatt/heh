import {BrowserRouter,Route,Routes} from "react-router-dom";
import {AppShell} from "./app/AppShell";
import {AppDataProvider} from "./app/AppDataProvider";
import {QuickLogPage} from "./features/capture/QuickLogPage";
import {FeedPage} from "./features/challenges/FeedPage";
import {RoomActionResultPage,RaidPage,RoomViewPage,RoomsHomePage,TrapSetupPage} from "./features/rooms/RoomPages";
import {RulesPage} from "./features/rules/RulesPage";
import {HomePage,ResultsPage} from "./features/scoreboard/ScoreboardPages";
export default function App(){return <AppDataProvider><BrowserRouter><Routes><Route element={<AppShell/>}><Route index element={<HomePage/>}/><Route path="log" element={<QuickLogPage/>}/><Route path="feed" element={<FeedPage/>}/><Route path="results" element={<ResultsPage/>}/><Route path="rules" element={<RulesPage/>}/><Route path="rooms" element={<RoomsHomePage/>}/><Route path="rooms/:roomId" element={<RoomViewPage/>}/><Route path="rooms/:roomId/raid" element={<RaidPage/>}/><Route path="rooms/:roomId/traps" element={<TrapSetupPage/>}/><Route path="room-action-result" element={<RoomActionResultPage/>}/></Route></Routes></BrowserRouter></AppDataProvider>}
