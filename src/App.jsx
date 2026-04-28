import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Root from "./Root";
import Home from "./pages/Home";
import PasswordChallenge from "./pages/passwordChallenge.jsx";
import BedonKalam from "./pages/BedonKalam.jsx";

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Root />,
            children: [
                {
                    index: true,
                    element: <Home />,
                },
                {
                    path: "/password-challenge",
                    element: <PasswordChallenge />,
                },
                {
                    path: "/bedon-kalam",
                    element: <BedonKalam />,
                },
            ],
        },
    ]);

    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}

export default App;
