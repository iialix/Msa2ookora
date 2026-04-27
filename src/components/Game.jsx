export default function Game({ id, title, image }) {
    return (
        <div className="game-card">
            <div className="image-container">
                <img src={image} alt={title} className="game-image" />
            </div>
            <div className="game-info">
                <h3>{title}</h3>
            </div>
        </div>
    );
}
