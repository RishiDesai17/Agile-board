import './styles/Card.css';

const Card = ({ task }) => {
    return (
        <div id="card">
            <div>
                <div id="cardContainer">
                    <p>{task}</p>
                </div>
            </div>
        </div>
    )
}

export default Card