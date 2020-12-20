import Section from '../components/Section';
import { DragDropContext } from 'react-beautiful-dnd';
import './styles/Board.css';

const Board = () => {
    return (
        <>
            <h1>Board</h1>
            <div id="board">
                <div id="grid">
                    <DragDropContext>
                        {["Assigned","Ongoing","Completed", "Verfied"].map(sectionName => (
                            <div className="section-containers">
                                <Section sectionName={sectionName} />
                            </div>
                        ))}
                    </DragDropContext>
                </div>
            </div>
        </>
    )
}

export default Board