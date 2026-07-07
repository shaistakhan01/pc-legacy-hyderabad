import { BrowserRouter } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripeClient";
import { AppRoutes } from "@/routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <AppRoutes />
      </Elements>
    </BrowserRouter>
  );
}

export default App;