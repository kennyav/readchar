import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ReadSelfApp from "./pages/ReadSelfApp";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<ReadSelfApp />} />
        </Routes>
      </>
    </Suspense>
  );
}

export default App;
