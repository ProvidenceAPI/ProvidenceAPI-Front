import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import TransformacionCTA from '@/components/TransformacionCTA'
import Ubicacion from '@/components/Ubicacion'
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
