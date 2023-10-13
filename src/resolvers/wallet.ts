import { schemaComposer } from "graphql-compose";
import { WalletTC } from "../types/wallet"
import { WalletService } from "../services/wallet_service";

const WalletResolver = schemaComposer.createResolver({
  name: "Wallet",
  type: WalletTC,
  args: {
    address: "ID!"
  },
  resolve: async({args}) => {
    const { address } = args as { address:string };
    const walletService = new WalletService(address);

    return await walletService.getData();
  }
});

export { WalletResolver }
