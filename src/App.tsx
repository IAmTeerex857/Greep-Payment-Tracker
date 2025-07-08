import { RouterProvider } from "react-router-dom";
import { DataProvider } from "./contexts/DataContext";
import { router } from "./router";

function App() {
  return (
    <DataProvider>
      <RouterProvider router={router} />
    </DataProvider>
  );
}

export default App;
