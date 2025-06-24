import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/webhooks/moralis/route';
import { Web3 } from 'web3';

// Mock environment variables
process.env.MORALIS_STREAM_SECRET = 'test-webhook-secret';

// Helper function to create a valid signature for testing
function createValidSignature(body: string, secret: string): string {
    const web3 = new Web3();
    const signature = web3.utils.sha3(body + secret);
    return signature || '';
}

// Helper function to create a NextRequest with proper headers and body
function createMockRequest(payload: any, signature?: string): NextRequest {
    const body = JSON.stringify(payload);
    const validSignature = signature || createValidSignature(body, process.env.MORALIS_STREAM_SECRET!);

    // Mock the NextRequest
    const mockRequest = {
        text: jest.fn().mockResolvedValue(body),
        headers: {
            get: jest.fn().mockImplementation((headerName: string) => {
                if (headerName === 'x-signature') {
                    return validSignature;
                }
                return null;
            }),
        },
    } as unknown as NextRequest;

    return mockRequest;
}

describe('/api/v1/webhooks/moralis', () => {
    beforeEach(() => {
        // Clear console mocks
        jest.clearAllMocks();

        // Mock console methods to avoid cluttering test output
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        // Restore console methods
        jest.restoreAllMocks();
    });

    describe('POST', () => {
        it('should handle empty payload with confirmed=true and return 200', async () => {
            const payload = {
                "abi": [],
                "block": {
                    "number": "",
                    "hash": "",
                    "timestamp": ""
                },
                "txs": [],
                "txsInternal": [],
                "logs": [],
                "chainId": "",
                "confirmed": true,
                "retries": 0,
                "tag": "",
                "streamId": "",
                "erc20Approvals": [],
                "erc20Transfers": [],
                "nftTokenApprovals": [],
                "nftApprovals": {
                    "ERC721": [],
                    "ERC1155": []
                },
                "nftTransfers": [],
                "nativeBalances": []
            };

            const request = createMockRequest(payload);
            const response = await POST(request);

            expect(response.status).toBe(200);

            const responseData = await response.json();
            expect(responseData).toEqual({
                message: 'No relevant transfers found'
            });
        });

        it('should handle payload with ERC20 transfer to MM Card address', async () => {
            const payload = {
                "abi": [],
                "block": {
                    "number": "123456",
                    "hash": "0xabcdef",
                    "timestamp": "1640995200"
                },
                "txs": [],
                "txsInternal": [],
                "logs": [],
                "chainId": "0xe705", // Linea Sepolia
                "confirmed": true,
                "retries": 0,
                "tag": "test-stream",
                "streamId": "stream123",
                "erc20Approvals": [],
                "erc20Transfers": [
                    {
                        "transactionHash": "0x123abc",
                        "logIndex": "0",
                        "contract": "0xTokenContract",
                        "triggeredBy": "0xSender",
                        "from": "0xSenderAddress",
                        "to": "0xA90b298d05C2667dDC64e2A4e17111357c215dD2", // US MM Card address
                        "value": "1000000", // 1 USDC (6 decimals)
                        "tokenName": "USD Coin",
                        "tokenSymbol": "USDC",
                        "tokenDecimals": "6",
                        "valueWithDecimals": "1.0"
                    }
                ],
                "nftTokenApprovals": [],
                "nftApprovals": {
                    "ERC721": [],
                    "ERC1155": []
                },
                "nftTransfers": [],
                "nativeBalances": []
            };

            const request = createMockRequest(payload);
            const response = await POST(request);

            expect(response.status).toBe(200);

            const responseData = await response.json();
            expect(responseData).toEqual({
                message: 'Webhook processed successfully',
                processedTransfers: 1
            });
        });

        it('should handle payload with ERC20 transfer to non-MM Card address', async () => {
            const payload = {
                "abi": [],
                "block": {
                    "number": "123456",
                    "hash": "0xabcdef",
                    "timestamp": "1640995200"
                },
                "txs": [],
                "txsInternal": [],
                "logs": [],
                "chainId": "0xe705",
                "confirmed": true,
                "retries": 0,
                "tag": "test-stream",
                "streamId": "stream123",
                "erc20Approvals": [],
                "erc20Transfers": [
                    {
                        "transactionHash": "0x123abc",
                        "logIndex": "0",
                        "contract": "0xTokenContract",
                        "triggeredBy": "0xSender",
                        "from": "0xSenderAddress",
                        "to": "0xRandomAddress123456789", // Not a MM Card address
                        "value": "1000000",
                        "tokenName": "USD Coin",
                        "tokenSymbol": "USDC",
                        "tokenDecimals": "6",
                        "valueWithDecimals": "1.0"
                    }
                ],
                "nftTokenApprovals": [],
                "nftApprovals": {
                    "ERC721": [],
                    "ERC1155": []
                },
                "nftTransfers": [],
                "nativeBalances": []
            };

            const request = createMockRequest(payload);
            const response = await POST(request);

            expect(response.status).toBe(200);

            const responseData = await response.json();
            expect(responseData).toEqual({
                message: 'No relevant transfers found'
            });
        });

        it('should skip unconfirmed transactions', async () => {
            const payload = {
                "abi": [],
                "block": {
                    "number": "123456",
                    "hash": "0xabcdef",
                    "timestamp": "1640995200"
                },
                "txs": [],
                "txsInternal": [],
                "logs": [],
                "chainId": "0xe705",
                "confirmed": false, // Unconfirmed
                "retries": 0,
                "tag": "test-stream",
                "streamId": "stream123",
                "erc20Approvals": [],
                "erc20Transfers": [
                    {
                        "transactionHash": "0x123abc",
                        "logIndex": "0",
                        "contract": "0xTokenContract",
                        "triggeredBy": "0xSender",
                        "from": "0xSenderAddress",
                        "to": "0xA90b298d05C2667dDC64e2A4e17111357c215dD2",
                        "value": "1000000",
                        "tokenName": "USD Coin",
                        "tokenSymbol": "USDC",
                        "tokenDecimals": "6",
                        "valueWithDecimals": "1.0"
                    }
                ],
                "nftTokenApprovals": [],
                "nftApprovals": {
                    "ERC721": [],
                    "ERC1155": []
                },
                "nftTransfers": [],
                "nativeBalances": []
            };

            const request = createMockRequest(payload);
            const response = await POST(request);

            expect(response.status).toBe(200);

            const responseData = await response.json();
            expect(responseData).toEqual({
                message: 'Transaction not confirmed yet'
            });
        });

        it('should return 401 for invalid signature', async () => {
            const payload = {
                "abi": [],
                "block": { "number": "", "hash": "", "timestamp": "" },
                "txs": [],
                "txsInternal": [],
                "logs": [],
                "chainId": "",
                "confirmed": true,
                "retries": 0,
                "tag": "",
                "streamId": "",
                "erc20Approvals": [],
                "erc20Transfers": [],
                "nftTokenApprovals": [],
                "nftApprovals": { "ERC721": [], "ERC1155": [] },
                "nftTransfers": [],
                "nativeBalances": []
            };

            const request = createMockRequest(payload, 'invalid-signature');
            const response = await POST(request);

            expect(response.status).toBe(401);

            const responseData = await response.json();
            expect(responseData).toEqual({
                error: 'Invalid signature'
            });
        });

        it('should return 401 when no signature is provided', async () => {
            const payload = {
                "abi": [],
                "block": { "number": "", "hash": "", "timestamp": "" },
                "txs": [],
                "txsInternal": [],
                "logs": [],
                "chainId": "",
                "confirmed": true,
                "retries": 0,
                "tag": "",
                "streamId": "",
                "erc20Approvals": [],
                "erc20Transfers": [],
                "nftTokenApprovals": [],
                "nftApprovals": { "ERC721": [], "ERC1155": [] },
                "nftTransfers": [],
                "nativeBalances": []
            };

            const body = JSON.stringify(payload);
            const mockRequest = {
                text: jest.fn().mockResolvedValue(body),
                headers: {
                    get: jest.fn().mockReturnValue(null), // No signature header
                },
            } as unknown as NextRequest;

            const response = await POST(mockRequest);

            expect(response.status).toBe(401);

            const responseData = await response.json();
            expect(responseData).toEqual({
                error: 'No signature provided'
            });
        });

        it('should return 400 for invalid JSON payload', async () => {
            const invalidJson = '{ invalid json }';
            const validSignature = createValidSignature(invalidJson, process.env.MORALIS_STREAM_SECRET!);

            const mockRequest = {
                text: jest.fn().mockResolvedValue(invalidJson),
                headers: {
                    get: jest.fn().mockImplementation((headerName: string) => {
                        if (headerName === 'x-signature') {
                            return validSignature;
                        }
                        return null;
                    }),
                },
            } as unknown as NextRequest;

            const response = await POST(mockRequest);

            expect(response.status).toBe(400);

            const responseData = await response.json();
            expect(responseData).toEqual({
                error: 'Invalid JSON payload'
            });
        });

        it('should return 500 when webhook secret is not configured', async () => {
            // Temporarily remove the webhook secret
            const originalSecret = process.env.MORALIS_STREAM_SECRET;
            delete process.env.MORALIS_STREAM_SECRET;

            const payload = {
                "abi": [],
                "block": { "number": "", "hash": "", "timestamp": "" },
                "txs": [],
                "txsInternal": [],
                "logs": [],
                "chainId": "",
                "confirmed": true,
                "retries": 0,
                "tag": "",
                "streamId": "",
                "erc20Approvals": [],
                "erc20Transfers": [],
                "nftTokenApprovals": [],
                "nftApprovals": { "ERC721": [], "ERC1155": [] },
                "nftTransfers": [],
                "nativeBalances": []
            };

            const request = createMockRequest(payload);
            const response = await POST(request);

            expect(response.status).toBe(500);

            const responseData = await response.json();
            expect(responseData).toEqual({
                error: 'Webhook secret not configured'
            });

            // Restore the webhook secret
            process.env.MORALIS_STREAM_SECRET = originalSecret;
        });
    });
});
