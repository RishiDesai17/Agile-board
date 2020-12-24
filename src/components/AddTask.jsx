import { useState } from 'react';
import { db, firebase } from '../firebase';
import ActivityIndicator from './ActivityIndicator';
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import './styles/AddTask.css';

const AddTask = ({ setSections }) => {
    const [task, setTask] = useState("")
    const [category, setCategory] = useState("")
    const [createdBy, setCreatedBy] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const submit = async e => {
        try {
            e.preventDefault()
            if(task === "" || category === "" || createdBy === "") {
                alert("Fill in all the fields")
                return
            }
            setSubmitting(true)
            const response = await db.collection("projects/kGS550UTeB1nYSQBYzPf/assigned").add({
                task,
                category,
                createdBy,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            const newTask = await response.get()
            setSections(sections => {
                return {
                    ...sections,
                    assigned: [newTask, ...sections.assigned]
                }
            })
            setShowModal(false)
            setSubmitting(false)
        }
        catch(err) {
            console.log(err)
        }
    }

    return (
        <div>
            <div id="addTaskButtonContainer" onClick={() => setShowModal(true)}>
                <div id="addTaskButton">
                    <b className="interFont indigoBlue">+ Add Task</b>
                </div>
            </div>
            <Modal open={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit}>
                    <div>
                        <input placeholder="Task"  onChange={e => setTask(e.target.value)} />
                    </div>
                    <div>
                        <input placeholder="Category"  onChange={e => setCategory(e.target.value)} />
                    </div>
                    <div>
                        <input placeholder="Created by" onChange={e => setCreatedBy(e.target.value)}  />
                    </div>
                    {submitting ? 
                        <ActivityIndicator />
                    :
                        <div>
                            <button type="submit" id="submitButton" disabled={submitting}>submit</button>
                        </div>
                    }
                </form>
            </Modal>
        </div>
    )
}

export default AddTask