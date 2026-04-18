import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req,res){
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { db } = await connectToDatabase()
    const data  = req.body
    
    // Validate required fields
    if (!data.phone || !data.admin) {
        return res.status(400).json({ error: 'Missing phone or admin parameter' });
    }
    
    // Sanitize input - only allow specific fields
    const queueData = {
        phone: data.phone,
        admin: data.admin,
        name: data.name || '',
        date: data.date || new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
    };
    
    console.log(queueData);
    
    const candFound = await db.collection('Queue').findOne({
        'phone': queueData.phone,
        'admin': queueData.admin
    })
    
    if(!candFound){
        await db.collection('Queue').insertOne(queueData)
        .then((result)=>{
            let id = result.insertedId;
            console.log(id);
            res.status(201).json({ id: id });
        }) 
        .catch((err)=>{
            console.error("Database error:", err);
            res.status(500).json({ error: "Error registering in queue" });
        })
    }
    else
    {
        res.status(409).json({ message: "Already registered" });
    }
}
