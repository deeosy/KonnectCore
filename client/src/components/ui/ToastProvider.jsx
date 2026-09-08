import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: '16px',
          padding: '14px 18px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
          border: '1px solid #E2E8F0',
        },
        success: {
          iconTheme: {
            primary: '#16A34A',
            secondary: '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#DC2626',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
  )
}
