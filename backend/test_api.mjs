import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const token = jwt.sign({ userId: '123' }, process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production');

async function test() {
    try {
        const res = await axios.post('http://localhost:3000/api/v1/items/validate-category', {
            title: 'iPhone',
            category: 'Computing Device',
            description: 'red iphone'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(JSON.stringify(res.data));
    } catch (err) {
        if (err.response) {
            console.error(err.response.data);
        } else {
            console.error(err.message);
        }
    }
}
test();
