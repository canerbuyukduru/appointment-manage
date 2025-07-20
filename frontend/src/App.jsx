import React from 'react'
import { Outlet } from 'react-router'
import { ToastContainer } from 'react-toastify'
import Navbar from '../components/Navbar'

function App() {

  return (
    <>  
     <ToastContainer />
     <Navbar />
      {/* Other components or routes can be added here */}
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default App
