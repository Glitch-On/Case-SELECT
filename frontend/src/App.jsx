import { Route, Routes } from "react-router-dom";

import { Dashboard } from "./pages/Dashboard.jsx";
import { GameScreen } from "./pages/GameScreen.jsx";
import { PlaceholderPage } from "./pages/PlaceholderPage.jsx";

/**
 * Frontend routes.
 *
 * The dashboard is the entry point; a case id opens its investigation screen.
 * Evidence / notes / profile are honest placeholders that name the endpoint
 * they still need (see SUGGESTED_IMPROVEMENTS.md).
 *
 * The SQL IDE is not a route here — it is served by the backend at "/" and is
 * reached through the sidebar link or the in-game terminal.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/cases" element={<Dashboard />} />
      <Route path="/game/:caseId" element={<GameScreen />} />
      <Route path="/evidence" element={<PlaceholderPage section="evidence" />} />
      <Route path="/notes" element={<PlaceholderPage section="notes" />} />
      <Route path="/profile" element={<PlaceholderPage section="profile" />} />
      <Route path="*" element={<PlaceholderPage />} />
    </Routes>
  );
}

export default App;
