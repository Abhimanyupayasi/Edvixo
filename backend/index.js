import 'dotenv/config'
import express from 'express'
import { clerkClient, requireAuth, getAuth } from '@clerk/express'
import cors from "cors";
const app = express()
const PORT = 8000

app.use(cors())

// Use requireAuth() to protect this route
// If user isn't authenticated, requireAuth() will redirect back to the homepage
app.get('/',(req,res)=>{
    res.send("hello");
})

app.get('/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)
    console.log(userId);
    
  return res.json({ user })
  
})

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})