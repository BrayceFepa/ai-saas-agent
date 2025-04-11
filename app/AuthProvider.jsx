"use client"
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack'
import { useMutation } from 'convex/react';
import React, { useEffect, useState } from 'react'
import { UserContext } from './_context/UserContext';
import { Loader2Icon } from 'lucide-react';

const AuthProvider = ({ children }) => {
    
    const user = useUser();
    const CreateUser = useMutation(api.users.CreateUser);
    const [userData, setUserData] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // console.log(user);
        user && CreateNewUser()
    }, [user]);

    const CreateNewUser = async () => {
       try {
           if (user && !user.displayName) {
             setLoading(true);
        let userName = user.primaryEmail.split("@");
        // console.log(userName)
        const result = await CreateUser({
            name: userName[0],
            email: user.primaryEmail
        });
        
        setUserData(result);
        setLoading(false);
        }
       } catch (error) {
           console.log(error);
       }
    }

  return (
      <div>
          {
              loading ? <div className='h-screen w-screen flex justify-center items-center'>
                  <Loader2Icon size={50} className='animate-spin text-primary'/>
              </div>: <UserContext.Provider value={{ userData, setUserData }}>
              {children}
          </UserContext.Provider>
          }
          
      </div>
  )
}

export default AuthProvider