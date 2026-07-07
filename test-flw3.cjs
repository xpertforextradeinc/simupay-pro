const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave('dummy', 'dummy');
flw.Payment.initiate({
  tx_ref: 'test-123',
  amount: 100,
  currency: 'NGN',
  redirect_url: 'http://localhost',
  customer: { email: 'test@example.com' }
}).then(res => console.log(res)).catch(err => console.error(err));
