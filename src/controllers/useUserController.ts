import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '@/contexts/AuthContext'
import { createUser, deleteUser, listUsers, User } from '@/models/userModel'

export function useUserController() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Cashier')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      setUsers(await listUsers())
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const remove = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    })
    if (!result.isConfirmed) return
    try {
      await deleteUser(id, profile?.id)
      fetchUsers()
      Swal.fire('Deleted!', 'The user has been deleted.', 'success')
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Could not delete user.', 'error')
    }
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser({ username, password, role }, profile?.id)
      Swal.fire('Success', 'User created successfully', 'success')
      setIsModalOpen(false)
      setUsername('')
      setPassword('')
      setRole('Cashier')
      fetchUsers()
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Could not create user', 'error')
    }
  }

  return {
    users, loading, isModalOpen, setIsModalOpen,
    username, setUsername, password, setPassword, role, setRole,
    create, remove
  }
}
