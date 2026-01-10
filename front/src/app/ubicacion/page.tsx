<<<<<<< HEAD
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import TransformacionCTA from '@/components/TransformacionCTA'
import Ubicacion from '@/components/Ubicacion'
=======
import { Footer } from 'src/components/Footer'
import { Navbar } from 'src/components/Navbar'
import TransformacionCTA from 'src/components/TransformacionCTA'
import Ubicacion from 'src/components/Ubicacion'
>>>>>>> 68ba516b3d89ff10059a4e10873ca3b301a4ddba
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
