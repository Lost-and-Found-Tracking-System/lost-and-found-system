import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
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
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
