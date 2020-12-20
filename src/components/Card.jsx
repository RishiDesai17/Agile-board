import './styles/Card.css';

const Card = ({ id }) => {
    return (
        <div id="card">
            <div>
                <div id="cardContainer">
                    <p>{id}</p>
                </div>
            </div>
        </div>
    )
}

export default Card