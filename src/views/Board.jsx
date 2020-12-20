import { useState } from 'react';
import Section from '../components/Section';
import { DragDropContext } from 'react-beautiful-dnd';
import './styles/Board.css';

const INIT_STATE = {
    assigned: [{ task: 'abc' }, { task: 'bcd' }, { task: 'cde' }],
    ongoing: [{ task: 'def' }, { task: 'efg' }, { task: 'fgh' }],
    completed: [{ task: 'ghi' }, { task: 'hij' }, { task: 'jkl' }],
    verified: [{ task: 'klm' }, { task: 'lmn' }, { task: 'mno' }]
}

const sectionNames = Object.keys(INIT_STATE)

const Board = () => {
    const [sections, setSections] = useState(INIT_STATE);

    const handleOnDragEnd = result => {
        const { source, destination } = result

        const sourceCards = sections[sectionNames[source.droppableId]]
        const destinationCards = sections[sectionNames[destination.droppableId]]
        const cardToBeShifted = sourceCards[source.index]

        sourceCards.splice(source.index, 1)
        destinationCards.splice(destination.index, 0, cardToBeShifted)

        setSections(sections => {
            return {
                ...sections,
                [sectionNames[source.droppableId]]: sourceCards,
                [sectionNames[destination.droppableId]]: destinationCards
            }
        })
    }

    return (
        <>
            <h1>Board</h1>
            <div id="board">
                <div id="grid">
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        {sectionNames.map((sectionName, sectionIndex) => (
                            <div className="section-containers">
                                <Section sectionName={sectionName} sectionIndex={sectionIndex} cards={sections[sectionName]} />
                            </div>
                        ))}
                    </DragDropContext>
                </div>
            </div>
        </>
    )
}

export default Board