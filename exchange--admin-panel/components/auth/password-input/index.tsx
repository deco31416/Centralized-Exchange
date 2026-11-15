'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

interface PasswordInputProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
  error?: string
  disabled?: boolean
}

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  label,
  placeholder = '••••••••',
  required = false,
  autoComplete = 'current-password',
  error,
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={error ? 'border-destructive' : ''}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          disabled={disabled}
          tabIndex={-1}
        >
          {showPassword ? (
            <IconEyeOff className="h-4 w-4" />
          ) : (
            <IconEye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  )
}
