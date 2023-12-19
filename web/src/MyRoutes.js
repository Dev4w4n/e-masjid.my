import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";

export default function MyRoutes() {
  return (
    <Routes>
      <Route path="/web" element={<Home />} />
    </Routes>
  );
}
