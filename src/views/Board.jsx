import Section from '../components/Section';
import './styles/Board.css';

const Board = () => {
    return (
        <>
            <h1>Board</h1>
            <div id="board">
                <div id="grid">
                    {["Assigned","Ongoing","Completed", "Verfied"].map(sectionName => (
                        <div className="section-containers">
                            <Section sectionName={sectionName} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Board