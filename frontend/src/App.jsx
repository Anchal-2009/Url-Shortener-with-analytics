import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/home";
import Auth from "./pages/auth";
import Dashboard from "./pages/dashboard";
import CreateLink from "./pages/createLink";
import MyLinks from "./pages/myLinks";
import Analytics from "./pages/analytics";
import Settings from "./pages/settings";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/createlink" element={<CreateLink />} />
          <Route path="/mylinks" element={<MyLinks />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
