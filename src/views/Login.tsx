import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { lastUsername } from '@/lib/offline'
import { useAuth } from '@/contexts/AuthContext'
import { LiveClock } from '@/components/LiveClock'
import Swal from 'sweetalert2'

export default function Login() {
  const [username, setUsername] = useState(() => lastUsername())
  const [password, setPassword] = useState('')
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { profile, login } = useAuth()

  useEffect(() => {
    if (profile) {
      if (profile.role === 'Cashier') {
        navigate('/cashier')
      } else {
        navigate('/admin')
      }
    }
  }, [profile, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login(username, password, keepSignedIn);

      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: `Welcome back, ${username}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="Essentials by ED Logo" className="w-full max-w-[220px] sm:max-w-sm h-auto object-contain" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-700 bg-slate-100 py-2 rounded-lg border border-slate-200 shadow-inner">
            <LiveClock />
          </div>
          <CardDescription className="text-slate-500">
            Enter your username and password to continue. A saved session stays on this device until you sign out.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-0 bg-red-100 text-red-800">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700">Username</Label>
              <Input 
                id="username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={keepSignedIn} onChange={e => setKeepSignedIn(e.target.checked)} />
              Keep me signed in on this device
            </label>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
