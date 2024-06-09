import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { BonkSuscription } from "../target/types/bonk_suscription";

describe("bonk-suscription", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.BonkSuscription as Program<BonkSuscription>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
