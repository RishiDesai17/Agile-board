import { useState } from 'react';
import Card from './Card';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import './styles/Section.css';

const Section = ({ sectionName }) => {
    const [array, setArray] = useState([1,2,3,4,5,6,7])

    return (
        <div id="section">
            <h4>{sectionName}</h4>
            <div>
                <Droppable droppableId={sectionName}>
                    {provided => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {array.map((_, index) => (
                                <Draggable draggableId={index.toString() + sectionName} index={index} key={index}>
                                    {provided => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                            <Card id={index} />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <button onClick={() => {
                    setArray(array => [...array, 8,9,10])
                }}>Load More...</button>
            </div>
        </div>
    )
}

export default Section