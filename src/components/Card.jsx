import { useCallback } from 'react';
import { weekDays, monthNames } from '../utils/DateTime';
import './styles/Card.css';

const Card = ({ cardData }) => {
    const getInitials = () => {
        const splittedCreatedBy = createdBy.split(" ")
        let initials
        if(splittedCreatedBy.length === 1) {
            initials = createdBy[0]
        }
        else {
            initials = splittedCreatedBy[0][0] + splittedCreatedBy[1][0]
        }
        return (
            <div>{initials.toUpperCase()}</div>
        )
    }

    const getFormattedDate = useCallback(seconds => {
        const d = new Date(seconds * 1000)
        const weekDay = weekDays[d.getDay()]
        const monthName = monthNames[d.getMonth()]
        const date = d.getDate()
        const year = d.getFullYear()
        return `${weekDay}, ${monthName} ${date} ${year}`
    }, [])

    const { task, deadline, category, createdBy } = cardData

    return (
        <div id="card">
            <div>
                <div id="cardContainer" className="space-between">
                    <div className="cardLayer space-between">
                        <div className="word-break">
                            <b>{task}</b>
                        </div>
                        <div className="word-break">
                            {getFormattedDate(deadline.seconds)}
                        </div>
                    </div>
                    <div className="cardLayer space-between">
                        <div>
                            <div>{category}</div>
                        </div>
                        <div>
                            {getInitials()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card