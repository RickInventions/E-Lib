"use client"
import { Button } from "@/components/ui/button"
import { useState, createContext, useContext, ReactNode, useCallback } from "react"

interface ConfirmContextType {
  show: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmContext = createContext<{
  showConfirm: (title: string, message: string) => Promise<boolean>
} | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmContextType>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  })

  const showConfirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        show: true,
        title,
        message,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, show: false }))
          resolve(true)
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, show: false }))
          resolve(false)
        },
      })
    })
  }, [])

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {confirmState.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2">{confirmState.title}</h3>
            <p className="mb-4">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={confirmState.onCancel}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmState.onConfirm}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider")
  }
  return context.showConfirm
}