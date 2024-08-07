use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
};

// Define both structs with Borsh traits for serialization
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserMetadata {
    pub user_solana: String,
    pub did_public_address: String,
}

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

// Define an enum to distinguish between different instruction types
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum InstructionType {
    UserMetadata(UserMetadata),
    TokenMetadata(TokenMetadata),
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Entered process_instruction");

    // Deserialize the instruction type
    let instruction = InstructionType::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        InstructionType::UserMetadata(metadata) => {
            msg!("Processing UserMetadata");
            msg!("Deserialized metadata: {:?}", metadata);
            msg!("User Solana Address: {}", metadata.user_solana);
            msg!("DID Public Address: {}", metadata.did_public_address);
        },
        InstructionType::TokenMetadata(metadata) => {
            msg!("Processing TokenMetadata");
            msg!("Deserialized metadata: {:?}", metadata);
            msg!("File ID: {}", metadata.file_id);
            msg!("Name: {}", metadata.name);
            msg!("Weight: {}", metadata.weight);
            msg!("File Parent ID: {}", metadata.file_parent_id);
            msg!("CID: {}", metadata.cid);
            msg!("Type: {}", metadata.typ);
            msg!("From: {}", metadata.from);
            msg!("To: {}", metadata.to);
        },
    }

    Ok(())
}