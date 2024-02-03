const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const app = express();
const port = 5500;

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://todo-list-a3efb-default-rtdb.firebaseio.com'
});

app.use(bodyParser.json()); // Sử dụng middleware xử lý dữ liệu JSON từ body của request
app.use(express.static('public')); // Sử dụng Middleware phục vụ các tệp tĩnh từ thư mục 'public'

// Kết nối firestore
const db = admin.firestore();
const tasksCollection = db.collection('tasks');

//router get '/task' lấy những task chưa completed từ firestore
app.get('/tasks', async (req, res) => {
    const snapshot = await tasksCollection.where('completed', '==', false).get(); //truy vấn firestore những task chưa hoàn thành và lưu vào snapshot
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); //chuyển snapshot sang mảng Object
    res.json(tasks); //trả dữ liệu về bằng dạng JSON
});

//router post '/add' thêm task vào firestore
app.post('/add', async (req, res) => {
    const newTask = req.body; // Lấy dữ liệu task mới từ body của request
    const docRef = await tasksCollection.add(newTask); //Thêm task vào firestore
    res.json({ success: true, id: docRef.id }); //Trả về thông báo thành công và id task
});

//router delete '/delete' xóa task khỏi firestore
app.delete('/delete/:id', async (req, res) => {
    const taskId = req.params.id; // Lấy id task cần xóa từ URL parameter
    await tasksCollection.doc(taskId).delete(); //Thực hiện xóa task trong firestore thông qua id task
    res.json({ success: true }); //trả về thông báo thành công
});

//router put '/update' lưu task đã được chỉnh sửa thông qua id task cũ
app.put('/update/:id', async (req, res) => {
    const taskId = req.params.id; //Lấy id task cần chỉnh sửa từ URL parameter
    const updatedTask = req.body; //Lấy dữ liệu task đã chỉnh sửa từ body của request
    await tasksCollection.doc(taskId).update(updatedTask); //Cập nhật task đã chỉnh sửa thông qua id cũ lên db
    res.json({ success: true }); //Trả về thông báo thành công
});

//router put '/done' đánh dấu task hoàn thành
app.put('/done/:id', async (req, res) => {
        const taskId = req.params.id; //Lấy id task đánh dấu hoàn thành từ URL parameter
        const status = req.body; //Lấy trạng thái tick của task từ body của request
        console.log(status);
        await tasksCollection.doc(taskId).update(status); // Cập nhật trạng thái task trong firestore dựa trên id
        res.json({ success: true }); //trả thông báo thành công
}
);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});