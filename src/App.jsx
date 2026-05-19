import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Root from "./Root";
import Home from "./pages/Home";
import PasswordChallenge from "./pages/passwordChallenge.jsx";
import BedonKalam from "./pages/BedonKalam.jsx";
import AnaMeen from "./pages/AnaMeen.jsx";
import Offside from "./pages/Offside.jsx";
import Bank from "./pages/Bank.jsx";
import TopTen from "./pages/TopTen.jsx";
import FivexTen from "./pages/FivexTen.jsx";
import Risk from "./pages/Risk.jsx";
import InfinityXO from "./pages/InfinityXO";
import TicTacToe from "./components/TicTacToe";
import Connect4 from "./pages/Connect4.jsx";

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
                {
                    path: "/ana-meen",
                    element: <AnaMeen />,
                },
                {
                    path: "/offside",
                    element: <Offside />,
                },
                {
                    path: "/bank",
                    element: <Bank />,
                },
                {
                    path: "/top10",
                    element: <TopTen />,
                },
                {
                    path: "/fivexten",
                    element: <FivexTen />,
                },
                {
                    path: "/risk",
                    element: <Risk />,
                },
                {
                    path: "/infinityxo",
                    element: <InfinityXO />,
                },
                {
                    path: "/xo",
                    element: <TicTacToe override={false} />,
                },
                {
                    path: "/xoxo",
                    element: <TicTacToe override={true} />,
                },
                {
                    path: "/connect4",
                    element: <Connect4 />,
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
