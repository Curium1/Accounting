const { initiateBankIdSignup } = require('./bankIdController');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('BankID Controller - initiateBankIdSignup', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset mocks for each test
    mockReq = {
      ip: '192.168.1.100', // Example IP address
      body: {}, // Assuming no specific body is needed for this controller action for now
    };
    mockRes = {
      status: jest.fn().mockReturnThis(), // Allows chaining .status().json()
      json: jest.fn(),
    };
    // Clear any previous mock implementations or stats
    axios.post.mockClear();
  });

  test('should successfully initiate BankID auth and return 200 with BankID response', async () => {
    const bankIdSuccessResponse = {
      orderRef: "131daac9-16c6-4618-beb0-365768f37288",
      autoStartToken: "7c40b5c9-fa74-49cf-b98c-bfe651f9a7c6",
      qrStartToken: "67df3917-fa0d-44e5-b327-edcc928297f8",
      qrStartSecret: "d28db9a7-4cde-429e-a983-359be676944c"
    };
    axios.post.mockResolvedValueOnce({ status: 200, data: bankIdSuccessResponse });

    const expectedBankIdApiUrl = process.env.BANKID_API_BASE_URL || 'https://appapi2.test.bankid.com/rp/v6.0';
    const expectedReturnUrl = process.env.BANKID_RETURN_URL || "https://your-frontend.example.com/bankid-callback";


    await initiateBankIdSignup(mockReq, mockRes);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${expectedBankIdApiUrl}/auth`,
      {
        endUserIp: mockReq.ip,
        returnUrl: expectedReturnUrl,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(bankIdSuccessResponse);
  });

  test('should handle BankID API error (e.g., 400) and return same status and error data', async () => {
    const bankIdErrorResponse = {
      errorCode: "invalidParameters",
      details: "Missing endUserIp"
    };
    axios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 400, data: bankIdErrorResponse }
    });
    
    const expectedBankIdApiUrl = process.env.BANKID_API_BASE_URL || 'https://appapi2.test.bankid.com/rp/v6.0';
    const expectedReturnUrl = process.env.BANKID_RETURN_URL || "https://your-frontend.example.com/bankid-callback";


    await initiateBankIdSignup(mockReq, mockRes);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${expectedBankIdApiUrl}/auth`,
      {
        endUserIp: mockReq.ip,
        returnUrl: expectedReturnUrl,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(bankIdErrorResponse);
  });

  test('should handle BankID API network error and return 500 with generic message', async () => {
    axios.post.mockRejectedValueOnce({ isAxiosError: true, request: {} }); // Simulate network error (no response)

    const expectedBankIdApiUrl = process.env.BANKID_API_BASE_URL || 'https://appapi2.test.bankid.com/rp/v6.0';
    const expectedReturnUrl = process.env.BANKID_RETURN_URL || "https://your-frontend.example.com/bankid-callback";

    await initiateBankIdSignup(mockReq, mockRes);

    expect(axios.post).toHaveBeenCalledTimes(1);
     expect(axios.post).toHaveBeenCalledWith(
      `${expectedBankIdApiUrl}/auth`,
      {
        endUserIp: mockReq.ip,
        returnUrl: expectedReturnUrl,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'No response from BankID service.' });
  });
  
  test('should handle non-axios error during BankID API call and return 500', async () => {
    axios.post.mockRejectedValueOnce(new Error("Some other error")); // Simulate a generic error

    const expectedBankIdApiUrl = process.env.BANKID_API_BASE_URL || 'https://appapi2.test.bankid.com/rp/v6.0';
    const expectedReturnUrl = process.env.BANKID_RETURN_URL || "https://your-frontend.example.com/bankid-callback";

    await initiateBankIdSignup(mockReq, mockRes);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${expectedBankIdApiUrl}/auth`,
      {
        endUserIp: mockReq.ip,
        returnUrl: expectedReturnUrl,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error setting up BankID request.' });
  });

  // Test with default req.ip if not available
  test('should use default IP if req.ip is not available', async () => {
    mockReq.ip = undefined; // Simulate missing req.ip
    const bankIdSuccessResponse = { orderRef: "testOrderRef" };
    axios.post.mockResolvedValueOnce({ status: 200, data: bankIdSuccessResponse });

    const expectedBankIdApiUrl = process.env.BANKID_API_BASE_URL || 'https://appapi2.test.bankid.com/rp/v6.0';
    const expectedReturnUrl = process.env.BANKID_RETURN_URL || "https://your-frontend.example.com/bankid-callback";

    await initiateBankIdSignup(mockReq, mockRes);

    expect(axios.post).toHaveBeenCalledWith(
      `${expectedBankIdApiUrl}/auth`,
      {
        endUserIp: "127.0.0.1", // Default IP
        returnUrl: expectedReturnUrl,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(bankIdSuccessResponse);
  });
});
