import { useUser } from '@clerk/clerk-react'
import React, { useEffect } from 'react'
import useUserInfo from '../clerk/ClerkRole'
import useHelper from '../helpers/Helpers'
import { Outlet } from 'react-router-dom'




function SuperAdmin() {
    const { role, name, email, userId, isLoaded } = useUserInfo()
    const {navigate} = useHelper()
    
    
    if(!isLoaded){
        return (
            <span className="loading loading-dots loading-xl"></span>
        )
    }
    if(isLoaded && role != 'admin') {
        navigate('/dashboard')
    }
  return (
    <>
        <Outlet/>
    </>
  )
}

export default SuperAdmin