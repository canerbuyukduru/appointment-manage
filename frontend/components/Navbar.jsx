import React from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useLogoutMutation } from '../redux/api/userApi'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

const Navbar = () => {
  const [logout] = useLogoutMutation()
  const {userInfo} = useSelector((state)=> state.auth)
  const {ownerInfo} = useSelector((state)=> state.owner)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  console.log(userInfo)
  console.log(ownerInfo)

  // Handler for logout
  const logoutHandler = async () => {
    try {
      await logout().unwrap();
      console.log("User logged out");
      dispatch({ type: 'auth/logout' }); // Clear user info from Redux state
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
  return (
    <nav>
      {userInfo || ownerInfo ? (
        <div className='flex justify-between items-center bg-gray-800 text-white p-4'>
          <h1 className='text-xl font-bold'>Welcome, {userInfo?.full_name || ownerInfo?.name}</h1>
          <Link to="/profile" className='text-blue-400 hover:underline'>Profile</Link>
          <button onClick={logoutHandler} to="/logout" className='text-blue-400 hover:underline'>Logout</button>
          </div>
        ): <ul className='flex space-x-4 w-full justify-center bg-gray-800 text-white p-4'>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
      </ul>
      }
     
    </nav>
  )
}

export default Navbar