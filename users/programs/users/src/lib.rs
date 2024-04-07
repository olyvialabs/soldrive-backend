use borsh::{BorshSerialize, BorshDeserialize};  // Ensure these are the borsh crate's paths
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

// Define your struct with Borsh traits for serialization
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserMetadata {
    pub user_solana: String,
    pub did_public_address: String,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Entered process_instruction");

    // Deserialize your data using the borsh crate directly
    let metadata = UserMetadata::try_from_slice(instruction_data)
        .map_err(|_| solana_program::program_error::ProgramError::InvalidInstructionData)?;
    msg!("Deserialized metadata: {:?}", metadata);

    // Logging the received metadata
    msg!("User Solana Address: {}", metadata.user_solana);
    msg!("DID Public Address: {}", metadata.did_public_address);

    Ok(())
}
