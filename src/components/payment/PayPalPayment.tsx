import { useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

interface PayPalPaymentProps {
  amount: string;
  currency?: string;
  showSpinner?: boolean;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

const style = {
  layout: 'vertical' as const,
  color: 'gold' as const,
  shape: 'rect' as const,
  label: 'paypal' as const,
};

export function PayPalPayment({ amount, currency = 'USD', showSpinner = true, onSuccess, onError, disabled }: PayPalPaymentProps) {
  const [{ isPending }] = usePayPalScriptReducer();

  return (
    <>
      {showSpinner && isPending && <div className="spinner" />}
      <PayPalButtons
        style={style}
        disabled={disabled}
        forceReRender={[amount, currency, style]}
        fundingSource={undefined}
        createOrder={(data: any, actions: any) => {
          return actions.order
            .create({
              purchase_units: [
                {
                  description: 'Wholesale Order Payment',
                  amount: {
                    currency_code: currency,
                    value: amount,
                  },
                },
              ],
            })
            .then((orderId: string) => {
              return orderId;
            });
        }}
        onApprove={function (data: any, actions: any) {
          return actions.order.capture().then(function () {
            onSuccess(data);
          });
        }}
        onError={(err: any) => {
          onError(err);
        }}
      />
    </>
  );
}

interface PayPalProviderProps {
  clientId: string;
  children: React.ReactNode;
}

export function PayPalProvider({ clientId, children }: PayPalProviderProps) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId,
        currency: 'USD',
        intent: 'capture',
        'disable-funding': 'card,credit,venmo',
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
