import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./App.css";
import Root from "./Root";
import Home from "./pages/Home";

// Lazy-load all game pages — they'll be split into separate chunks
const PasswordChallenge = lazy(() => import("./pages/passwordChallenge.jsx"));
const BedonKalam = lazy(() => import("./pages/BedonKalam.jsx"));
const AnaMeen = lazy(() => import("./pages/AnaMeen.jsx"));
const Offside = lazy(() => import("./pages/Offside.jsx"));
const Bank = lazy(() => import("./pages/Bank.jsx"));
const TopTen = lazy(() => import("./pages/TopTen.jsx"));
const FivexTen = lazy(() => import("./pages/FivexTen.jsx"));
const Risk = lazy(() => import("./pages/Risk.jsx"));
const InfinityXO = lazy(() => import("./pages/InfinityXO"));
const TicTacToe = lazy(() => import("./components/TicTacToe"));
const Connect4 = lazy(() => import("./pages/Connect4.jsx"));
const Tournament = lazy(() => import("./pages/Tournament.jsx"));

// Loading fallback for lazy-loaded pages
function PageLoader() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
                color: "rgba(255,255,255,0.5)",
                fontSize: "1.2rem",
            }}>
            <div className="loading-spinner" />
        </div>
    );
}

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
                path: "/tournament",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Tournament />
                    </Suspense>
                ),
            },
            {
                path: "/password-challenge",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <PasswordChallenge />
                    </Suspense>
                ),
            },
            {
                path: "/bedon-kalam",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <BedonKalam />
                    </Suspense>
                ),
            },
            {
                path: "/ana-meen",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <AnaMeen />
                    </Suspense>
                ),
            },
            {
                path: "/offside",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Offside />
                    </Suspense>
                ),
            },
            {
                path: "/bank",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Bank />
                    </Suspense>
                ),
            },
            {
                path: "/top10",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <TopTen />
                    </Suspense>
                ),
            },
            {
                path: "/fivexten",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <FivexTen />
                    </Suspense>
                ),
            },
            {
                path: "/risk",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Risk />
                    </Suspense>
                ),
            },
            {
                path: "/infinityxo",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <InfinityXO />
                    </Suspense>
                ),
            },
            {
                path: "/xo",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <TicTacToe override={false} />
                    </Suspense>
                ),
            },
            {
                path: "/xoxo",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <TicTacToe override={true} />
                    </Suspense>
                ),
            },
            {
                path: "/connect4",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Connect4 />
                    </Suspense>
                ),
            },
        ],
    },
]);

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}

export default App;
