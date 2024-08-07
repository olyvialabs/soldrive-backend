import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolDrive } from "../target/types/sol_drive";

describe("sol-drive", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolDrive as Program<SolDrive>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
