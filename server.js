const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const app = express();
const port = 5500;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://todo-list-a3efb-default-rtdb.firebaseio.com'
});

app.use(bodyParser.json());
app.use(express.static('public'));

const db = admin.firestore();
const tasksCollection = db.collection('tasks');

app.get('/tasks', async (req, res) => {
    try {
        const snapshot = await tasksCollection.where('completed', '==', false).get();
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/add', async (req, res) => {
    try {
        const newTask = req.body;
        const docRef = await tasksCollection.add(newTask);
        res.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        await tasksCollection.doc(taskId).delete();
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/update/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const updatedTask = req.body;
        await tasksCollection.doc(taskId).update(updatedTask);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/done/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const status = req.body;

        await tasksCollection.doc(taskId).update(status);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
