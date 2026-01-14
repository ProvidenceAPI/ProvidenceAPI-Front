import { Footer } from 'src/components/Footer'
import { Navbar } from 'src/components/Navbar'
import TransformacionCTA from 'src/components/TransformacionCTA'
import Ubicacion from 'src/components/Ubicacion'
import React from 'react'

export default function page() {
  return (
    <div >
      <Navbar/>
        <Ubicacion/>
      <TransformacionCTA/>
      <Footer/>
    </div>
  )
}
