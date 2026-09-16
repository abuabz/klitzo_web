const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } = require('@phonepe-pg/pg-sdk-node');

async function run() {
    const clientId = "M23USXR81SDXI_2609161401";
    const clientSecret = "MjEyM2IzOTctMDZjNi00ZDVlLWEzYzgtZjNjNmY4NTg1ZTZk";
    const clientVersion = 1;
    const env = Env.SANDBOX; 

    try {
        const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(`T${Date.now()}`)
            .amount(100)
            .redirectUrl("http://localhost:3000/api/phonepe/redirect")
            .message("Payment for Klitzo")
            .build();

        const response = await client.pay(request);
        console.log("Pay Response:", response);
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
