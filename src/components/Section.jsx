import Card from './Card';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import './styles/Section.css';

const Section = ({ sectionName, sectionIndex, cards }) => {
    return (
        <div id="section">
            <h4>{sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h4>
            <div>
                <Droppable droppableId={sectionIndex.toString()}>
                    {provided => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {cards.map((card, index) => (
                                <Draggable draggableId={sectionName + " " + index.toString()} index={index} key={index}>
                                    {provided => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                            <Card task={card.task} />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <button>Load More...</button>
            </div>
        </div>
    )
}

export default Section