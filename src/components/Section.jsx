import { useState } from 'react';
import Card from './Card';
import './styles/Section.css';

const Section = ({ sectionName }) => {
    const [array, setArray] = useState([1,2,3,4,5,6,7])

    return (
        <div id="section">
            <h4>{sectionName}</h4>
            <div>
                {array.map(() => (
                    <Card />
                ))}
                <button onClick={() => {
                    setArray(array => [...array, 8,9,10])
                }}>Load More...</button>
            </div>
        </div>
    )
}

export default Section