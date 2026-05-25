import Header from "./components/Header";
import Footer from "./components/Footer";
import { TeamProvider } from "./context/TeamContext";

import { Outlet } from "react-router-dom";

export default function Root() {
    return (
        <TeamProvider>
            <Header></Header>
            <main>
                <Outlet />
            </main>
            <Footer></Footer>
        </TeamProvider>
    );
}
