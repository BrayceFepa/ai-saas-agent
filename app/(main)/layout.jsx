import React from 'react'
import AppHeader from './_components/AppHeader'

const DashboardLayout = ({children}) => {
  return (
      <div>
          <AppHeader/>
      <div className='p-10 mt-8 md:px-10 lg:px-20 xl:px-32 2xl:px-48'>
        {children}
          </div>
      </div>
  )
}

export default DashboardLayout