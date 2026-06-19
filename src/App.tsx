import { useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { AppLayout } from "@/components/shared/AppLayout"
import { Splash } from "@/components/shared/Splash"
import { Login } from "@/pages/Login"
import { Setup } from "@/pages/Setup"
import { Dashboard } from "@/pages/Dashboard"
import { ObrasList } from "@/pages/obras/ObrasList"
import { ObraCreate } from "@/pages/obras/ObraCreate"
import { ObraDetail } from "@/pages/obras/ObraDetail"
import { RDOCreate } from "@/pages/rdos/RDOCreate"
import { RDODetail } from "@/pages/rdos/RDODetail"
import { Chat } from "@/pages/ia/Chat"
import { Usuarios } from "@/pages/admin/Usuarios"
import { Empresas } from "@/pages/admin/Empresas"
import { Perfil } from "@/pages/Perfil"

export default function App() {
  const [booting, setBooting] = useState(true)

  return (
    <>
      {booting && <Splash onFinish={() => setBooting(false)} />}
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/obras" element={<ObrasList />} />
          <Route path="/obras/nova" element={<ObraCreate />} />
          <Route path="/obras/:id" element={<ObraDetail />} />
          <Route path="/obras/:id/rdos/novo" element={<RDOCreate />} />
          <Route path="/obras/:id/rdos/:idRdo" element={<RDODetail />} />
          <Route path="/ia/chat" element={<Chat />} />
          <Route path="/admin/usuarios" element={<Usuarios />} />
          <Route path="/admin/empresas" element={<Empresas />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}
