import { useState, useEffect, useRef } from 'react';
import Section from '../components/Section';
import ActivityIndicator from '../components/ActivityIndicator';
import AddTask from '../components/AddTask';
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
    const cardShiftMapper = useRef({})
    const [showSaveButton, setShowSaveButton] = useState(false) // true -> show button, false -> hide button, null -> activity indicator

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
            }
            else {
                console.log('server')
                const documentsSnapshot = await query.limit(10).get()
                documents = documentsSnapshot.docs
            }
            /*  Preserve last doc for each section so that if load more is pressed after some card from other section
                is shifted to last position in a given section, we dont lose track.
            */
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
        if(!destination) return   // if a card is dragged out of bounds

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
            if(destinationSection !== card.sectionName) {
                cardShiftMapper.current[card.id] = {
                    source: card.sectionName,
                    destination: destinationSection,
                    data: card.data()
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
                db.collection(`projects/kGS550UTeB1nYSQBYzPf/${card.destination}`).add(card.data)
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
            <div id="board">
                <div>
                    <div id="titleBar">
                        <h1 className="interFont indigoBlue" id="title">Board</h1>
                        <div className="centerSelf">
                            {showSaveButton === null ?
                                <ActivityIndicator />
                            :
                                showSaveButton && <div id="saveButtonContainer" onClick={save}>
                                    <div id="saveButton">
                                        <b className="interFont indigoBlue">SAVE</b>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="centerSelf">
                            <AddTask setSections={setSections} />
                        </div>
                    </div>
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
            </div>
        </>
    )
}

export default Board