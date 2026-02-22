import { BrowserRouter, Routes, Route } from "react-router-dom";
import HostPage from "./pages/HostPage";
import PlayerPage from "./pages/PlayerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlayerPage />} />
        <Route path="/host" element={<HostPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
