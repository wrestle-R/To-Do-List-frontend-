import React from 'react'
import Hero from './components/Hero'
import {BrowserRouter, Routes ,Route} from 'react-router-dom'
import Movies from './components/Movies'
import Studies from './components/Studies'


const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path='/' element={<Hero />}/>
          <Route path='/movies' element={<Movies />}/>
          <Route path='/studies' element={<Studies/>}/>
          


          
        </Routes>
      </BrowserRouter>
      

    </>
  )
}

export default App