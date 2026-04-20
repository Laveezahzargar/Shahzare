import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"

type Props = {
    amount: number;
    onSuccess: (details: any) => void;
    onError: (err: any) => void;
};

const PayPalButton = ({ amount, onSuccess, onError }: Props) => {
    return (
        <PayPalScriptProvider options={{
            clientId:
                import.meta.env.VITE_PAYPAL_CLIENT_ID,
            currency: "USD",
            intent: "capture"
        }}>

            <PayPalButtons style={{ layout: "vertical" }} createOrder={(_data, actions) => {
                return actions.order.create({
                    purchase_units: [
            {
    amount: {
      currency_code: "USD",
      value: amount.toString()
    }
  }
]
                    
                })
            }}
                onApprove={async (_data, actions) => {
                    const details = await actions.order?.capture();
          if (details) onSuccess(details);
                }}
                onError={onError} />
        </PayPalScriptProvider>
    )
}

export default PayPalButton


