import type { FlutterwaveConfig } from "flutterwave-react-v3/dist/types";

type Customer = {
    email: string;
    phone_number: string;
    name: string;
};

type Customizations = {
    title: string;
    description: string;
    logo: string;
};

type Config = {
    public_key: string;
    tx_ref: string;
    amount: number;
    currency: string;
    payment_options: string;
    customer: Customer;
    customizations: Customizations;
};

/**
 * Generates the Flutterwave configuration object dynamically.
 * No values are hardcoded inside the function.
 */
export const getConfig = (params: Config): FlutterwaveConfig => ({
    public_key: params.public_key,
    tx_ref: params.tx_ref,
    amount: params.amount,
    currency: params.currency,
    payment_options: params.payment_options,
    customer: {
        email: params.customer.email,
        phone_number: params.customer.phone_number,
        name: params.customer.name,
    },
    customizations: {
        title: params.customizations.title,
        description: params.customizations.description,
        logo: params.customizations.logo,
    },
});