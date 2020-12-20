import { useState, useEffect } from 'react';
import Section from '../components/Section';
import { db } from '../firebase';
import { DragDropContext } from 'react-beautiful-dnd';
import './styles/Board.css';

const INIT_STATE = {
    assigned: [],
    ongoing: [],
    completed: [],
    verified: []
}

const sectionNames = Object.keys(INIT_STATE)

const Board = () => {
    const [sections, setSections] = useState(INIT_STATE);

    useEffect(() => {
        init()
    }, [])

    const init = async() => {
        try{
            const cardsMapper = {}
            await Promise.all(sectionNames.map(async section => {
                cardsMapper[section] = await fetchSectionCards(section)
            }))
            setSections(cardsMapper)
        }
        catch(err) {
            console.log(err)
        }
    }

    const fetchSectionCards = async section => {
        try {
            const querySnapshot = await db.collection(`projects/kGS550UTeB1nYSQBYzPf/${section}`).get()
            const sectionCards = querySnapshot.docs.map(doc => {
                return doc.data()
            })
            console.log(sectionCards)
            return sectionCards
        }
        catch(err) {
            console.log(err)
        }
    }

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