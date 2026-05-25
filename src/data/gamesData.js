/**
 * Single source of truth for all games in the platform.
 * Used by GamesList, Tournament, and anywhere else that needs the full game catalog.
 * When you add a new game, just add it here and it will appear everywhere.
 */
const gamesData = [
    {
        id: 1,
        title: "Password Challenge",
        image: "/Password.webp",
        urlText: "password-challenge",
    },
    {
        id: 2,
        title: "بدون كلام",
        image: "/bedonKalam.webp",
        urlText: "bedon-kalam",
    },
    {
        id: 3,
        title: "أنا مين",
        image: "/anameen.webp",
        urlText: "ana-meen",
    },
    {
        id: 4,
        title: "offside",
        image: "/offside.webp",
        urlText: "offside",
    },
    {
        id: 5,
        title: "بنك",
        image: "/bank.webp",
        urlText: "bank",
    },
    {
        id: 6,
        title: "Top 10",
        image: "/top10.webp",
        urlText: "top10",
    },
    {
        id: 7,
        title: "خمسة × عشرة",
        image: "/fivexten.webp",
        urlText: "fivexten",
    },
    {
        id: 8,
        title: "Risk",
        image: "/risk.webp",
        urlText: "risk",
    },
    {
        id: 9,
        title: "Infinity XO",
        image: "/infinityxo.webp",
        urlText: "infinityxo",
    },
    {
        id: 10,
        title: "XO",
        image: "/xo.webp",
        urlText: "xo",
    },
    {
        id: 11,
        title: "XOXO",
        image: "/xo.webp",
        urlText: "xoxo",
    },
    {
        id: 12,
        title: "Connect 4",
        image: "/connect4.webp",
        urlText: "connect4",
    },
];

export default gamesData;
