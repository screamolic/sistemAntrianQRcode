import { connectToDatabase } from "../../lib/mongodb";
import bcrypt from "bcryptjs";

export default async function handler(req,res){
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { db } = await connectToDatabase()
    const data  = req.body;
    
    // Input validation
    if (!data.email || !data.password || !data.fname || !data.lname || !data.number) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(data.number)) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    // Password strength validation
    if (data.password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    const findingData = await db.collection('Admin').findOne({email : data.email})
    if(findingData == null){
        // Hash password before storing
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        
        const adminData = {
            fname: data.fname.trim(),
            lname: data.lname.trim(),
            email: data.email.toLowerCase().trim(),
            password: hashedPassword,
            number: data.number,
            createdAt: new Date().toISOString()
        };
        
        await db.collection('Admin').insertOne(adminData)
        .then((result)=>{
            let id = result.insertedId;
            res.status(201).json({ id: id, message: 'Admin created successfully' });
        }) 
        .catch((err)=>{
            console.error("Database error:", err);
            res.status(500).json({ error: "Error creating admin" });
        })
    }
    else{
        res.status(409).json({ error: 'Email already exists' });
    }

}