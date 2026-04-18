import { connectToDatabase } from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req,res){
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { db } = await connectToDatabase()
    const data  = req.query.id
    
    // Validate ID parameter
    if (!data) {
        return res.status(400).json({ error: 'Missing ID parameter' });
    }
    
    // Validate ObjectId format
    if (!ObjectId.isValid(data)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    await db.collection('Queue').deleteOne({"_id": new ObjectId(data)})
    .then(()=>{
        res.json({ message : "deleted" });
    }) 
    .catch((err)=>{
        console.error("Database error:", err);
        res.status(500).json({ error: "Error deleting item" });
    })
}
