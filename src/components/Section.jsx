import { useEffect, useState } from 'react';
import Card from './Card';
import ActivityIndicator from './ActivityIndicator';
import { db } from '../firebase';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import './styles/Section.css';

const Section = ({ sectionName, sectionIndex, cards, addCards, loading }) => {
    const [loadMoreButton, setLoadMoreButton] = useState(null)

    useEffect(() => {
        if(cards.length >= 10) {
            setLoadMoreButton(true)
        }
    }, [loading])

    const loadMoreCards = async() => {
        setLoadMoreButton(false)
        console.log(window[`lastDoc ${sectionName}`])
        const query = db.collection(`projects/kGS550UTeB1nYSQBYzPf/${sectionName}`).orderBy("createdAt")
        
        const documentsSnapshot = await query.startAfter(window[`lastDoc ${sectionName}`]).limit(10).get({ source: 'cache' })
        let documents = documentsSnapshot.docs
        console.log('cache loadMore')
        console.log(documents)
        console.log(cards)

        if(documents.length < 10) {
            console.log('server loadMore')
            let lastDoc = window[`lastDoc ${sectionName}`]
            if(documents.length > 0) {
                lastDoc = documents[documents.length - 1]
            }
            
            const newDocumentsSnapshot = await query.startAfter(lastDoc).limit(10 - documents.length).get()
            const newDocs = newDocumentsSnapshot.docs
            console.log(newDocs)
            documents = documents.concat(newDocs)
        }

        if(documents.length !== 0) {
            addCards(sectionName, documents)
            console.log("x")
            window[`lastDoc ${sectionName}`] = documents[documents.length - 1]
        }

        if(documents.length < 10) {
            setLoadMoreButton(null)
        }
        else {
            setLoadMoreButton(true)
        }
    }

    return (
        <div id="section">
            <h4>{sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h4>
            {loading ? 
                <div id="infoContainer">
                    <ActivityIndicator />
                </div>
            :
                <Droppable droppableId={sectionIndex.toString()}>
                    {provided => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {cards.length === 0 ? 
                                <div id="infoContainer">
                                    <p>Nothing to see here</p>
                                </div> 
                            : 
                                cards.map((card, index) => (
                                    <Draggable draggableId={sectionName + " " + index.toString()} index={index} key={index}>
                                        {provided => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                {/* {console.log(sectionName, card.id)} */}
                                                <Card cardData={card.data()} />
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            )}
                            <div>
                                {(cards.length > 0 && loadMoreButton !== null) && (
                                    loadMoreButton ? 
                                        <button onClick={loadMoreCards}>Load More</button> 
                                    : 
                                        <ActivityIndicator />
                                    )
                                }
                            </div>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            }
        </div>
    )
}

export default Section