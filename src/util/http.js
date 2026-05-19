import { exp } from "three/tsl";

export async function fetchPasswordPlayers() {
    const response = await fetch("http://localhost:8080/password");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch password players");
    }

    return data;
}

export async function fetchChangePlayer() {
    const response = await fetch("http://localhost:8080/changePlayer");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch change player");
    }

    return data;
}

export async function fetchBedonKalam() {
    const response = await fetch("http://localhost:8080/bedonkalam");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch change player");
    }

    return data;
}

export async function fetchAnaMeen() {
    const response = await fetch("http://localhost:8080/anaMeen");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch change player");
    }

    return data;
}

export async function fetchOffside() {
    const response = await fetch("http://localhost:8080/offside");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch change player");
    }
    return data;
}

export async function fetchBank() {
    const response = await fetch("http://localhost:8080/bank");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch change player");
    }
    return data;
}

export async function fetchTopTen() {
    const response = await fetch("http://localhost:8080/topTen");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch top 10 players");
    }
    return data;
}

export async function fetchFivexTen() {
    const response = await fetch("http://localhost:8080/fiveXten");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch 5x10 players");
    }
    return data;
}

export async function fetchRisk() {
    const response = await fetch("http://localhost:8080/risk");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch risk players");
    }
    return data;
}

export async function fetchInfinity() {
    const response = await fetch("http://localhost:8080/infinityXO");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch infinity players");
    }
    return data;
}

export async function fetchxo() {
    const response = await fetch("http://localhost:8080/xo");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch XO players");
    }
    return data;
}

export async function fetchReplacement(type) {
    const url =
        type === "col"
            ? "http://localhost:8080/changeXOColumn"
            : "http://localhost:8080/changeXORow";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    // API returns { Row: [{...}] } or { Column: [{...}] }
    const key = type === "col" ? "Column" : "Row";
    return data[key][0];
}

export async function fetchConnect4() {
    const response = await fetch("http://localhost:8080/ConnectFour");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch Connect4 game state");
    }
    return data;
}
