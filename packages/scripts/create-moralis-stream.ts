// We use Moralis for listening to on-chain events
// One stream is created for all addresses we want to
import dotenv from "dotenv";
import Moralis from "moralis";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.stream.dev") });

// Only needs to listen on Linea, where MetaMask Card payments happen
// https://docs.moralis.io/supported-chains
const chains = [
    // linea mainnet - 59144
    // "0xe708",

    // linea sepolia - 59141
    "0xe705",
];

const tag = process.env.MORALIS_STREAM_TAG!;
const description = `[${tag}] Auto HODL`;

const ERC20TransferEventABI = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                name: "value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
];

const createStream = async () => {
    const host = process.env.AUTO_HODL_BASE_URL;

    // Omit leading slash
    const txUpdatePath = `api/v1/webhooks/moralis`;
    const webhookUrl = `${host}/${txUpdatePath}`;

    const topic = "Transfer(address,address,uint256)";

    const response = await Moralis.Streams.add({
        webhookUrl,
        description,
        tag,
        chains,
        includeNativeTxs: true,
        abi: ERC20TransferEventABI,
        includeContractLogs: true,
        topic0: [topic],
    });

    return response.toJSON().id;
};

const doCreateStream = async () => {
    await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
    });

    await createStream();
};

doCreateStream();