import { useState, useEffect, useRef } from 'react';
import Section from '../components/Section';
import { db } from '../firebase';
import { DragDropContext } from 'react-beautiful-dnd';
import './styles/Board.css';
import ActivityIndicator from '../components/ActivityIndicator';

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
    const cardShiftMapper = useRef({})
    const [showSaveButton, setShowSaveButton] = useState(false)

    useEffect(() => {
        init()
    }, [])

    const init = async() => {
        try {
            const cardsMapper = {}
            await Promise.all(sectionNames.map(async section => {
                let cards;
                const lastDoc = await db.collection(`projects/kGS550UTeB1nYSQBYzPf/${section}`)
                    .orderBy("createdAt")
                    .limit(1)
                    .get({ source: 'cache' })
                console.log(lastDoc)

                if(lastDoc.empty) {
                    cards = await fetchSectionCards({ section, fromCache: false })
                }
                else {
                    cards = await fetchSectionCards({ section, fromCache: true })
                }
                
                cards.forEach(card => {
                    card.sectionName = section
                })
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
            const query = db.collection(`projects/kGS550UTeB1nYSQBYzPf/${section}`).orderBy("createdAt")
            let documents;
            if(fromCache) {
                console.log('cache')
                const documentsSnapshot = await query.limit(10).get({ source: 'cache' })
                documents = documentsSnapshot.docs
                
                if(documents.length < 10) {
                    console.log("newDocs server", section)
                    const newDocs = await query.startAfter(documents[documents.length - 1]).limit(10 - documents.length).get()
                    documents.concat(newDocs.docs)
                }
            }
            else {
                console.log('server')
                const documentsSnapshot = await query.limit(10).get()
                documents = documentsSnapshot.docs
            }
            window[`lastDoc ${section}`] = documents[documents.length - 1]
            return documents
        }
        catch(err) {
            console.log(err)
        }
    }

    const addCards = (sectionName, cards) => {
        cards.forEach(card => {
            card.sectionName = sectionName
        })
        setSections(sections => {
            return {
                ...sections,
                [sectionName]: [...sections[sectionName], ...cards]
            }
        })
    }

    const handleOnDragEnd = result => {
        const { source, destination } = result

        const sourceSection = sectionNames[source.droppableId]
        const destinationSection = sectionNames[destination.droppableId]

        const sourceCards = sections[sourceSection]
        const destinationCards = sections[destinationSection]
        const cardToBeShifted = sourceCards[source.index]

        trackChanges(cardToBeShifted, destinationSection)

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

    const trackChanges = (card, destinationSection) => {
        if(card.sectionName === destinationSection) return
        const shiftedCard = cardShiftMapper.current[card.id]
        
        if(shiftedCard) {
            if(destinationSection === card.sectionName) {
                delete cardShiftMapper.current[card.id]
            }
            else {
                cardShiftMapper.current[card.id].destination = destinationSection
            }
        }
        else {
            cardShiftMapper.current[card.id] = {
                source: card.sectionName,
                destination: destinationSection,
                data: {
                    ...card.data()
                }
            }
        }

        if(Object.keys(cardShiftMapper.current).length > 0) {
            setShowSaveButton(true)
        }
        else {
            setShowSaveButton(false)
        }
    }

    const save = async() => {
        try {
            setShowSaveButton(null)
            const cardIDs = Object.keys(cardShiftMapper.current)
            await Promise.all(cardIDs.map(cardID => {
                const card = cardShiftMapper.current[cardID]
                db.collection(`projects/kGS550UTeB1nYSQBYzPf/${card.destination}`).add({
                    ...card.data
                })
                db.collection(`projects/kGS550UTeB1nYSQBYzPf/${card.source}`).doc(cardID).delete()
            }))
            setShowSaveButton(false)
        }
        catch(err) {
            console.log(err)
        }
    }

    return (
        <>
            <h1>Board</h1>
            {showSaveButton === null ? <ActivityIndicator /> : showSaveButton && (
                <div style={{ position: 'absolute', right: 25, top: 25 }}>
                    <button onClick={save}>SAVE</button>
                </div>
            )}
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