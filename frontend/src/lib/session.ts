import Swal from 'sweetalert2'

export async function confirmSignOut(username?: string | null) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Sign out?',
    text: username
      ? `End ${username}'s session and return to the login screen.`
      : 'End this session and return to the login screen.',
    showCancelButton: true,
    confirmButtonColor: '#1e293b',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sign out',
    cancelButtonText: 'Stay signed in'
  })

  return result.isConfirmed
}

export async function signedOutNotice() {
  await Swal.fire({
    icon: 'success',
    title: 'Signed out',
    text: 'Your session has ended.',
    timer: 1400,
    showConfirmButton: false
  })
}
