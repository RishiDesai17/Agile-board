import { useEffect, useState } from 'react';
import Card from './Card';
import ActivityIndicator from './ActivityIndicator';
import { db } from '../firebase';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import './styles/Section.css';

const Section = ({ sectionName, sectionIndex, cards, addCards, loading }) => {
    const [loadMoreButton, setLoadMoreButton] = useState(false)  // true -> button shown, false -> button not shown, null -> activity indicator

    useEffect(() => {
        if(!loading){
            checkForUpdates()
        }
    }, [loading])

    const checkForUpdates = async() => {
        if(cards.length < 10) {   // if cards received from cache are lesser than 10, check if any new cards are there in server
            setLoadMoreButton(null)
            const query = db.collection(`projects/kGS550UTeB1nYSQBYzPf/${sectionName}`).orderBy("createdAt")
            const newDocs = await checkForNewCards(query, window[`lastDoc ${sectionName}`], cards)
            addCards(sectionName, newDocs)
            // if after getting new cards, the total is less than 10, there are no more docs. The load more button is not shown
            if(cards.length + newDocs.length < 10){
                setLoadMoreButton(false)
                return
            }
        }
        setLoadMoreButton(true)
    }

    const loadMoreCards = async() => {
        setLoadMoreButton(null)
        const query = db.collection(`projects/kGS550UTeB1nYSQBYzPf/${sectionName}`).orderBy("createdAt")
        
        const documentsSnapshot = await query.startAfter(window[`lastDoc ${sectionName}`]).limit(10).get({ source: 'cache' })
        let documents = documentsSnapshot.docs

        if(documents.length < 10) {
            let lastDoc = window[`lastDoc ${sectionName}`]
            if(documents.length > 0) {
                lastDoc = documents[documents.length - 1]
            }
            const newDocs = await checkForNewCards(query, lastDoc, documents)
            documents = documents.concat(newDocs)
        }

        if(documents.length !== 0) {
            addCards(sectionName, documents)
            window[`lastDoc ${sectionName}`] = documents[documents.length - 1]
        }

        if(documents.length < 10) {
            setLoadMoreButton(false)
        }
        else {
            setLoadMoreButton(true)
        }
    }

    const checkForNewCards = async(query, lastDoc, documents) => {  // if there are new cards load only (10 - documents.length) to not exceed multiples of 10
        let newDocumentsSnapshot
        if(lastDoc) {
            newDocumentsSnapshot = await query.startAfter(lastDoc).limit(10 - documents.length).get()
        }
        else {
            newDocumentsSnapshot = await query.limit(10 - documents.length).get()
        }
        const newDocs = newDocumentsSnapshot.docs
        return newDocs
    }

    return (
        <div id="section">
            <h4 className="interFont indigoBlue" id="sectionName">{sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h4>
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
                                    <p className="interFont">Nothing to see here</p>
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
                                {(cards.length > 0 && loadMoreButton !== false) && (
                                    loadMoreButton !== null ?
                                        <div id="loadMoreContainer">
                                            <div id="loadMoreButton" onClick={loadMoreCards}>
                                                <b className="interFont" id="loadMoreText">Load More</b>
                                            </div>
                                        </div>
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