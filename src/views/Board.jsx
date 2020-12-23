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
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        init()
    }, [])

    const init = async() => {
        try {
            const cardsMapper = {}
            await Promise.all(sectionNames.map(async section => {
                let cards;
                const lastDoc = await db.collection(`projects/kGS550UTeB1nYSQBYzPf/${section}`)
                    .orderBy("updatedAt", "desc")
                    .limit(1)
                    .get({ source: 'cache' })

                if(lastDoc.empty) {
                    cards = await fetchSectionCards({ section, fromCache: false })
                }
                else {
                    await refreshCache(section, lastDoc.docs[0])
                    cards = await fetchSectionCards({ section, fromCache: true })
                }
                
                cardsMapper[section] = cards
            }))
            localStorage.setItem('lastFetch', new Date())
            setSections(cardsMapper)
            setLoading(false)
        }
        catch(err) {
            console.log(err)
        }
    }

    const fetchSectionCards = async({ section, fromCache }) => {
        try {
            const query = db.collection(`projects/kGS550UTeB1nYSQBYzPf/${section}`).orderBy("updatedAt").limit(10)
            let documents;
            if(fromCache) {
                console.log('cache')
                const documentsSnapshot = await query.get({ source: 'cache' })
                documents = documentsSnapshot.docs
            }
            else {
                console.log('server')
                const documentsSnapshot = await query.get()
                documents = documentsSnapshot.docs
            }
            window[`lastDoc ${section}`] = documents[documents.length - 1]
            return documents
        }
        catch(err) {
            console.log(err)
        }
    }

    const refreshCache = async (section, lastDoc) => {
        console.log("refresh cache", section, lastDoc)
        try {
            const documentsSnapshot = await db.collection(`projects/kGS550UTeB1nYSQBYzPf/${section}`)
                .orderBy("updatedAt")
                .endAt(lastDoc)
                .where("updatedAt", ">", new Date(localStorage.lastFetch))
                .get();
            console.log(documentsSnapshot.docs)
        }
        catch(err) {
            console.log(err)
        }
    }

    const addCards = (sectionName, cards) => {
        setSections(sections => {
            return {
                ...sections,
                [sectionName]: [...sections[sectionName], ...cards]
            }
        })
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
                                <Section 
                                    sectionName={sectionName} 
                                    sectionIndex={sectionIndex} 
                                    cards={sections[sectionName]} 
                                    addCards={addCards}
                                    loading={loading}
                                />
                            </div>
                        ))}
                    </DragDropContext>
                </div>
            </div>
        </>
    )
}

export default Board