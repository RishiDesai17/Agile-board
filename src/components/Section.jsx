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
        const documentsSnapshot = await db.collection(`projects/kGS550UTeB1nYSQBYzPf/${sectionName}`)
            .orderBy("updatedAt")
            .startAfter(cards[cards.length - 1])
            .limit(10)
            .get()
        if(documentsSnapshot.docs.length > 0) {
            addCards(sectionName, documentsSnapshot.docs)
            setLoadMoreButton(true)
        }
        else {
            setLoadMoreButton(null)
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
                <div>
                    <Droppable droppableId={sectionIndex.toString()}>
                        {provided => (
                            <div {...provided.droppableProps} ref={provided.innerRef} style={{ height: '100%' }}>
                                {cards.length === 0 ? 
                                    <div id="infoContainer">
                                        <p>Nothing to see here</p>
                                    </div> 
                                : 
                                    cards.map((card, index) => (
                                        <Draggable draggableId={sectionName + " " + index.toString()} index={index} key={index}>
                                            {provided => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
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
                </div>
            }
        </div>
    )
}

export default Section