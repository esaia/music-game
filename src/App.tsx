import { BrowserRouter, Routes, Route } from "react-router-dom";
import HostPage from "./pages/HostPage";
import PlayerPage from "./pages/PlayerPage";
import ProjectorPage from "./pages/ProjectorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlayerPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/projector" element={<ProjectorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
