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
