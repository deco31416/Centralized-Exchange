'use client';

import { useState } from 'react';
import { useAddBalance } from '@/hooks/use-wallets';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const CURRENCIES = [
  { value: 'MXN', label: 'MXN - Peso Mexicano', decimals: 2 },
  { value: 'USD', label: 'USD - Dólar', decimals: 2 },
  { value: 'COP', label: 'COP - Peso Colombiano', decimals: 2 },
  { value: 'BTC', label: 'BTC - Bitcoin', decimals: 8 },
  { value: 'USDC', label: 'USDC', decimals: 6 },
  { value: 'USDT', label: 'USDT', decimals: 6 },
];

export default function AddBalancePage() {
  return (
    <AuthGuard requiredRoles={['admin', 'super_admin']}>
      <AddBalanceContent />
    </AuthGuard>
  );
}

function AddBalanceContent() {
  const { user } = useAdminAuth();
  const [userId, setUserId] = useState('');
  const [currency, setCurrency] = useState('MXN');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState<any>(null);
  
  const { addBalance, loading, error } = useAddBalance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    try {
      // Convert amount to minor units
      const selectedCurrency = CURRENCIES.find((c) => c.value === currency);
      const decimals = selectedCurrency?.decimals || 2;
      const amountFloat = parseFloat(amount);
      const amountMinorUnits = Math.floor(amountFloat * Math.pow(10, decimals)).toString();

      const result = await addBalance({
        userId,
        currency,
        amountMinorUnits,
        reason,
        adminId: user?.id || 'unknown',
      });

      setSuccess(result);
      // Reset form
      setAmount('');
      setReason('');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Agregar Saldo a Usuario</CardTitle>
          <CardDescription>
            Agrega saldo manualmente a la wallet de un usuario (operación administrativa)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ID interno del usuario"
                required
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona moneda" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Cantidad</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000.00"
                required
              />
              <p className="text-sm text-muted-foreground">
                Cantidad en formato decimal según la moneda seleccionada.
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Razón (opcional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo administrativo"
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Procesando...' : 'Agregar Saldo'}
            </Button>

            {/* Success Message */}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-1">
                    <p className="font-semibold">¡Saldo agregado exitosamente!</p>
                    <p className="text-sm">
                      Transaction ID: <code className="bg-green-100 px-1 py-0.5 rounded">{success.txId}</code>
                    </p>
                    <p className="text-sm">
                      Balance anterior: {success.balanceBefore} {success.currency}
                    </p>
                    <p className="text-sm">
                      Balance nuevo: <span className="font-bold">{success.balanceAfter} {success.currency}</span>
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
