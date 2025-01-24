import React from 'react'
import Hero from './components/Hero'
import {BrowserRouter, Routes ,Route} from 'react-router-dom'
import Movies from './components/Movies'
import Studies from './components/Studies'
import Sidebar from './components/Sidebar'

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path='/' element={<Hero />}/>
          <Route path='/movies' element={<Movies />}/>
          <Route path='/studies' element={<Studies/>}/>
          <Route path='/sidebar' element={<Sidebar/>}/>


          
        </Routes>
      </BrowserRouter>
      

    </>
  )
}

export default App