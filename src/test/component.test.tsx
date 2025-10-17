import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import UserForm from '@/components/admin/UserForm'

// Mock data
const mockDepartments = [
  { id: '1', name: 'TI', description: 'Tecnologia da Informação' }
]

const mockRoles = [
  { id: '1', name: 'Admin', description: 'Administrador', permissions: [] }
]

const mockPermissions = [
  { id: '1', name: 'read_users', description: 'Ler usuários' }
]

const mockOnSave = async () => {}
const mockOnClose = () => {}

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('UserForm Component', () => {
  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <UserForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          departments={mockDepartments}
          roles={mockRoles}
          permissions={mockPermissions}
          mode="create"
        />
      </TestWrapper>
    )

    // Just check if the component renders without throwing
    expect(document.body).toBeTruthy()
  })
})