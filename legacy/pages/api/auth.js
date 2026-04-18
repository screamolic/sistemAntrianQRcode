import { connectToDatabase } from "../../lib/mongodb";
import bcrypt from "bcryptjs";

export default async function handler(req,res){
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { db } = await connectToDatabase()
    const data  = req.body;
    
    // Input validation
    if (!data.email || !data.password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }
    
    const findingData = await db.collection('Admin').findOne({email : data.email.toLowerCase().trim()})
    
    if(findingData != null){
        // Verify hashed password
        const passwordMatch = await bcrypt.compare(data.password, findingData.password);
        
        if(passwordMatch){
            // Return safe user data (exclude password)
            const { password, ...safeUser } = findingData;
            res.json(safeUser);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
}