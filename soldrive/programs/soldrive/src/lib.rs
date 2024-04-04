use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use spl_token::instruction::mint_to;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct TokenMetadata {
    pub file_id: String,
    pub name: String,
    pub weight: u64,
    pub file_parent_id: String,
    pub cid: String,
    pub typ: String,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct MintLedger {
    pub mint_addresses: Vec<[u8; 32]>, // Store as byte arrays
}

entrypoint!(process_instruction);

/// Processes an instruction.
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Entered process_instruction");

    // Iterating through accounts array to extract accounts.
    let account_info_iter = &mut accounts.iter();

    let mint_account = next_account_info(account_info_iter)?;
    let token_account = next_account_info(account_info_iter)?;
    let metadata_account = next_account_info(account_info_iter)?;
    let mint_authority = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let ledger_account = next_account_info(account_info_iter)?; // Ledger account for storing mint addresses

    // Deserialize the instruction data to `TokenMetadata`.
    let metadata = TokenMetadata::try_from_slice(instruction_data)?;
    msg!("Deserialized metadata: {:?}", metadata);

    // Serialize the `TokenMetadata` and store it in the `metadata_account`.
    metadata.serialize(&mut &mut metadata_account.data.borrow_mut()[..])?;
    msg!("Metadata serialized into the account");

    // Prepare and invoke the mint_to instruction to mint tokens.
    let mint_to_instruction = mint_to(
        token_program.key,
        mint_account.key,
        token_account.key,
        mint_authority.key,
        &[],
        1, // Amount to mint.
    )?;
    msg!("mint_to instruction prepared");

    msg!("Minting token to {}", token_account.key);
    // Invoke the mint_to instruction.
    solana_program::program::invoke(
        &mint_to_instruction,
        &[
            mint_account.clone(),
            token_account.clone(),
            mint_authority.clone(),
            token_program.clone(),
        ],
    )?;

    msg!("mint_to instruction invoked successfully");

    // Update the ledger with the new mint address
    update_ledger(ledger_account, &mint_account.key.to_bytes())?;

    Ok(())
}

/// Updates the ledger with the mint address.
fn update_ledger(ledger_account: &AccountInfo, mint_address_bytes: &[u8; 32]) -> ProgramResult {
    let mut ledger_data = ledger_account.try_borrow_mut_data()?;
    let mut mint_ledger: MintLedger = match MintLedger::try_from_slice(&ledger_data) {
        Ok(ledger) => ledger,
        Err(_) => {
            msg!("Creating new MintLedger structure.");
            MintLedger {
                mint_addresses: Vec::new(),
            }
        }
    };

    mint_ledger.mint_addresses.push(*mint_address_bytes);
    mint_ledger.serialize(&mut &mut ledger_data[..])
        .map_err(|_| ProgramError::Custom(0)) // Use an appropriate error code for your application

    // Note: The error handling here is simplified. You should use or define error codes that make sense for your program.
}
