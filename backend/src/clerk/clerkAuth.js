import { clerkClient, requireAuth, getAuth } from '@clerk/express'

const protectedRoute =  app.get('/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)

  // Use Clerk's JavaScript Backend SDK to get the user's User object
    const user = await clerkClient.users.getUser(userId)
    console.log(userId);
    
  return res.json({ user })
  
})

export default protectedRoute

