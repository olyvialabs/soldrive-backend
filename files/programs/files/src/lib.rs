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
pub struct TokenMetadata {
    pub file_id: String,
    pub name: String,
    pub weight: u64,
    pub file_parent_id: String,
    pub cid: String,
    pub typ: String,
    pub from: String,
    pub to: String,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Entered process_instruction");

    // Deserialize your data using the borsh crate directly
    let metadata = TokenMetadata::try_from_slice(instruction_data)
        .map_err(|_| solana_program::program_error::ProgramError::InvalidInstructionData)?;
    msg!("Deserialized metadata: {:?}", metadata);

    // Logging the received metadata
    msg!("File ID: {}", metadata.file_id);
    msg!("Name: {}", metadata.name);
    msg!("Weight: {}", metadata.weight);
    msg!("File Parent ID: {}", metadata.file_parent_id);
    msg!("CID: {}", metadata.cid);
    msg!("Type: {}", metadata.typ);
    msg!("From: {}", metadata.from);
    msg!("To: {}", metadata.to);

    Ok(())
}
